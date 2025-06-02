import React, { useState, useEffect, ReactNode } from 'react';

interface AnimatedCalendarGridProps {
  children: ReactNode;
  displayMonth: string;
  isLoading?: boolean;
}

export default function AnimatedCalendarGrid({ 
  children, 
  displayMonth,
  isLoading = false 
}: AnimatedCalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(displayMonth);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  useEffect(() => {
    if (displayMonth !== currentMonth) {
      // Determine direction
      const current = new Date(currentMonth + '-01');
      const display = new Date(displayMonth + '-01');
      setDirection(display > current ? 'next' : 'prev');
      
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setCurrentMonth(displayMonth);
        setIsTransitioning(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [displayMonth, currentMonth]);

  const getTransitionClasses = () => {
    if (!isTransitioning) {
      return 'opacity-100 transform translate-x-0 translate-y-0';
    }
    
    if (direction === 'next') {
      return 'opacity-0 transform -translate-y-4';
    } else {
      return 'opacity-0 transform translate-y-4';
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#121212]/50 backdrop-blur-sm z-10 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF4646] mx-auto mb-2"></div>
            <p className="text-gray-400 text-xs">Loading...</p>
          </div>
        </div>
      )}
      
      <div 
        className={`transition-all duration-300 ease-in-out ${getTransitionClasses()}`}
        key={currentMonth}
      >
        {children}
      </div>
    </div>
  );
} 