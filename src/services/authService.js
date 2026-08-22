import { storageAdapter } from './storage/storageAdapter';
import { INITIAL_USERS, INITIAL_ACTIVE_SESSIONS } from '../data/mockData';

const SESSION_KEY = 'auth_session';
const USERS_KEY = 'users_db';
const SESSIONS_STORE_KEY = 'active_sessions_store';

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
