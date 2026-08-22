import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="w-full animate-pulse space-y-3 p-6 bg-surface-container-lowest rounded-xl">
        <div className="h-6 bg-surface-container-highest rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          {items.map((_, i) => (
            <div key={i} className="h-10 bg-surface-container-low rounded-lg w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="w-full animate-pulse grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 h-80 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-surface-container-highest mb-4"></div>
          <div className="h-6 bg-surface-container-highest rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-surface-container-highest rounded w-1/3"></div>
        </div>
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 h-80 space-y-4">
          <div className="h-6 bg-surface-container-highest rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-surface-container-low rounded-lg"></div>
            <div className="h-12 bg-surface-container-low rounded-lg"></div>
            <div className="h-12 bg-surface-container-low rounded-lg"></div>
            <div className="h-12 bg-surface-container-low rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((_, i) => (
        <div key={i} className="bg-surface-container-lowest rounded-xl p-6 h-36 animate-pulse flex flex-col justify-between shadow-level-1">
          <div className="h-4 bg-surface-container-highest rounded w-1/2"></div>
          <div className="h-8 bg-surface-container-highest rounded w-3/4"></div>
          <div className="h-3 bg-surface-container-highest rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
};
