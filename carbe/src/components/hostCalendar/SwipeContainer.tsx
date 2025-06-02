import React, { useRef, ReactNode } from 'react';

interface SwipeContainerProps {
  children: ReactNode;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  className?: string;
}

export default function SwipeContainer({
  children,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}: SwipeContainerProps) {
  const startTouch = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startTouch.current = {
      x: touch.clientX,
      y: touch.clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startTouch.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startTouch.current.x;
    const deltaY = touch.clientY - startTouch.current.y;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if it's a valid swipe
    if (Math.max(absDeltaX, absDeltaY) < minSwipeDistance) {
      startTouch.current = null;
      return;
    }

    // Horizontal swipe (tab switching)
    if (absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    } 
    // Vertical swipe (month navigation)
    else {
      if (deltaY > 0) {
        onSwipeDown();
      } else {
        onSwipeUp();
      }
    }

    startTouch.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default scrolling behavior when swiping
    if (startTouch.current) {
      e.preventDefault();
    }
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  );
} 