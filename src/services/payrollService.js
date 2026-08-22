import { jsPDF } from 'jspdf';
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
      department: users[index].department,
      designation: users[index].designation,
      avatar: users[index].avatar,
      status: users[index].status,
      ...computeSalaryTotals(updatedSalary)
    };
  },

  async getPayrollHistory(employeeId) {
    const salaryData = await this.getSalaryByEmployeeId(employeeId);
    return salaryData.history || [];
  },

  downloadSalarySlip(employee, salaryData, periodId = 'PAY-2026-08') {
    const period = salaryData.payPeriod || 'August 2026';
    const basic = Number(salaryData.basicPay) || 0;
    const hra = Number(salaryData.hra) || 0;
    const allowances = Number(salaryData.otherAllowances) || 0;
    const tax = Number(salaryData.taxDeduction) || 0;
    const otherDeductions = Number(salaryData.otherDeductions) || 0;

    const gross = basic + hra + allowances;
    const totalDeductions = tax + otherDeductions;
    const net = Math.max(0, gross - totalDeductions);

    // Create jsPDF document: A4 format (210 x 297 mm)
    const doc = new jsPDF('p', 'mm', 'a4');

    // 1. Header Band
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('VANTAGE TECHNOLOGIES INC.', 105, 22, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('CONFIDENTIAL SALARY PAYSLIP', 105, 28, { align: 'center' });

    // Decorative Horizontal Line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(20, 33, 190, 33);

    // 2. Info Block (Two-column layout)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(20, 37, 170, 32, 2, 2, 'F');

    // Left Column Info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Employee Name:', 25, 45);
    doc.text('Employee ID:', 25, 52);
    doc.text('Designation:', 25, 59);
    doc.text('Department:', 25, 66);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${employee.name || 'Alex Rivers'}`, 60, 45);
    doc.text(`${employee.employeeId || 'EMP-2024-0891'}`, 60, 52);
    doc.text(`${employee.designation || 'Specialist'}`, 60, 59);
    doc.text(`${employee.department || 'Operations'}`, 60, 66);

    // Right Column Info
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Pay Period:', 115, 45);
    doc.text('Reference No:', 115, 52);
    doc.text('Payment Mode:', 115, 59);
    doc.text('Payment Status:', 115, 66);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${period}`, 148, 45);
    doc.text(`${periodId}`, 148, 52);
    doc.text('Direct Deposit', 148, 59);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.setFont('helvetica', 'bold');
    doc.text('Paid', 148, 66);

    // 3. Earnings Table
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(20, 75, 170, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('EARNINGS DESCRIPTION', 25, 80);
    doc.text('AMOUNT (INR)', 185, 80, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    doc.text('Basic Salary', 25, 90);
    doc.text(`Rs. ${basic.toLocaleString('en-IN')}`, 185, 90, { align: 'right' });

    doc.text('House Rent Allowance (HRA)', 25, 98);
    doc.text(`Rs. ${hra.toLocaleString('en-IN')}`, 185, 98, { align: 'right' });

    doc.text('Other Allowances', 25, 106);
    doc.text(`Rs. ${allowances.toLocaleString('en-IN')}`, 185, 106, { align: 'right' });

    // Gross Total Bar
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 111, 170, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL GROSS SALARY', 25, 116);
    doc.text(`Rs. ${gross.toLocaleString('en-IN')}`, 185, 116, { align: 'right' });

    // 4. Deductions Table
    doc.setFillColor(241, 245, 249);
    doc.rect(20, 126, 170, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('DEDUCTIONS DESCRIPTION', 25, 131);
    doc.text('AMOUNT (INR)', 185, 131, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    doc.text('Income Tax (TDS)', 25, 141);
    doc.text(`Rs. ${tax.toLocaleString('en-IN')}`, 185, 141, { align: 'right' });

    doc.text('Other Deductions (Benefits / Insurance)', 25, 149);
    doc.text(`Rs. ${otherDeductions.toLocaleString('en-IN')}`, 185, 149, { align: 'right' });

    // Total Deductions Bar
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 154, 170, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL DEDUCTIONS', 25, 159);
    doc.text(`Rs. ${totalDeductions.toLocaleString('en-IN')}`, 185, 159, { align: 'right' });

    // 5. Net Disbursed Highlight Banner
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(99, 102, 241); // indigo-500
    doc.setLineWidth(0.7);
    doc.roundedRect(20, 172, 170, 18, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text('NET DISBURSED AMOUNT', 28, 183);

    doc.setFontSize(15);
    doc.setTextColor(30, 27, 75); // indigo-950
    doc.text(`Rs. ${net.toLocaleString('en-IN')}`, 182, 184, { align: 'right' });

    // 6. Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 262, 190, 262);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('This is a computer-generated document and does not require a physical signature.', 105, 268, { align: 'center' });
    doc.text(`Generated via Vantage Employee Suite HRMS Portal • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 105, 273, { align: 'center' });

    // Trigger PDF download
    const filename = `Payslip_${(employee.employeeId || 'EMP').replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
    return true;
  }
};
