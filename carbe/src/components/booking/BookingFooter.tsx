'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LockIcon, LockOpen, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface BookingFooterProps {
  pricePerDay: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onConfirm: () => void;
  currency?: string;
}

const BookingFooter: React.FC<BookingFooterProps> = ({
  pricePerDay,
  startDate,
  endDate,
  onConfirm,
  currency = '€',
}) => {
  const hasDateRange = startDate && endDate;
  const [swipeActive, setSwipeActive] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const swipeThreshold = 0.6; // 60% of the way to trigger booking
  const lockRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // For touch/swipe handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Format date range for display
  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'd MMM')} — ${format(endDate, 'd MMM')}`;
    }
    return '';
  };

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart || !isDragging || !containerRef.current || !lockRef.current) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    
    // Calculate container width (minus the lock button widths)
    const containerWidth = containerRef.current.offsetWidth - (lockRef.current.offsetWidth * 2);
    // Calculate how far we've moved as a proportion (0 to 1)
    const moveDistance = Math.max(0, Math.min(currentTouch - touchStart, containerWidth));
    const progress = moveDistance / containerWidth;
    
    // Update the progress state for animation
    setSwipeProgress(progress);
    
    // If we've dragged far enough, activate the swipe
    if (progress >= swipeThreshold) {
      setSwipeActive(true);
    } else {
      setSwipeActive(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (swipeActive) {
      // Trigger the booking
      onConfirm();
    }
    
    // Reset progress after slight delay to show animation
    setTimeout(() => {
      setSwipeProgress(0);
      setSwipeActive(false);
    }, 300);
    
    setTouchStart(null);
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!touchStart || !isDragging || !containerRef.current || !lockRef.current) return;
    
    const currentX = e.clientX;
    
    // Calculate container width (minus the lock button widths)
    const containerWidth = containerRef.current.offsetWidth - (lockRef.current.offsetWidth * 2);
    // Calculate how far we've moved as a proportion (0 to 1)
    const moveDistance = Math.max(0, Math.min(currentX - touchStart, containerWidth));
    const progress = moveDistance / containerWidth;
    
    // Update the progress state for animation
    setSwipeProgress(progress);
    
    // If we've dragged far enough, activate the swipe
    if (progress >= swipeThreshold) {
      setSwipeActive(true);
    } else {
      setSwipeActive(false);
    }
  };

  const handleMouseUp = () => {
    handleTouchEnd();
  };

  // Reset on mouse leave
  const handleMouseLeave = () => {
    if (isDragging) {
      handleTouchEnd();
    }
  };

  // Clear events when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Add document-level event listeners when dragging starts
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, touchStart]);

  return (
    <div className="fixed bottom-4 left-4 right-4 overflow-hidden flex flex-col">
      {/* Upper part - price and date info */}
      <div className="bg-[#3E3E3E] px-5 pt-2 pb-1 rounded-t-[30px]">
        <div className="flex justify-between items-center">
          <div className="text-white text-sm font-bold">{formatDateRange()}</div>
          <div className="text-white font-bold text-lg">{currency}{pricePerDay}<span className="text-xs font-normal text-gray-300">/day</span></div>
        </div>
      </div>
      
      {/* Book Now with swipable lock */}
      <div 
        ref={containerRef}
        className="flex items-center h-20 bg-[#292929] rounded-b-[30px] relative overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {/* Draggable Left Lock */}
        <div 
          ref={lockRef}
          className="h-12 w-12 bg-[#FF4646] rounded-full flex items-center justify-center absolute ml-2 z-10 cursor-grab active:cursor-grabbing"
          style={{ 
            transform: `translateX(${swipeProgress * (containerRef.current?.offsetWidth || 0) - (lockRef.current?.offsetWidth || 0)}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
        >
          <LockIcon className="text-white" size={18} />
        </div>
        
        {/* Book Now text and chevrons */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-white font-medium mr-2">Book Now</span>
          <div className="flex items-center space-x-[-5px]">
            <ChevronRight size={12} className="text-[#FF4646] opacity-30" />
            <ChevronRight size={16} className="text-[#FF4646] opacity-60" />
            <ChevronRight size={20} className="text-[#FF4646]" />
          </div>
        </div>
        
        {/* Right unlock icon */}
        <div className="h-12 w-12 bg-[#333333] rounded-full flex items-center justify-center mr-2">
          <LockOpen size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default BookingFooter; 