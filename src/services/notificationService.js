import { storageAdapter } from './storage/storageAdapter';

const NOTIFICATIONS_KEY = 'notifications_db';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'usr_emp_001',
    title: 'Leave Request Approved',
    message: 'Your Sick Leave request for Aug 4 - Aug 5 has been approved.',
    type: 'leave_approved',
    link: '/leave-requests',
    isRead: false,
    createdAt: '2026-08-15T10:30:00.000Z'
  },
  {
    id: 'notif_2',
    userId: 'usr_emp_001',
    title: 'Attendance Reminder',
    message: 'Please remember to complete your daily check-out session.',
    type: 'attendance',
    link: '/attendance',
    isRead: true,
    createdAt: '2026-08-20T17:00:00.000Z'
  },
  {
    id: 'notif_adm_1',
    userId: 'usr_adm_002',
    title: 'New Leave Request',
    message: 'Alex Rivers applied for Annual Leave (Oct 1 - Oct 3).',
    type: 'leave_submitted',
    link: '/admin/leaves',
    isRead: false,
    createdAt: '2026-08-20T09:15:00.000Z'
  }
];

export const notificationService = {
  async init() {
    let notifs = await storageAdapter.get(NOTIFICATIONS_KEY);
    if (!notifs || !Array.isArray(notifs)) {
      await storageAdapter.set(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    }
  },

  async getNotifications(userId) {
    await this.init();
    const notifs = await storageAdapter.get(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    const userNotifs = notifs.filter(n => n.userId === userId || n.userId === 'ALL');
    userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return userNotifs;
  },

  async createNotification({ userId, title, message, type = 'general', link = null }) {
    await this.init();
    const notifs = await storageAdapter.get(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);

    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      title,
      message,
      type,
      link,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    notifs.unshift(newNotif);
    await storageAdapter.set(NOTIFICATIONS_KEY, notifs);
    return newNotif;
  },

  async markAsRead(notificationId) {
    await this.init();
    const notifs = await storageAdapter.get(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    const index = notifs.findIndex(n => n.id === notificationId);
    if (index >= 0) {
      notifs[index].isRead = true;
      await storageAdapter.set(NOTIFICATIONS_KEY, notifs);
    }
    return notifs;
  },

  async markAllAsRead(userId) {
    await this.init();
    const notifs = await storageAdapter.get(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    const updated = notifs.map(n => {
      if (n.userId === userId || n.userId === 'ALL') {
        return { ...n, isRead: true };
      }
      return n;
    });
    await storageAdapter.set(NOTIFICATIONS_KEY, updated);
    return updated;
  }
};
