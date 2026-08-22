import React, { useState } from 'react';

export const PasswordInput = ({ className = '', ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative w-full">
      <input
        type={visible ? 'text' : 'password'}
        className={`${className} pr-10`}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1 rounded-md"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <span className="material-symbols-outlined text-[18px]">
          {visible ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  );
};
