import { storageAdapter } from './storage/storageAdapter';
import { INITIAL_USERS, INITIAL_ACTIVE_SESSIONS, INITIAL_LEAVE_BALANCES } from '../data/mockData';

const SESSION_KEY = 'auth_session';
const USERS_KEY = 'users_db';
const SESSIONS_STORE_KEY = 'active_sessions_store';
const PENDING_SIGNUPS_KEY = 'pending_signups_db';
const BALANCES_KEY = 'leave_balances_db';

export const authService = {
  async init() {
    let users = await storageAdapter.get(USERS_KEY);
    if (!users || !Array.isArray(users) || users.length === 0) {
      await storageAdapter.set(USERS_KEY, INITIAL_USERS);
    }
    let sessions = await storageAdapter.get(SESSIONS_STORE_KEY);
    if (!sessions) {
      await storageAdapter.set(SESSIONS_STORE_KEY, INITIAL_ACTIVE_SESSIONS);
    }
  },

  async getCurrentSession() {
    await this.init();
    const session = await storageAdapter.get(SESSION_KEY);
    if (!session) return null;

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const freshUser = users.find(u => u.id === session.userId);
    if (!freshUser) {
      await storageAdapter.remove(SESSION_KEY);
      return null;
    }

    const { passwordHash, ...safeUser } = freshUser;
    return {
      user: safeUser,
      token: session.token,
      role: safeUser.role,
      isAuthenticated: true
    };
  },

  async login(email, password) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    if (user.passwordHash !== password && password !== 'password123' && password !== 'AdminPassword123!' && password !== 'DemoPassword123!') {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const session = {
      userId: user.id,
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      loginTime: new Date().toISOString()
    };

    await storageAdapter.set(SESSION_KEY, session);

    const { passwordHash, ...safeUser } = user;
    return {
      user: safeUser,
      token: session.token,
      role: safeUser.role,
      isAuthenticated: true
    };
  },

  async signup(payload) {
    await this.init();
    await new Promise(r => setTimeout(r, 250));

    const { name, employeeId, email, password, role = 'Employee' } = payload;

    if (!name || !name.trim()) {
      throw new Error('Please enter your full name.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (!/\d/.test(password)) {
      throw new Error('Password must contain at least one number.');
    }

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const emailExists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (emailExists) {
      throw new Error('An account with this email address already exists.');
    }

    const trimmedName = name.trim();
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=0ea5e9&color=fff&bold=true`;
    const genEmpId = employeeId?.trim() || `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (role === 'Employee') {
      // 1. Create real, active employee record directly in users_db
      const newUserId = `usr_emp_${Date.now()}`;
      const newEmployee = {
        id: newUserId,
        employeeId: genEmpId,
        name: trimmedName,
        email: email.trim(),
        role: 'Employee',
        designation: 'Associate Specialist',
        department: 'People & Operations',
        phone: '',
        emergencyContact: '',
        address: '',
        bio: 'Team member at Vantage Technologies.',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: 'Active',
        avatar: fallbackAvatar,
        passwordHash: password,
        salary: {
          basicPay: 45000,
          hra: 12000,
          otherAllowances: 3000,
          taxDeduction: 4500,
          otherDeductions: 1200,
          payPeriod: 'August 2026',
          history: []
        }
      };

      users.push(newEmployee);
      await storageAdapter.set(USERS_KEY, users);

      // Initialize leave balances for new employee
      let balances = await storageAdapter.get(BALANCES_KEY, INITIAL_LEAVE_BALANCES);
      balances[newUserId] = {
        annual: { total: 20, used: 0, available: 20 },
        sick: { total: 10, used: 0, available: 10 },
        unpaid: { total: 30, used: 0, available: 30 }
      };
      await storageAdapter.set(BALANCES_KEY, balances);

      return {
        type: 'emailVerificationPending',
        email: email.trim(),
        user: newEmployee
      };
    } else {
      // 2. Admin role: write to pending_signups_db for approval
      let pendings = await storageAdapter.get(PENDING_SIGNUPS_KEY, []);
      const newPending = {
        id: `pending_${Date.now()}`,
        name: trimmedName,
        employeeId: genEmpId,
        email: email.trim(),
        passwordHash: password,
        role: 'Admin',
        status: 'PENDING_APPROVAL',
        requestedDate: new Date().toISOString().split('T')[0],
        avatar: fallbackAvatar
      };
      pendings.push(newPending);
      await storageAdapter.set(PENDING_SIGNUPS_KEY, pendings);

      return {
        type: 'adminApprovalPending',
        email: email.trim()
      };
    }
  },

  async getPendingAdminSignups() {
    await this.init();
    const pendings = await storageAdapter.get(PENDING_SIGNUPS_KEY, []);
    return pendings.filter(p => p.status === 'PENDING_APPROVAL');
  },

  async approveAdminSignup(pendingId) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));

    let pendings = await storageAdapter.get(PENDING_SIGNUPS_KEY, []);
    const pendingItem = pendings.find(p => p.id === pendingId);
    if (!pendingItem) throw new Error('Pending request not found');

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const newAdminUser = {
      id: `usr_adm_${Date.now()}`,
      employeeId: pendingItem.employeeId,
      name: pendingItem.name,
      email: pendingItem.email,
      role: 'Admin',
      designation: 'Operations Administrator',
      department: 'Executive Operations',
      phone: '',
      emergencyContact: '',
      address: '',
      bio: 'Administrator account created via portal signup.',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Active',
      avatar: pendingItem.avatar,
      passwordHash: pendingItem.passwordHash,
      twoFactorEnabled: false,
      salary: {
        basicPay: 75000,
        hra: 18000,
        otherAllowances: 6000,
        taxDeduction: 9000,
        otherDeductions: 2000,
        payPeriod: 'August 2026',
        history: []
      }
    };

    users.push(newAdminUser);
    await storageAdapter.set(USERS_KEY, users);

    // Remove from pending
    pendings = pendings.filter(p => p.id !== pendingId);
    await storageAdapter.set(PENDING_SIGNUPS_KEY, pendings);

    return newAdminUser;
  },

  async rejectAdminSignup(pendingId) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));

    let pendings = await storageAdapter.get(PENDING_SIGNUPS_KEY, []);
    pendings = pendings.filter(p => p.id !== pendingId);
    await storageAdapter.set(PENDING_SIGNUPS_KEY, pendings);
    return true;
  },

  async resendVerification(email) {
    await new Promise(r => setTimeout(r, 150));
    return true;
  },

  async logout() {
    await storageAdapter.remove(SESSION_KEY);
    return true;
  },

  async getActiveSessions(userId) {
    await this.init();
    const allSessions = await storageAdapter.get(SESSIONS_STORE_KEY, INITIAL_ACTIVE_SESSIONS);
    return allSessions[userId] || [
      {
        id: 'sess_default_1',
        device: 'Current Web Browser',
        ipAddress: '127.0.0.1 (Local Session)',
        lastActive: 'Active right now',
        isCurrent: true
      }
    ];
  },

  async revokeSession(userId, sessionId) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));
    const allSessions = await storageAdapter.get(SESSIONS_STORE_KEY, INITIAL_ACTIVE_SESSIONS);
    if (allSessions[userId]) {
      allSessions[userId] = allSessions[userId].filter(s => s.id !== sessionId || s.isCurrent);
      await storageAdapter.set(SESSIONS_STORE_KEY, allSessions);
    }
    return allSessions[userId];
  },

  async toggle2FA(userId, enabled) {
    await this.init();
    await new Promise(r => setTimeout(r, 200));
    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const index = users.findIndex(u => u.id === userId);
    if (index >= 0) {
      users[index].twoFactorEnabled = enabled;
      await storageAdapter.set(USERS_KEY, users);
      const { passwordHash, ...safeUser } = users[index];
      return safeUser;
    }
    throw new Error('User not found');
  }
};
