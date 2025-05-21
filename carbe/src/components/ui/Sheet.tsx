import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
  showIndicator?: boolean;
  headerAction?: React.ReactNode;
  height?: string | number;
}

const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  showIndicator = true,
  headerAction,
  height = '90vh',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Prevent body scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Listen for escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
    >
      <div 
        ref={sheetRef}
        className="w-full bg-[#212121] rounded-t-[28px] shadow-xl overflow-hidden flex flex-col"
        style={{ 
          height: typeof height === 'string' ? height : `${height}px`,
          animation: 'slideUp 0.3s ease-out forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag indicator */}
        {showIndicator && (
          <div className="w-full pt-2 flex justify-center">
            <div className="w-10 h-1 bg-gray-400 rounded-full opacity-50" />
          </div>
        )}
        
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            {showCloseButton ? (
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100/10"
              >
                <X size={20} className="text-white" />
              </button>
            ) : (
              <div className="w-10" />
            )}
            
            {title && (
              <h2 className="text-xl font-medium text-white">{title}</h2>
            )}
            
            {headerAction ? (
              <div>{headerAction}</div>
            ) : (
              <div className="w-10" />
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sheet; 