import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';

export const NotificationPopover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const popoverRef = useRef(null);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Polling check
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    await fetchNotifs();
  };

  const handleItemClick = async (item) => {
    await notificationService.markAsRead(item.id);
    await fetchNotifs();
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer relative"
        title="Notifications"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-level-3 border border-surface-variant z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-error bg-error-container/50 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-secondary font-semibold hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-surface-container">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-on-surface-variant">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-surface-container-low transition-colors cursor-pointer ${
                    !item.isRead ? 'bg-secondary-fixed/10' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === 'leave_approved' ? 'bg-tertiary-fixed/30 text-tertiary-container' :
                    item.type === 'leave_rejected' ? 'bg-error-container/50 text-error' :
                    item.type === 'leave_submitted' ? 'bg-amber-100 text-amber-800' :
                    'bg-surface-container text-secondary'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {item.type === 'leave_approved' ? 'verified' :
                       item.type === 'leave_rejected' ? 'cancel' :
                       item.type === 'leave_submitted' ? 'pending_actions' : 'notifications'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className={`text-xs ${!item.isRead ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-outline shrink-0">
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
