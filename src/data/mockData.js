/**
 * Centralized Seed & Mock Data Repository
 * User-specific information is defined here rather than hardcoded in UI components.
 */

export const INITIAL_USERS = [
  {
    id: 'usr_emp_001',
    employeeId: 'EMP-2024-0891',
    name: 'Alex Rivers',
    email: 'alex.morgan@vantage.io',
    role: 'Employee',
    designation: 'HR Specialist',
    department: 'People & Culture',
    phone: '+1 (555) 234-5678',
    emergencyContact: '+1 (555) 987-6543 (Partner)',
    address: '742 Evergreen Terrace, Suite 4B, Springfield, OR',
    bio: 'HR Specialist passionate about employee wellbeing, talent development, and culture building.',
    joinDate: 'March 15, 2022',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjSPfqm6s5NrbQvqaTWLeZR0p0bKdD3UnsOPV7i1owC5GnH42x4vCa_5-GmjICDSAG5w9gxOGnqyr4iiRGC4gMz8IA7ZbbP9tZSZ6ncB3GgTKirYL3OjI161BRgZbNGmyxOU98vblhCiXoutiigyS_aPY467nlFddJvGBz2H1oA1FIvNYuiuJp4BSgBnGJTQm3uXixNTjeq2zgX2VMtEN0bZcXpAz65IFFs8SuALGt5aYtsS5EuIK5',
    passwordHash: 'DemoPassword123!'
  },
  {
    id: 'usr_adm_002',
    employeeId: 'EMP-2021-0104',
    name: 'Sarah Jenkins',
    email: 'sarah.admin@vantage.io',
    role: 'Admin',
    designation: 'VP of People Operations',
    department: 'Executive Leadership',
    phone: '+1 (555) 456-7890',
    emergencyContact: '+1 (555) 321-0987 (Spouse)',
    address: '100 Financial Center Blvd, San Francisco, CA',
    bio: 'Leading strategic HR, organizational design, and enterprise workforce management.',
    joinDate: 'January 10, 2021',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK5M9qKEfR9mIHwQy9dEV-SBNbscJHVF2xdJhNsAvklBTU9RxnotbBez81c8RnTvPreEUJd6GKPj33HMCxtcg-auBSVpXH9rQmMsqmbbF_MXx6JIQrqdbje4UHcU5-yhPh0zczU27WO874L2jLlhASLitcn0zp9HSD8ukhiO9XY8fhV7pki3raJPaiWQQHuIA8syTUi_ovblEo2IBGQuaq2u3gknLGUzs1Lt4YnY0VNA3w3lYfvnBH',
    passwordHash: 'AdminPassword123!'
  }
];

export const INITIAL_LEAVE_BALANCES = {
  usr_emp_001: {
    annual: { total: 20, used: 6, available: 14 },
    sick: { total: 10, used: 2, available: 8 },
    unpaid: { total: 30, used: 0, available: 30 }
  }
};

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: 'lr_101',
    userId: 'usr_emp_001',
    leaveType: 'annual',
    leaveTypeName: 'Annual Leave',
    startDate: '2026-09-10',
    endDate: '2026-09-14',
    durationDays: 5,
    reason: 'Family vacation and personal downtime.',
    attachmentName: 'itinerary_booking.pdf',
    attachmentUrl: null,
    status: 'Approved',
    appliedDate: '2026-08-15',
    rejectionReason: null
  },
  {
    id: 'lr_102',
    userId: 'usr_emp_001',
    leaveType: 'sick',
    leaveTypeName: 'Sick Leave',
    startDate: '2026-08-04',
    endDate: '2026-08-05',
    durationDays: 2,
    reason: 'Severe seasonal flu with medical consultation and rest advised.',
    attachmentName: 'medical_prescription.png',
    attachmentUrl: null,
    status: 'Approved',
    appliedDate: '2026-08-04',
    rejectionReason: null
  },
  {
    id: 'lr_103',
    userId: 'usr_emp_001',
    leaveType: 'annual',
    leaveTypeName: 'Annual Leave',
    startDate: '2026-10-01',
    endDate: '2026-10-03',
    durationDays: 3,
    reason: 'Attending an out-of-state wedding ceremony.',
    attachmentName: null,
    attachmentUrl: null,
    status: 'Pending',
    appliedDate: '2026-08-20',
    rejectionReason: null
  },
  {
    id: 'lr_104',
    userId: 'usr_emp_001',
    leaveType: 'unpaid',
    leaveTypeName: 'Unpaid Leave',
    startDate: '2026-07-12',
    endDate: '2026-07-15',
    durationDays: 4,
    reason: 'Relocating to new residential address.',
    attachmentName: null,
    attachmentUrl: null,
    status: 'Rejected',
    appliedDate: '2026-07-01',
    rejectionReason: 'High workload period and critical sprint deadlines during this week.'
  }
];

export const generateInitialAttendance = (userId) => {
  const currentYear = 2026;
  const records = [];

  // Generate records for August 2026 (Month 7, 0-indexed)
  for (let day = 1; day <= 21; day++) {
    const d = new Date(Date.UTC(currentYear, 7, day));
    const dayOfWeek = d.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const dateStr = d.toISOString().split('T')[0];
    
    // Sample distribution of statuses
    if (day === 4 || day === 5) {
      records.push({
        id: `att_${dateStr}_${userId}`,
        userId,
        date: dateStr,
        checkIn: null,
        checkOut: null,
        totalHours: '0h 0m',
        status: 'On Leave'
      });
    } else if (day === 12) {
      records.push({
        id: `att_${dateStr}_${userId}`,
        userId,
        date: dateStr,
        checkIn: `${dateStr}T09:25:00.000Z`,
        checkOut: `${dateStr}T17:30:00.000Z`,
        totalHours: '8h 5m',
        status: 'Late'
      });
    } else if (day === 18) {
      records.push({
        id: `att_${dateStr}_${userId}`,
        userId,
        date: dateStr,
        checkIn: `${dateStr}T09:00:00.000Z`,
        checkOut: `${dateStr}T13:00:00.000Z`,
        totalHours: '4h 0m',
        status: 'Half Day'
      });
    } else {
      records.push({
        id: `att_${dateStr}_${userId}`,
        userId,
        date: dateStr,
        checkIn: `${dateStr}T08:55:00.000Z`,
        checkOut: `${dateStr}T17:15:00.000Z`,
        totalHours: '8h 20m',
        status: 'Present'
      });
    }
  }

  // Also add July 2026 for month navigation test
  for (let day = 1; day <= 28; day++) {
    const d = new Date(Date.UTC(currentYear, 6, day));
    const dayOfWeek = d.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = d.toISOString().split('T')[0];
    records.push({
      id: `att_${dateStr}_${userId}`,
      userId,
      date: dateStr,
      checkIn: `${dateStr}T08:50:00.000Z`,
      checkOut: `${dateStr}T17:10:00.000Z`,
      totalHours: '8h 20m',
      status: 'Present'
    });
  }

  return records;
};
