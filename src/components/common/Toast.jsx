import React from 'react';
import { useToast } from '../../hooks/useToast';

export const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-primary text-white border-l-4 border-tertiary-fixed shadow-level-2';
      case 'error':
        return 'bg-error text-white border-l-4 border-error-container shadow-level-2';
      case 'warning':
        return 'bg-amber-600 text-white border-l-4 border-amber-300 shadow-level-2';
      default:
        return 'bg-primary text-white border-l-4 border-secondary shadow-level-2';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 transform translate-y-0 ${getTypeStyles(t.type)}`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">
              {getIcon(t.type)}
            </span>
            <p className="text-sm font-medium">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/80 hover:text-white p-1 rounded-full transition-colors ml-4"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
