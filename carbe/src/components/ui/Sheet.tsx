import React, { useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
  snapPoints?: number[];
  defaultSnapPoint?: number;
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
  snapPoints = [0.9],
  defaultSnapPoint = 0,
  showIndicator = true,
  headerAction,
  height = '90vh',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // Convert snapPoints to pixel values
  const getSnapPoints = () => {
    if (!sheetRef.current) return snapPoints.map(point => window.innerHeight * point);
    const windowHeight = window.innerHeight;
    return snapPoints.map(point => windowHeight * point);
  };

  const [{ y }, api] = useSpring(() => ({ 
    y: window.innerHeight,
    config: { tension: 300, friction: 30 }
  }));

  const openSheet = () => {
    const snapPixels = getSnapPoints();
    api.start({ 
      y: snapPixels[defaultSnapPoint],
      immediate: false
    });
  };

  const closeSheet = () => {
    api.start({ 
      y: window.innerHeight, 
      immediate: false,
      onRest: onClose 
    });
  };

  // Drag binding
  const bind = useDrag(
    ({ movement: [, my], velocity: [, vy], direction: [, dy], cancel, last }) => {
      // Cancel drag if moving up initially
      if (my < -20) cancel();

      if (last) {
        const snapPixels = getSnapPoints();
        const currentY = y.get();
        
        // If dragged more than 1/3 of the sheet's height or flicked down with velocity
        if (my > sheetRef.current!.clientHeight / 3 || (vy > 0.5 && dy > 0)) {
          closeSheet();
          return;
        }
        
        // Otherwise snap to closest snap point
        let closestPoint = 0;
        let minDistance = Infinity;
        
        snapPixels.forEach((point, index) => {
          const distance = Math.abs(currentY - point);
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = index;
          }
        });
        
        api.start({ y: snapPixels[closestPoint] });
      } else {
        // While dragging
        api.start({ y: y.get() + my, immediate: true });
      }
    },
    { 
      from: () => [0, y.get()],
      bounds: { top: 0 },
      rubberband: true,
      filterTaps: true,
    }
  );

  // Effect to handle opening/closing
  useEffect(() => {
    if (isOpen) {
      openSheet();
    } else {
      closeSheet();
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
      <animated.div 
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-[#212121] rounded-t-[28px] shadow-xl overflow-hidden flex flex-col"
        style={{ 
          height: typeof height === 'string' ? height : `${height}px`,
          y, 
          touchAction: 'none',
        }}
        onClick={e => e.stopPropagation()}
        {...bind()}
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
      </animated.div>
    </div>
  );
};

export default Sheet; 