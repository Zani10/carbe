import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';

interface AnimatedMonthDisplayProps {
  displayMonth: string;
  isLoading?: boolean;
}

export default function AnimatedMonthDisplay({ 
  displayMonth, 
  isLoading = false 
}: AnimatedMonthDisplayProps) {
  const [currentMonth, setCurrentMonth] = useState(displayMonth);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (displayMonth !== currentMonth) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setCurrentMonth(displayMonth);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [displayMonth, currentMonth]);

  const monthDate = parse(currentMonth, 'yyyy-MM', new Date());
  const monthName = format(monthDate, 'MMMM yyyy');

  return (
    <div className="flex justify-center mt-6 mb-4">
      <div 
        className={`text-center transition-all duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
        }`}
      >
        <h2 className="text-white font-medium text-lg">
          {monthName}
        </h2>
        {isLoading && (
          <div className="w-16 h-0.5 bg-[#FF4646] rounded-full mt-2 mx-auto animate-pulse" />
        )}
      </div>
    </div>
  );
} 