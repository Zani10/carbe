'use client';

import React from 'react';
import { Message } from '@/types/message';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Download } from 'lucide-react';
import clsx from 'clsx';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showTimestamp?: boolean;
  className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  showTimestamp = false,
  className,
}) => {
  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const handleFileDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={clsx(
        'flex flex-col max-w-[85%] sm:max-w-[70%]',
        isOwn ? 'ml-auto items-end' : 'mr-auto items-start',
        className
      )}
    >
      {/* Message Bubble */}
      <div
        className={clsx(
          'px-4 py-2 rounded-2xl break-words',
          isOwn
            ? 'bg-[#FF4646] text-white rounded-br-md'
            : 'bg-[#2A2A2A] text-gray-100 border border-gray-700/50 rounded-bl-md'
        )}
      >
        {/* Text Message */}
        {message.message_type === 'text' && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        {/* Image Message */}
        {message.message_type === 'image' && message.file_url && (
          <div className="space-y-2">
            {message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            )}
            <img
              src={message.file_url}
              alt="Shared image"
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          </div>
        )}

        {/* File Message */}
        {message.message_type === 'file' && message.file_url && (
          <div className="space-y-2">
            {message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            )}
            <div
              className={clsx(
                'flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors',
                isOwn
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-gray-700/50 hover:bg-gray-700/70'
              )}
              onClick={() => handleFileDownload(message.file_url!, message.file_name || 'file')}
            >
              <div className="flex-shrink-0">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {message.file_name || 'File'}
                </p>
                <p className="text-xs opacity-75">Click to download</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div
        className={clsx(
          'flex items-center space-x-1 mt-1 px-1',
          isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'
        )}
      >
        {/* Timestamp */}
        {showTimestamp && (
          <span className="text-xs text-gray-500">
            {formatTimestamp(message.created_at)}
          </span>
        )}

        {/* Read Status (only for own messages) */}
        {isOwn && (
          <div className="text-gray-500">
            {message.is_read ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble; 