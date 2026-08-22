import React from 'react';

export const ErrorState = ({
  title = 'Unable to load data',
  message = 'An unexpected error occurred while fetching information.',
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-error-container/30 border border-error-container rounded-xl my-4">
      <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[28px]">error_outline</span>
      </div>
      <h4 className="text-base font-semibold text-primary mb-1">{title}</h4>
      <p className="text-sm text-on-surface-variant max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-container transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Retry
        </button>
      )}
    </div>
  );
};
