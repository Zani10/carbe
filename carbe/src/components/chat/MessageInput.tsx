'use client';

import React, { useState, useRef } from 'react';
import { Send, Paperclip, Image, X } from 'lucide-react';
import clsx from 'clsx';

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
  className,
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if ((!message.trim() && !selectedFile) || sending) return;

    setSending(true);
    try {
      await onSendMessage(message.trim(), selectedFile || undefined);
      setMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const isImage = (file: File) => {
    return file.type.startsWith('image/');
  };

  return (
    <div className={clsx('border-t border-gray-700/50 bg-[#2A2A2A] p-4', className)}>
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-[#1A1A1A] rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isImage(selectedFile) ? (
                  <Image className="h-5 w-5 text-blue-400" />
                ) : (
                  <Paperclip className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-3">
        {/* File Upload Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || sending}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50"
            title="Upload image"
          >
            <Image className="h-5 w-5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50"
            title="Upload file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            className="w-full bg-[#1A1A1A] border border-gray-700/50 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent resize-none disabled:opacity-50"
            style={{
              minHeight: '40px',
              maxHeight: '120px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || disabled || sending}
          className={clsx(
            'p-2 rounded-xl transition-colors disabled:opacity-50',
            (!message.trim() && !selectedFile) || disabled || sending
              ? 'bg-gray-700 text-gray-400'
              : 'bg-[#FF4646] text-white hover:bg-[#FF4646]/90'
          )}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MessageInput; 