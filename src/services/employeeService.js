import { storageAdapter } from './storage/storageAdapter';
import { INITIAL_USERS } from '../data/mockData';

const USERS_KEY = 'users_db';

export const employeeService = {
  async init() {
    let users = await storageAdapter.get(USERS_KEY);
    if (!users || !Array.isArray(users) || users.length === 0) {
      await storageAdapter.set(USERS_KEY, INITIAL_USERS);
    }
  },

  async getAllEmployees(filters = {}) {
    await this.init();
    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);

    let result = users.map(({ passwordHash, ...safeUser }) => safeUser);

    // Apply Search (Name, Employee ID, Email)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.employeeId?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    // Apply Department filter
    if (filters.department && filters.department !== 'ALL') {
      result = result.filter(u => u.department === filters.department);
    }

    // Apply System Role filter (Employee vs Admin)
    if (filters.role && filters.role !== 'ALL') {
      result = result.filter(u => u.role === filters.role);
    }

    // Apply Status filter (Active vs Inactive)
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(u => u.status === filters.status);
    }

    return result;
  },

  async getEmployeeById(id) {
    await this.init();
    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const user = users.find(u => u.id === id || u.employeeId === id);
    if (!user) throw new Error('Employee not found');
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  async addEmployee(payload) {
    await this.init();
    await new Promise(r => setTimeout(r, 250));

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);

    // Validate email format and uniqueness
    // NOTE: This client-side validation against local cache is sufficient for prototype/demo.
    // TODO: When connecting to real backend API/PostgreSQL/MySQL, this MUST be backed by a UNIQUE database constraint on the email column.
    if (!payload.email || !payload.email.includes('@')) {
      throw new Error('Please enter a valid work email address.');
    }
    const emailExists = users.some(u => u.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (emailExists) {
      throw new Error('An employee with this email address already exists.');
    }

    // Auto-generate or validate Employee ID uniqueness
    let empId = payload.employeeId?.trim();
    if (!empId) {
      const year = new Date().getFullYear();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      empId = `EMP-${year}-${randomSeq}`;
    } else {
      const idExists = users.some(u => u.employeeId.toLowerCase() === empId.toLowerCase());
      if (idExists) {
        throw new Error(`Employee ID "${empId}" is already assigned to another employee.`);
      }
    }

    if (!payload.name || payload.name.trim().length < 2) {
      throw new Error('Employee full name is required (min 2 characters).');
    }
    if (!payload.department) {
      throw new Error('Please select a department.');
    }
    if (!payload.designation) {
      throw new Error('Please enter a job designation.');
    }

    const newEmployee = {
      id: `usr_emp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      employeeId: empId,
      name: payload.name.trim(),
      email: payload.email.trim(),
      role: payload.role || 'Employee', // System Access Role
      designation: payload.designation.trim(), // Job Designation
      department: payload.department.trim(),
      phone: payload.phone?.trim() || '+1 (555) 000-0000',
      emergencyContact: payload.emergencyContact?.trim() || '--',
      address: payload.address?.trim() || '--',
      bio: payload.bio?.trim() || '',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: payload.status || 'Active',
      avatar: payload.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjSPfqm6s5NrbQvqaTWLeZR0p0bKdD3UnsOPV7i1owC5GnH42x4vCa_5-GmjICDSAG5w9gxOGnqyr4iiRGC4gMz8IA7ZbbP9tZSZ6ncB3GgTKirYL3OjI161BRgZbNGmyxOU98vblhCiXoutiigyS_aPY467nlFddJvGBz2H1oA1FIvNYuiuJp4BSgBnGJTQm3uXixNTjeq2zgX2VMtEN0bZcXpAz65IFFs8SuALGt5aYtsS5EuIK5',
      passwordHash: 'Password123!'
    };

    users.push(newEmployee);
    await storageAdapter.set(USERS_KEY, users);

    const { passwordHash, ...safeUser } = newEmployee;
    return safeUser;
  },

  async updateEmployee(id, payload) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Employee not found');

    const current = users[index];
    const updated = {
      ...current,
      name: payload.name ?? current.name,
      department: payload.department ?? current.department,
      designation: payload.designation ?? current.designation,
      role: payload.role ?? current.role,
      phone: payload.phone ?? current.phone,
      emergencyContact: payload.emergencyContact ?? current.emergencyContact,
      address: payload.address ?? current.address,
      bio: payload.bio ?? current.bio,
      status: payload.status ?? current.status
    };

    users[index] = updated;
    await storageAdapter.set(USERS_KEY, users);

    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  },

  async toggleEmployeeStatus(id) {
    await this.init();
    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Employee not found');

    const current = users[index];
    const newStatus = current.status === 'Active' ? 'Inactive' : 'Active';
    users[index].status = newStatus;

    await storageAdapter.set(USERS_KEY, users);
    const { passwordHash, ...safeUser } = users[index];
    return safeUser;
  }
};
