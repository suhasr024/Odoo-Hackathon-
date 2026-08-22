/**
 * Configurable Leave Policies
 * Defines business rules for date selections, balance deductions, and advance notice.
 */
export const LEAVE_POLICIES = {
  annual: {
    id: 'annual',
    name: 'Annual Leave',
    allowPastDates: false,
    requiresBalance: true,
    defaultAllowance: 20,
    unit: 'Days',
    description: 'Standard paid time off for vacations and personal leisure.'
  },
  sick: {
    id: 'sick',
    name: 'Sick Leave',
    allowPastDates: true, // Employees can report sick leave retroactively
    requiresBalance: true,
    defaultAllowance: 10,
    unit: 'Days',
    description: 'Medical and healthcare absences.'
  },
  unpaid: {
    id: 'unpaid',
    name: 'Unpaid Leave',
    allowPastDates: false,
    requiresBalance: true, // Option A: Capped at yearly organizational allowance (default: 30 days)
    defaultAllowance: 30,
    unit: 'Days',
    description: 'Time off without compensation when other balances are exhausted.'
  }
};

export const getLeavePolicy = (leaveType) => {
  return LEAVE_POLICIES[leaveType?.toLowerCase()] || null;
};
