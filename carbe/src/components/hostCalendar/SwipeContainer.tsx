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
  const startTouch = useRef<{ x: number; y: number; time: number } | null>(null);
  const minSwipeDistance = 50;
  const maxTapTime = 300; // Maximum time for a tap (vs swipe)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startTouch.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startTouch.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startTouch.current.x;
    const deltaY = touch.clientY - startTouch.current.y;
    const deltaTime = Date.now() - startTouch.current.time;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const maxDelta = Math.max(absDeltaX, absDeltaY);

    // If it's a quick tap (short time, small distance), don't treat as swipe
    if (deltaTime < maxTapTime && maxDelta < 20) {
      startTouch.current = null;
      return; // Let the tap event through
    }

    // Determine if it's a valid swipe (minimum distance)
    if (maxDelta < minSwipeDistance) {
      startTouch.current = null;
      return;
    }

    // Prevent tap events when swiping
    e.preventDefault();
    e.stopPropagation();

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
    // Only prevent default if we have a valid swipe distance
    if (startTouch.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - startTouch.current.x);
      const deltaY = Math.abs(touch.clientY - startTouch.current.y);
      
      // Only prevent default if we've moved enough to be considered a swipe
      if (Math.max(deltaX, deltaY) > 10) {
        e.preventDefault();
      }
    }
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
} 