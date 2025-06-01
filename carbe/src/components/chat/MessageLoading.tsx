'use client';

import React from 'react';
import clsx from 'clsx';

interface MessageLoadingProps {
  count?: number;
  className?: string;
}

const MessageSkeleton: React.FC<{ isOwn?: boolean }> = ({ isOwn = false }) => (
  <div
    className={clsx(
      'flex flex-col max-w-[85%] sm:max-w-[70%] animate-pulse',
      isOwn ? 'ml-auto items-end' : 'mr-auto items-start'
    )}
  >
    <div
      className={clsx(
        'px-4 py-2 rounded-2xl',
        isOwn
          ? 'bg-gray-600 rounded-br-md'
          : 'bg-gray-700 border border-gray-600 rounded-bl-md'
      )}
    >
      <div className="space-y-2">
        <div className="h-4 bg-gray-500 rounded w-32"></div>
        <div className="h-4 bg-gray-500 rounded w-24"></div>
      </div>
    </div>
    <div className={clsx(
      'flex items-center space-x-1 mt-1 px-1',
      isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'
    )}>
      <div className="h-3 w-12 bg-gray-600 rounded"></div>
    </div>
  </div>
);

export const MessageLoading: React.FC<MessageLoadingProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={clsx('space-y-4 p-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton key={index} isOwn={index % 3 === 0} />
      ))}
    </div>
  );
};

export default MessageLoading; 