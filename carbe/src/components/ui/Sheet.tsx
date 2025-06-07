import React, { useRef, useEffect, useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target === e.currentTarget || (e.target as Element).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStartY(e.touches[0].clientY);
      setDragOffset(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY;
    
    // Only allow downward dragging
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged down more than 100px, close the sheet
    if (dragOffset > 100) {
      animateClose();
    } else {
      // Snap back to original position
      setDragOffset(0);
    }
  };

  // Handle mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as Element).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStartY(e.clientY);
      setDragOffset(0);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = e.clientY - dragStartY;
    
    // Only allow downward dragging
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged down more than 100px, close the sheet
    if (dragOffset > 100) {
      animateClose();
    } else {
      // Snap back to original position
      setDragOffset(0);
    }
  };

  // Add mouse event listeners for desktop
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY, dragOffset]);

  const animateClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
      setDragOffset(0);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen && !isAnimating) return null;

  const getSheetStyle = () => {
    const baseTransform = isOpen && !isAnimating ? 0 : 100;
    const dragTransform = dragOffset * 0.8; // Reduce the drag sensitivity
    const totalTransform = baseTransform + dragTransform;
    
    return {
      transform: `translateY(${totalTransform}%)`,
      transition: isDragging ? 'none' : 'transform 0.3s ease-out',
    };
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300 ${
        isOpen && !isAnimating ? 'bg-black/60' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        ref={sheetRef}
        className="w-full bg-[#212121] rounded-t-[28px] shadow-xl overflow-hidden flex flex-col touch-none"
        style={{ 
          height: typeof height === 'string' ? height : `${height}px`,
          ...getSheetStyle()
        }}
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Drag indicator */}
        {showIndicator && (
          <div className="w-full pt-3 pb-2 flex justify-center drag-handle cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1 bg-gray-400 rounded-full opacity-50" />
          </div>
        )}
        
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="px-4 pt-2 pb-4 flex items-center justify-between">
            {showCloseButton ? (
              <button 
                onClick={animateClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100/10 transition-colors"
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
        <div className="flex-1 overflow-auto px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sheet; 