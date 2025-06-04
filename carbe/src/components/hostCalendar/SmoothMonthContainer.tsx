import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { CalendarData } from '@/types/calendar';

interface SmoothMonthContainerProps {
  displayMonth: string;
  onMonthChange: (direction: 'prev' | 'next') => void;
  children: (month: string, isPreview?: boolean) => React.ReactNode;
  previewData?: { [month: string]: CalendarData }; // Properly typed preview data
}

export default function SmoothMonthContainer({
  displayMonth,
  onMonthChange,
  children,
  previewData = {}
}: SmoothMonthContainerProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);
  
  const currentDate = new Date(displayMonth + '-01');
  const nextMonthDate = addMonths(currentDate, 1);
  const prevMonthDate = subMonths(currentDate, 1);
  
  const nextMonth = format(nextMonthDate, 'yyyy-MM');
  const prevMonth = format(prevMonthDate, 'yyyy-MM');

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    // Determine if drag was significant enough to trigger month change
    if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > velocityThreshold) {
      if (offset.y > 0) {
        // Swiped down - go to previous month
        // Check if we have cached data for instant transition
        if (previewData[prevMonth]) {
          // Instant transition - no loading
          onMonthChange('prev');
        } else {
          // Show brief transition animation
          setIsTransitioning(true);
          setTimeout(() => {
            onMonthChange('prev');
            setIsTransitioning(false);
          }, 100);
        }
      } else {
        // Swiped up - go to next month  
        // Check if we have cached data for instant transition
        if (previewData[nextMonth]) {
          // Instant transition - no loading
          onMonthChange('next');
        } else {
          // Show brief transition animation
          setIsTransitioning(true);
          setTimeout(() => {
            onMonthChange('next');
            setIsTransitioning(false);
          }, 100);
        }
      }
    }
    
    setDragDirection(null);
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    
    if (Math.abs(offset.y) > 20) {
      setDragDirection(offset.y > 0 ? 'down' : 'up');
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Main Container */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{
          y: isTransitioning ? (dragDirection === 'up' ? -100 : 100) : 0,
          opacity: isTransitioning ? 0.8 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="relative"
      >
        {/* Current Month */}
        <div className="relative z-10">
          {children(displayMonth)}
        </div>

        {/* Next Month Preview - Always visible below current month */}
        <div className="mt-8 opacity-40 pointer-events-none transition-opacity duration-300 hover:opacity-60">
          <div className="transform scale-95">
            {/* Month label for preview */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-400">
                {format(nextMonthDate, 'MMMM yyyy')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Swipe up to view</p>
            </div>
            {children(nextMonth, true)}
          </div>
        </div>
      </motion.div>

      {/* Previous Month Preview - Shown when dragging down */}
      <AnimatePresence>
        {dragDirection === 'down' && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 0.5 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-0 pointer-events-none"
          >
            <div className="transform scale-95 -translate-y-8">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-400">
                  {format(prevMonthDate, 'MMMM yyyy')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Release to go back</p>
              </div>
              {children(prevMonth, true)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Indicator */}
      <AnimatePresence>
        {dragDirection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-black/80 backdrop-blur-lg px-4 py-2 rounded-full border border-gray-600/30">
              <p className="text-white text-sm font-medium">
                {dragDirection === 'up' ? '↑ Next Month' : '↓ Previous Month'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 