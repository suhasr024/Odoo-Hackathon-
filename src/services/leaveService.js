import { storageAdapter } from './storage/storageAdapter';
import { INITIAL_LEAVE_BALANCES, INITIAL_LEAVE_REQUESTS } from '../data/mockData';
import { getLeavePolicy } from '../config/leavePolicy';

const LEAVE_REQUESTS_KEY = 'leave_requests_db';
const LEAVE_BALANCES_KEY = 'leave_balances_db';

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
    // Sort descending by appliedDate
    userRequests.sort((a, b) => new Date(b.appliedDate || b.startDate) - new Date(a.appliedDate || a.startDate));
    return userRequests;
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

    // Check balance if balance-controlled
    if (policy.requiresBalance) {
      const balances = await this.getLeaveBalances(userId);
      const available = balances[leaveType]?.available || 0;
      if (durationDays > available) {
        throw new Error(`You only have ${available} ${policy.name} days remaining.`);
      }
    }

    const newRequest = {
      id: `lr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      leaveType,
      leaveTypeName: policy.name,
      startDate,
      endDate,
      durationDays,
      reason: reason.trim(),
      attachmentName: attachmentName || null,
      attachmentUrl: attachmentUrl || null,
      status: 'Pending', // Initial status strictly Pending
      appliedDate: new Date().toISOString().split('T')[0],
      rejectionReason: null
    };

    const allRequests = await storageAdapter.get(LEAVE_REQUESTS_KEY, INITIAL_LEAVE_REQUESTS);
    allRequests.unshift(newRequest);
    await storageAdapter.set(LEAVE_REQUESTS_KEY, allRequests);

    return newRequest;
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

    // Update status to Cancelled without deleting
    allRequests[index] = {
      ...request,
      status: 'Cancelled',
      cancelledDate: new Date().toISOString().split('T')[0]
    };

    await storageAdapter.set(LEAVE_REQUESTS_KEY, allRequests);
    return allRequests[index];
  }
};
