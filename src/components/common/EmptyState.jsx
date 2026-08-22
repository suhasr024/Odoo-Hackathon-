import React from 'react';

export const EmptyState = ({
  icon = 'inbox',
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-xl border border-dashed border-surface-variant my-4">
      <div className="w-14 h-14 rounded-full bg-surface-container-low text-secondary flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h4 className="text-lg font-semibold text-primary mb-1">{title}</h4>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-white font-medium text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
