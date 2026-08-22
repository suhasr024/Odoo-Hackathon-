import { storageAdapter } from './storage/storageAdapter';
import { INITIAL_LEAVE_BALANCES, INITIAL_LEAVE_REQUESTS, INITIAL_USERS } from '../data/mockData';
import { getLeavePolicy } from '../config/leavePolicy';
import { attendanceService } from './attendanceService';
import { notificationService } from './notificationService';

const LEAVE_REQUESTS_KEY = 'leave_requests_db';
const LEAVE_BALANCES_KEY = 'leave_balances_db';
const USERS_KEY = 'users_db';

export const leaveService = {
  async init() {
    let requests = await storageAdapter.get(LEAVE_REQUESTS_KEY);
    if (!requests || !Array.isArray(requests)) {
      await storageAdapter.set(LEAVE_REQUESTS_KEY, INITIAL_LEAVE_REQUESTS);
    }
    let balances = await storageAdapter.get(LEAVE_BALANCES_KEY);
    if (!balances) {
      await storageAdapter.set(LEAVE_BALANCES_KEY, INITIAL_LEAVE_BALANCES);
    }
  },

  async getLeaveBalances(userId) {
    await this.init();
    const allBalances = await storageAdapter.get(LEAVE_BALANCES_KEY, INITIAL_LEAVE_BALANCES);
    return allBalances[userId] || {
      annual: { total: 20, used: 0, available: 20 },
      sick: { total: 10, used: 0, available: 10 },
      unpaid: { total: 30, used: 0, available: 30 }
    };
  },

  async getLeaveRequests(userId) {
    await this.init();
    const allRequests = await storageAdapter.get(LEAVE_REQUESTS_KEY, INITIAL_LEAVE_REQUESTS);
    const userRequests = allRequests.filter(r => r.userId === userId);
    userRequests.sort((a, b) => new Date(b.appliedDate || b.startDate) - new Date(a.appliedDate || a.startDate));
    return userRequests;
  },

  async getAllLeaveRequests() {
    await this.init();
    const allRequests = await storageAdapter.get(LEAVE_REQUESTS_KEY, INITIAL_LEAVE_REQUESTS);
    allRequests.sort((a, b) => new Date(b.appliedDate || b.startDate) - new Date(a.appliedDate || a.startDate));
    return allRequests;
  },

  async applyForLeave(userId, payload) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));

    const { leaveType, startDate, endDate, durationDays, reason, attachmentName, attachmentUrl } = payload;
    const policy = getLeavePolicy(leaveType);

    if (!policy) {
      throw new Error('Please select a valid leave type.');
    }

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required.');
    }

    if (new Date(endDate) < new Date(startDate)) {
      throw new Error('End date cannot be earlier than start date.');
    }

    if (!reason || reason.trim().length < 10) {
      throw new Error('Reason is required and must be at least 10 characters.');
    }
    if (reason.trim().length > 500) {
      throw new Error('Reason cannot exceed 500 characters.');
    }

    if (policy.requiresBalance) {
      const balances = await this.getLeaveBalances(userId);
      const available = balances[leaveType]?.available || 0;
      if (durationDays > available) {
        throw new Error(`You only have ${available} ${policy.name} days remaining.`);
      }
    }

    // Get user info for admin request display
    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const user = users.find(u => u.id === userId);

    const newRequest = {
      id: `lr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      userName: user ? user.name : 'Alex Rivers',
      userEmail: user ? user.email : 'employee@vantage.io',
      userDepartment: user ? user.department : 'General',
      leaveType,
      leaveTypeName: policy.name,
      startDate,
      endDate,
      durationDays,
      reason: reason.trim(),
      attachmentName: attachmentName || null,
      attachmentUrl: attachmentUrl || null,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      rejectionReason: null
    };

    const allRequests = await storageAdapter.get(LEAVE_REQUESTS_KEY, INITIAL_LEAVE_REQUESTS);
    allRequests.unshift(newRequest);
    await storageAdapter.set(LEAVE_REQUESTS_KEY, allRequests);

    // Notify admins of new leave application
    const adminUser = users.find(u => u.role === 'Admin');
    if (adminUser) {
      await notificationService.createNotification({
        userId: adminUser.id,
        title: 'New Leave Request',
        message: `${newRequest.userName} applied for ${policy.name} (${startDate} to ${endDate}).`,
        type: 'leave_submitted',
        link: '/admin/leaves'
      });
    }

    return newRequest;
  },

  async approveLeaveRequest(requestId) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));

    const allRequests = await storageAdapter.get(LEAVE_REQUESTS_KEY, INITIAL_LEAVE_REQUESTS);
    const index = allRequests.findIndex(r => r.id === requestId);

    if (index === -1) {
      throw new Error('Leave request not found.');
    }

    const request = allRequests[index];
    // State machine check: only Pending can be approved
    if (request.status !== 'Pending') {
      throw new Error(`Cannot approve a request with status "${request.status}". Only Pending requests can be approved.`);
    }

    // Deduct leave balance once
    const allBalances = await storageAdapter.get(LEAVE_BALANCES_KEY, INITIAL_LEAVE_BALANCES);
    const userBalance = allBalances[request.userId] || {
      annual: { total: 20, used: 0, available: 20 },
      sick: { total: 10, used: 0, available: 10 },
      unpaid: { total: 30, used: 0, available: 30 }
    };

    const policy = getLeavePolicy(request.leaveType);
    if (policy && policy.requiresBalance && userBalance[request.leaveType]) {
      userBalance[request.leaveType].used += request.durationDays;
      userBalance[request.leaveType].available = Math.max(
        0,
        userBalance[request.leaveType].total - userBalance[request.leaveType].used
      );
      allBalances[request.userId] = userBalance;
      await storageAdapter.set(LEAVE_BALANCES_KEY, allBalances);
    }

    // Sync Attendance: Mark attendance records as 'On Leave' for the approved date range
    await attendanceService.markLeaveAttendance(
      request.userId,
      request.startDate,
      request.endDate,
      request.leaveTypeName
    );

    allRequests[index] = {
      ...request,
      status: 'Approved',
      approvedDate: new Date().toISOString().split('T')[0]
    };

    await storageAdapter.set(LEAVE_REQUESTS_KEY, allRequests);

    // Notify employee of approval
    await notificationService.createNotification({
      userId: request.userId,
      title: 'Leave Request Approved',
      message: `Your ${request.leaveTypeName} request for ${request.startDate} to ${request.endDate} was approved.`,
      type: 'leave_approved',
      link: '/leave-requests'
    });

    return allRequests[index];
  },

  async rejectLeaveRequest(requestId, rejectionReason) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));

    if (!rejectionReason || rejectionReason.trim().length < 5) {
      throw new Error('Rejection reason is required (minimum 5 characters).');
    }

    const allRequests = await storageAdapter.get(LEAVE_REQUESTS_KEY, INITIAL_LEAVE_REQUESTS);
    const index = allRequests.findIndex(r => r.id === requestId);

    if (index === -1) {
      throw new Error('Leave request not found.');
    }

    const request = allRequests[index];
    if (request.status !== 'Pending') {
      throw new Error(`Cannot reject a request with status "${request.status}". Only Pending requests can be rejected.`);
    }

    allRequests[index] = {
      ...request,
      status: 'Rejected',
      rejectionReason: rejectionReason.trim(),
      rejectedDate: new Date().toISOString().split('T')[0]
    };

    await storageAdapter.set(LEAVE_REQUESTS_KEY, allRequests);

    // Notify employee of rejection with reason
    await notificationService.createNotification({
      userId: request.userId,
      title: 'Leave Request Declined',
      message: `Your ${request.leaveTypeName} request was rejected: "${rejectionReason.trim()}".`,
      type: 'leave_rejected',
      link: '/leave-requests'
    });

    return allRequests[index];
  },

  async cancelLeaveRequest(userId, requestId) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));

    const allRequests = await storageAdapter.get(LEAVE_REQUESTS_KEY, INITIAL_LEAVE_REQUESTS);
    const index = allRequests.findIndex(r => r.id === requestId && r.userId === userId);

    if (index === -1) {
      throw new Error('Leave request not found.');
    }

    const request = allRequests[index];
    if (request.status !== 'Pending') {
      throw new Error(`Cannot cancel a leave request with status "${request.status}". Only Pending requests can be cancelled.`);
    }

    allRequests[index] = {
      ...request,
      status: 'Cancelled',
      cancelledDate: new Date().toISOString().split('T')[0]
    };

    await storageAdapter.set(LEAVE_REQUESTS_KEY, allRequests);
    return allRequests[index];
  }
};
