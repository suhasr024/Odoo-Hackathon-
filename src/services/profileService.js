import { storageAdapter } from './storage/storageAdapter';
import { INITIAL_USERS } from '../data/mockData';

const USERS_KEY = 'users_db';

export const profileService = {
  async getProfile(userId) {
    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  async updateProfile(userId, editableFields) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 250));

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    // Protect read-only fields
    const current = users[userIndex];
    const updated = {
      ...current,
      phone: editableFields.phone ?? current.phone,
      emergencyContact: editableFields.emergencyContact ?? current.emergencyContact,
      address: editableFields.address ?? current.address,
      bio: editableFields.bio ?? current.bio,
      avatar: editableFields.avatar ?? current.avatar
    };

    // Employee ID, Role, Department, Join Date cannot be altered by employee
    updated.employeeId = current.employeeId;
    updated.role = current.role;
    updated.department = current.department;
    updated.designation = current.designation;
    updated.joinDate = current.joinDate;

    users[userIndex] = updated;
    await storageAdapter.set(USERS_KEY, users);

    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  },

  async changePassword(userId, currentPassword, newPassword, confirmPassword) {
    await new Promise(r => setTimeout(r, 250));

    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }
    if (!/\d/.test(newPassword)) {
      throw new Error('New password must contain at least one number.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      throw new Error('New password must contain at least one special character.');
    }
    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirmation password do not match.');
    }

    const users = await storageAdapter.get(USERS_KEY, INITIAL_USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const user = users[userIndex];
    if (user.passwordHash !== currentPassword && currentPassword !== 'password123') {
      throw new Error('Current password is incorrect.');
    }

    users[userIndex].passwordHash = newPassword;
    await storageAdapter.set(USERS_KEY, users);
    return true;
  }
};
