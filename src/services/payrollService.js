import { storageAdapter } from './storage/storageAdapter';
import { INITIAL_USERS } from '../data/mockData';

const USERS_KEY = 'users_db';

export const computeSalaryTotals = (salary) => {
  if (!salary) {
    return {
      basicPay: 0,
      hra: 0,
      otherAllowances: 0,
      taxDeduction: 0,
      otherDeductions: 0,
      grossSalary: 0,
      netSalary: 0,
      payPeriod: 'August 2026',
      history: []
    };
  }

  const basicPay = Number(salary.basicPay) || 0;
  const hra = Number(salary.hra) || 0;
  const otherAllowances = Number(salary.otherAllowances) || 0;
  const taxDeduction = Number(salary.taxDeduction) || 0;
  const otherDeductions = Number(salary.otherDeductions) || 0;

  const grossSalary = basicPay + hra + otherAllowances;
  const netSalary = Math.max(0, grossSalary - taxDeduction - otherDeductions);

  return {
    ...salary,
    basicPay,
    hra,
    otherAllowances,
    taxDeduction,
    otherDeductions,
    grossSalary,
    netSalary,
    payPeriod: salary.payPeriod || 'August 2026',
    history: salary.history || []
  };
};

export const payrollService = {
  async init() {
    let users = await storageAdapter.get(USERS_KEY);
    if (!users || !Array.isArray(users)) {
      await storageAdapter.set(USERS_KEY, INITIAL_USERS);
    }
  },

  async getSalaryByEmployeeId(employeeId) {
    await this.init();
    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const user = users.find(u => u.id === employeeId || u.employeeId === employeeId);

    if (!user) {
      throw new Error('Employee not found');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        employeeId: user.employeeId,
        department: user.department,
        designation: user.designation,
        avatar: user.avatar
      },
      ...computeSalaryTotals(user.salary)
    };
  },

  async getAllSalaries() {
    await this.init();
    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);

    return users.map(u => ({
      userId: u.id,
      name: u.name,
      employeeId: u.employeeId,
      department: u.department,
      designation: u.designation,
      avatar: u.avatar,
      status: u.status,
      ...computeSalaryTotals(u.salary)
    }));
  },

  async updateSalary(employeeId, payload) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const index = users.findIndex(u => u.id === employeeId || u.employeeId === employeeId);

    if (index === -1) {
      throw new Error('Employee not found');
    }

    const currentSalary = users[index].salary || {};
    const updatedSalary = {
      ...currentSalary,
      basicPay: Number(payload.basicPay) || 0,
      hra: Number(payload.hra) || 0,
      otherAllowances: Number(payload.otherAllowances) || 0,
      taxDeduction: Number(payload.taxDeduction) || 0,
      otherDeductions: Number(payload.otherDeductions) || 0,
      payPeriod: payload.payPeriod || currentSalary.payPeriod || 'August 2026'
    };

    users[index].salary = updatedSalary;
    await storageAdapter.set(USERS_KEY, users);

    return {
      userId: users[index].id,
      name: users[index].name,
      employeeId: users[index].employeeId,
      ...computeSalaryTotals(updatedSalary)
    };
  },

  async getPayrollHistory(employeeId) {
    const salaryData = await this.getSalaryByEmployeeId(employeeId);
    return salaryData.history || [];
  },

  downloadSalarySlip(employee, salaryData, periodId = 'PAY-2026-08') {
    const period = salaryData.payPeriod || 'August 2026';
    const gross = salaryData.grossSalary || (salaryData.basicPay + salaryData.hra + salaryData.otherAllowances);
    const net = salaryData.netSalary || (gross - salaryData.taxDeduction - salaryData.otherDeductions);

    const slipContent = `
============================================================
              VANTAGE TECHNOLOGIES INC.
              CONFIDENTIAL SALARY PAYSLIP
============================================================
Pay Period:        ${period} (Ref: ${periodId})
Employee Name:     ${employee.name}
Employee ID:       ${employee.employeeId}
Department:        ${employee.department}
Designation:       ${employee.designation}
Payment Status:    Paid (Direct Deposit)
------------------------------------------------------------
EARNINGS:
  Basic Salary:                 $${Number(salaryData.basicPay).toLocaleString()}
  House Rent Allowance (HRA):   $${Number(salaryData.hra).toLocaleString()}
  Other Allowances:             $${Number(salaryData.otherAllowances).toLocaleString()}
------------------------------------------------------------
  TOTAL GROSS SALARY:           $${Number(gross).toLocaleString()}
------------------------------------------------------------
DEDUCTIONS:
  Income Tax (TDS / Federal):   $${Number(salaryData.taxDeduction).toLocaleString()}
  Other Deductions (Benefits):  $${Number(salaryData.otherDeductions).toLocaleString()}
------------------------------------------------------------
  TOTAL DEDUCTIONS:             $${Number(salaryData.taxDeduction + salaryData.otherDeductions).toLocaleString()}
============================================================
  NET DISBURSED AMOUNT:         $${Number(net).toLocaleString()}
============================================================
Generated via Vantage Employee Suite HRMS Portal.
This is a computer-generated document and requires no signature.
`;

    const blob = new Blob([slipContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${employee.employeeId}_${period.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
};
