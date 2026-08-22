/**
 * Centralized Seed & Mock Data Repository
 * All employee records are fully populated with salary and document data.
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
    status: 'Active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjSPfqm6s5NrbQvqaTWLeZR0p0bKdD3UnsOPV7i1owC5GnH42x4vCa_5-GmjICDSAG5w9gxOGnqyr4iiRGC4gMz8IA7ZbbP9tZSZ6ncB3GgTKirYL3OjI161BRgZbNGmyxOU98vblhCiXoutiigyS_aPY467nlFddJvGBz2H1oA1FIvNYuiuJp4BSgBnGJTQm3uXixNTjeq2zgX2VMtEN0bZcXpAz65IFFs8SuALGt5aYtsS5EuIK5',
    passwordHash: 'DemoPassword123!',
    salary: {
      basicPay: 45000,
      hra: 12000,
      otherAllowances: 3000,
      taxDeduction: 4500,
      otherDeductions: 1200,
      payPeriod: 'August 2026',
      history: [
        { id: 'PAY-2026-07', period: 'July 2026', netAmount: 54300, status: 'Paid', paidOn: '2026-07-31' },
        { id: 'PAY-2026-06', period: 'June 2026', netAmount: 54300, status: 'Paid', paidOn: '2026-06-30' },
        { id: 'PAY-2026-05', period: 'May 2026', netAmount: 54300, status: 'Paid', paidOn: '2026-05-31' },
        { id: 'PAY-2026-04', period: 'April 2026', netAmount: 53800, status: 'Paid', paidOn: '2026-04-30' }
      ]
    }
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
    status: 'Active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK5M9qKEfR9mIHwQy9dEV-SBNbscJHVF2xdJhNsAvklBTU9RxnotbBez81c8RnTvPreEUJd6GKPj33HMCxtcg-auBSVpXH9rQmMsqmbbF_MXx6JIQrqdbje4UHcU5-yhPh0zczU27WO874L2jLlhASLitcn0zp9HSD8ukhiO9XY8fhV7pki3raJPaiWQQHuIA8syTUi_ovblEo2IBGQuaq2u3gknLGUzs1Lt4YnY0VNA3w3lYfvnBH',
    passwordHash: 'AdminPassword123!',
    twoFactorEnabled: false,
    salary: {
      basicPay: 85000,
      hra: 22000,
      otherAllowances: 8000,
      taxDeduction: 12000,
      otherDeductions: 2500,
      payPeriod: 'August 2026',
      history: [
        { id: 'PAY-2026-07', period: 'July 2026', netAmount: 100500, status: 'Paid', paidOn: '2026-07-31' },
        { id: 'PAY-2026-06', period: 'June 2026', netAmount: 100500, status: 'Paid', paidOn: '2026-06-30' }
      ]
    }
  },
  {
    id: 'usr_emp_003',
    employeeId: 'EMP-2023-0412',
    name: 'Michael Ross',
    email: 'michael.ross@vantage.io',
    role: 'Employee',
    designation: 'Content Strategist',
    department: 'Marketing',
    phone: '+1 (555) 345-6789',
    emergencyContact: '+1 (555) 654-3210 (Brother)',
    address: '128 Market St, Seattle, WA',
    bio: 'Storyteller crafting brand messaging and content architecture.',
    joinDate: 'July 1, 2023',
    status: 'Active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqrF__YdWntm3rQdP_mM9PIWMjTDRTJk2wHTRn08cwJbg52VFBAOaeWcdx7pY1K_4lIicUmy_m1C5Rc5KO7j1oEfIMPL4xB7Cdo21f4nzifwS9LIxYHZ7GWqLirmh1DelKOjQcXGfym9M78158-Sk0Q8y_Y1d3ejv44Qv-Q2LaWEZi0sg3kJ4Q99qYIWdJfBtJbD7DeqFlrbZz9G3DX7P4nULpDw1JKRfwTYQJV9UGi9_LynUrMaRV',
    passwordHash: 'Password123!',
    salary: {
      basicPay: 48000,
      hra: 13000,
      otherAllowances: 4000,
      taxDeduction: 5000,
      otherDeductions: 1500,
      payPeriod: 'August 2026',
      history: [
        { id: 'PAY-2026-07', period: 'July 2026', netAmount: 58500, status: 'Paid', paidOn: '2026-07-31' },
        { id: 'PAY-2026-06', period: 'June 2026', netAmount: 58500, status: 'Paid', paidOn: '2026-06-30' }
      ]
    }
  },
  {
    id: 'usr_emp_004',
    employeeId: 'EMP-2022-0925',
    name: 'David Chen',
    email: 'david.chen@vantage.io',
    role: 'Employee',
    designation: 'Financial Analyst',
    department: 'Finance',
    phone: '+1 (555) 567-8901',
    emergencyContact: '+1 (555) 432-1098 (Sister)',
    address: '450 Pine Ave, Chicago, IL',
    bio: 'Data-driven financial analyst specializing in forecasting and capital allocation.',
    joinDate: 'September 12, 2022',
    status: 'Active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByiQaXQGNT9RnF79cPVlkls24h6e4faYEYE3u6w0PPRm0OlapurICL-jnNsOiv7vRl6MXMBL2kpba4cKp7tKNJbu0_vPoNaxRQNns0Zd5qeLUh8mOjfD6PHLete6ovdn4DIfwmUb6Vm-cwVBYUn5_UAfHK1p5nyu3tv2G3WCc3fllYK7WXByg26aQcN3iz6e-j-oRgRG5H65BtNwBABLeckNHCokXhSq8yBt_jhrq2UPbeEemLRl7T',
    passwordHash: 'Password123!',
    salary: {
      basicPay: 52000,
      hra: 14000,
      otherAllowances: 3500,
      taxDeduction: 5500,
      otherDeductions: 1200,
      payPeriod: 'August 2026',
      history: [
        { id: 'PAY-2026-07', period: 'July 2026', netAmount: 62800, status: 'Paid', paidOn: '2026-07-31' },
        { id: 'PAY-2026-06', period: 'June 2026', netAmount: 62800, status: 'Paid', paidOn: '2026-06-30' }
      ]
    }
  },
  {
    id: 'usr_emp_005',
    employeeId: 'EMP-2024-0118',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@vantage.io',
    role: 'Employee',
    designation: 'Senior Recruiter',
    department: 'People & Culture',
    phone: '+1 (555) 678-9012',
    emergencyContact: '+1 (555) 210-9876 (Mother)',
    address: '88 Austin Blvd, Austin, TX',
    bio: 'Talent acquisition expert focused on engineering and design recruiting.',
    joinDate: 'January 15, 2024',
    status: 'Active',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz0HIhGe2cS9AZNqYGG2Bd5jHbrBG_KbdCyE6NTg48ncxgGYq9oyPyCB6b8VFlxVoVO1HFnpDjOq64Zm5tLhH8KMe_hhu7NCiCcsM0zuH1UDicKPPi0_GlgdCBo0wXdfUv1rSEWtECe1ZdGR3b3AGQWMKwLGKod2vkZ5hsixBEgh6hfC5TQamLpjrOQ6m0MyhAmXSKgLd39fF1K7oj_Aq4G8ERPq75kZMyCPZHCpGMNzSAFgZq-Yu7',
    passwordHash: 'Password123!',
    salary: {
      basicPay: 46000,
      hra: 12500,
      otherAllowances: 2500,
      taxDeduction: 4800,
      otherDeductions: 1000,
      payPeriod: 'August 2026',
      history: [
        { id: 'PAY-2026-07', period: 'July 2026', netAmount: 55200, status: 'Paid', paidOn: '2026-07-31' },
        { id: 'PAY-2026-06', period: 'June 2026', netAmount: 55200, status: 'Paid', paidOn: '2026-06-30' }
      ]
    }
  },
  {
    id: 'usr_emp_006',
    employeeId: 'EMP-2023-0805',
    name: 'Alex Lee',
    email: 'alex.lee@vantage.io',
    role: 'Employee',
    designation: 'Lead UX Researcher',
    department: 'Design',
    phone: '+1 (555) 789-0123',
    emergencyContact: '+1 (555) 109-8765 (Partner)',
    address: '220 Broadway, New York, NY',
    bio: 'Advocating for intuitive design, accessible systems, and user empathy.',
    joinDate: 'August 5, 2023',
    status: 'Inactive',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLqpHbrDVqCRuvmmlvYI6k1y0hBX9cQKOn8yGkzDNPVJEiispBlBGNbKx9De1o6AEiJuOQfVgdI9sigQ4c7wlOWyMMrrzhY1QaNhPZ7tl0l0v378savuzfjqgKePpT8b-yY5XhtXM_GC6vg2zoCSHf9WDxYpIkt1YV36fOWNpCaqQDR85__79sUbRySDCJp4Z_aSHlcwIOpHo-3WY86a251fABhtqsWsGBODyf4LnbNFYgvGCy99dA',
    passwordHash: 'Password123!',
    salary: {
      basicPay: 55000,
      hra: 15000,
      otherAllowances: 4000,
      taxDeduction: 6000,
      otherDeductions: 1400,
      payPeriod: 'August 2026',
      history: [
        { id: 'PAY-2026-07', period: 'July 2026', netAmount: 66600, status: 'Paid', paidOn: '2026-07-31' }
      ]
    }
  }
];

export const INITIAL_LEAVE_BALANCES = {
  usr_emp_001: {
    annual: { total: 20, used: 6, available: 14 },
    sick: { total: 10, used: 2, available: 8 },
    unpaid: { total: 30, used: 0, available: 30 }
  },
  usr_emp_003: {
    annual: { total: 20, used: 4, available: 16 },
    sick: { total: 10, used: 1, available: 9 },
    unpaid: { total: 30, used: 0, available: 30 }
  },
  usr_emp_004: {
    annual: { total: 20, used: 8, available: 12 },
    sick: { total: 10, used: 0, available: 10 },
    unpaid: { total: 30, used: 0, available: 30 }
  },
  usr_emp_005: {
    annual: { total: 20, used: 2, available: 18 },
    sick: { total: 10, used: 3, available: 7 },
    unpaid: { total: 30, used: 0, available: 30 }
  },
  usr_emp_006: {
    annual: { total: 20, used: 10, available: 10 },
    sick: { total: 10, used: 4, available: 6 },
    unpaid: { total: 30, used: 0, available: 30 }
  }
};

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: 'lr_101',
    userId: 'usr_emp_001',
    userName: 'Alex Rivers',
    userEmail: 'alex.morgan@vantage.io',
    userDepartment: 'People & Culture',
    leaveType: 'annual',
    leaveTypeName: 'Annual Leave',
    startDate: '2026-09-10',
    endDate: '2026-09-14',
    durationDays: 3, // Working days (Thu, Fri, Mon)
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
    userName: 'Alex Rivers',
    userEmail: 'alex.morgan@vantage.io',
    userDepartment: 'People & Culture',
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
    userName: 'Alex Rivers',
    userEmail: 'alex.morgan@vantage.io',
    userDepartment: 'People & Culture',
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
    userId: 'usr_emp_003',
    userName: 'Michael Ross',
    userEmail: 'michael.ross@vantage.io',
    userDepartment: 'Marketing',
    leaveType: 'annual',
    leaveTypeName: 'Annual Leave',
    startDate: '2026-09-01',
    endDate: '2026-09-04',
    durationDays: 4,
    reason: 'Annual family reunion trip.',
    attachmentName: null,
    attachmentUrl: null,
    status: 'Pending',
    appliedDate: '2026-08-21',
    rejectionReason: null
  },
  {
    id: 'lr_105',
    userId: 'usr_emp_004',
    userName: 'David Chen',
    userEmail: 'david.chen@vantage.io',
    userDepartment: 'Finance',
    leaveType: 'sick',
    leaveTypeName: 'Sick Leave',
    startDate: '2026-08-25',
    endDate: '2026-08-26',
    durationDays: 2,
    reason: 'Dental surgery and follow-up recovery.',
    attachmentName: 'dentist_note.pdf',
    attachmentUrl: null,
    status: 'Pending',
    appliedDate: '2026-08-22',
    rejectionReason: null
  }
];

export const INITIAL_SETTINGS = {
  organization: {
    companyName: 'Vantage Technologies Inc.',
    portalTitle: 'Vantage Employee Suite',
    supportEmail: 'support@vantage.io',
    timezone: 'America/Los_Angeles (PST)',
    currency: 'USD ($)',
    fiscalYearStart: 'January 1'
  },
  attendance: {
    expectedCheckInTime: '09:00',
    lateGracePeriodMinutes: 15,
    standardDailyWorkHours: 8,
    halfDayWorkHours: 4,
    enableAutoCheckOut: false
  },
  leavePolicyDefaults: {
    defaultAnnualAllowance: 20,
    defaultSickAllowance: 10,
    defaultUnpaidAllowance: 30,
    allowNegativeBalance: false,
    requireAttachmentOverDays: 3,
    enableRollover: true,
    maxRolloverDays: 5
  },
  notifications: {
    emailOnLeaveRequest: true,
    emailOnApproval: true,
    dailyAttendanceDigest: true,
    weeklyTeamReport: false,
    systemAlerts: true
  }
};

export const INITIAL_DOCUMENTS = {
  usr_emp_001: [
    {
      id: 'doc_1',
      name: 'W-4_Tax_Withholding_2026.pdf',
      type: 'Tax Document',
      fileType: 'application/pdf',
      size: '245 KB',
      uploadedDate: '2026-01-15'
    },
    {
      id: 'doc_2',
      name: 'Employment_Agreement_Vantage.pdf',
      type: 'Contract',
      fileType: 'application/pdf',
      size: '1.2 MB',
      uploadedDate: '2022-03-15'
    },
    {
      id: 'doc_3',
      name: 'Health_Benefits_Enrollment_Summary.pdf',
      type: 'Benefits',
      fileType: 'application/pdf',
      size: '512 KB',
      uploadedDate: '2026-02-01'
    }
  ],
  usr_adm_002: [
    {
      id: 'doc_adm_1',
      name: 'Executive_Compensation_Plan.pdf',
      type: 'Contract',
      fileType: 'application/pdf',
      size: '1.8 MB',
      uploadedDate: '2021-01-10'
    },
    {
      id: 'doc_adm_2',
      name: 'Confidentiality_&_IP_Assignment.pdf',
      type: 'Legal',
      fileType: 'application/pdf',
      size: '420 KB',
      uploadedDate: '2021-01-10'
    }
  ]
};

export const INITIAL_ACTIVE_SESSIONS = {
  usr_adm_002: [
    {
      id: 'sess_1',
      device: 'MacBook Pro 16" — Chrome (macOS 14.5)',
      ipAddress: '192.168.1.104 (San Francisco, US)',
      lastActive: 'Active right now',
      isCurrent: true
    },
    {
      id: 'sess_2',
      device: 'iPhone 15 Pro — Vantage Mobile App',
      ipAddress: '172.56.21.89 (San Francisco, US)',
      lastActive: '2 hours ago',
      isCurrent: false
    }
  ],
  usr_emp_001: [
    {
      id: 'sess_emp_1',
      device: 'Windows 11 PC — Edge Browser',
      ipAddress: '192.168.1.145 (Springfield, US)',
      lastActive: 'Active right now',
      isCurrent: true
    }
  ]
};


export const generateInitialAttendance = (userId) => {
  const currentYear = 2026;
  const records = [];

  for (let day = 1; day <= 22; day++) {
    const d = new Date(Date.UTC(currentYear, 7, day));
    const dayOfWeek = d.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = d.toISOString().split('T')[0];
    
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

  return records;
};
