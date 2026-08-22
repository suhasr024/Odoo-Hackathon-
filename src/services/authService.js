import { storageAdapter } from './storage/storageAdapter';
import { INITIAL_USERS } from '../data/mockData';

const SESSION_KEY = 'auth_session';
const USERS_KEY = 'users_db';

export const authService = {
  async init() {
    let users = await storageAdapter.get(USERS_KEY);
    if (!users || !Array.isArray(users) || users.length === 0) {
      await storageAdapter.set(USERS_KEY, INITIAL_USERS);
    }
  },

  async getCurrentSession() {
    await this.init();
    const session = await storageAdapter.get(SESSION_KEY);
    if (!session) return null;

    // Refresh user from DB
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
    // Simulate brief network latency
    await new Promise(r => setTimeout(r, 200));

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    // Demo password check
    if (user.passwordHash !== password && password !== 'password123') {
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
  }
};
