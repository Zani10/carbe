'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LockIcon, LockOpen, ChevronRight, Check } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

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
  const [swipeActive, setSwipeActive] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const swipeThreshold = 0.6;
  const lockRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // --- Micro-animations using framer-motion motion values ---
  const progress = useMotionValue(swipeProgress);
  useEffect(() => { progress.set(swipeProgress); }, [swipeProgress]);

  // Red circle: color from red to green, fade out as it reaches the middle
  const lockColor = useTransform(progress, [0, 0.5, 1], ["#FF4646", "#FF4646", "#00A650"]);
  const lockFade = useTransform(progress, [0, 0.5, 0.7], [1, 0.7, 0]);
  const lockScale = useTransform(progress, [0, 1], [1, 1.12]);

  // Red background: now starts from the beginning
  const redBgOpacity = useTransform(progress, [0, 0.7], [1, 1]);

  // Open lock: green, z-20 when progress > 0.6
  const openLockColor = useTransform(progress, [0.6, 1], ["#333333", "#00A650"]);
  const openLockZ = useTransform(progress, [0.6, 0.7, 1], [10, 20, 30]);
  const openLockRotate = useTransform(progress, [0.6, 1], [-10, 0]);

  // Arrows: fade in, slide, and move right with swipe progress
  const arrow1Opacity = useTransform(progress, [0, 0.3], [0.3, 1]);
  const arrow2Opacity = useTransform(progress, [0.2, 0.6], [0.3, 1]);
  const arrow3Opacity = useTransform(progress, [0.4, 1], [0.3, 1]);
  const arrowSlide = useTransform(progress, [0, 1], [0, 32]); // increased max slide for smoother movement

  // Text morph and position
  let swipeText = 'Book Now';
  if (progress.get() > 0.7) swipeText = 'Release to Book';

  // Format date range for display
  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'd MMM')} — ${format(endDate, 'd MMM')}`;
    }
    return '';
  };

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isConfirming || isCompleted || isLoading) return;
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart || !isDragging || isConfirming || isCompleted || isLoading || !containerRef.current || !lockRef.current) return;
    
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
    if (isConfirming || isCompleted || isLoading) return;
    setIsDragging(false);
    
    if (swipeActive) {
      // Start the booking confirmation sequence
      setIsConfirming(true);
      setIsLoading(true);
      
      // Step 1: Hold at the end position briefly (1200ms)
      setTimeout(() => {
        // Step 2: Trigger booking and show confirmation
        onConfirm();
        setIsLoading(false);
        setIsCompleted(true);
        
        // Step 3: After 1.2s, reset the animation
        setTimeout(() => {
          setSwipeProgress(0);
          setSwipeActive(false);
          setIsConfirming(false);
          setIsCompleted(false);
        }, 1200);
      }, 1200);
    } else {
      // Reset progress
      setSwipeProgress(0);
    }
    
    setTouchStart(null);
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isConfirming || isCompleted || isLoading) return;
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!touchStart || !isDragging || isConfirming || isCompleted || isLoading || !containerRef.current || !lockRef.current) return;
    
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

  // Different background colors for slider states
  const getSliderBackground = () => {
    if (isCompleted) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (swipeActive) return 'bg-[#292929]';
    return 'bg-[#292929]';
  };

  // --- Progress overlay for red tsunami ---
  const progressBarWidth = isCompleted ? '100%' : `${swipeProgress * 100}%`;

  return (
    <div className="fixed bottom-4 left-4 right-4 overflow-hidden flex flex-col">
      {/* Upper part - price and date info */}
      <AnimatePresence>
        {(!isLoading && !isCompleted) && (
          <motion.div
            className="absolute left-0 right-0 top-0 h-[102px] bg-[#3E3E3E] z-0 rounded-[30px]"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.32, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(!isLoading && !isCompleted) && (
          <motion.div
            className="bg-transparent px-5 pt-2 pb-1 relative z-10 h-full"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.32, ease: 'easeInOut' }}
          >
            <div className="flex justify-between items-center h-full">
              <div className="text-white text-sm font-bold">{formatDateRange()}</div>
              <div className="text-white font-bold text-lg">{currency}{pricePerDay}<span className="text-xs font-normal text-gray-300">/day</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Book Now with swipable lock */}
      <div 
        ref={containerRef}
        className={`flex items-center h-17 ${getSliderBackground()} rounded-full relative overflow-hidden transition-colors duration-300`}
        style={{ touchAction: 'none' }}
      >
        {/* Progress overlay (red tsunami) */}
        <motion.div 
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#FF4646] to-transparent z-10 pointer-events-none"
          style={{ opacity: redBgOpacity }}
          initial={{ width: 0 }}
          animate={{ width: progressBarWidth }}
          transition={{ duration: 0, ease: "linear" }}
        />
        {/* Draggable Left Lock */}
        <motion.div 
          ref={lockRef}
          className="h-13 w-13 rounded-full flex items-center justify-center absolute ml-2 z-20 cursor-grab active:cursor-grabbing"
          style={{ 
            left: 0,
            top: '50%',
            y: '-50%',
            background: lockColor,
            opacity: lockFade,
            transform: `translateX(${swipeProgress * (containerRef.current?.offsetWidth || 0) - (lockRef.current?.offsetWidth || 0)}px) scale(${lockScale.get()})`,
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(.4,1.2,.6,1)',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
        >
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Check className="text-white" size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="lock"
                exit={{ scale: 0, rotate: 45 }}
              >
                <LockIcon className={swipeActive ? "text-[#FF4646]" : "text-white"} size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Book Now text and chevrons */}
        <div className="flex-1 flex items-center justify-center pl-16 relative ml-3">
          <AnimatePresence mode="wait">
            {isCompleted ? null : isLoading ? (
              <motion.div
                className="flex flex-col items-center justify-center w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-8 h-8 border-4 border-t-4 border-t-[#FF4646] border-[#FFBABA] rounded-full mb-1"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                />
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center w-full"
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span 
                  className="text-white font-medium mr-4"
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {swipeText}
                </motion.span>
                {/* Absolutely positioned arrows, decoupled from text width */}
                <motion.div
                  className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center space-x-2"
                  style={{ x: arrowSlide }}
                >
                  <motion.div style={{ opacity: arrow1Opacity }}>
                    <ChevronRight size={16} className="text-[#FF4646]" />
                  </motion.div>
                  <motion.div style={{ opacity: arrow2Opacity }}>
                    <ChevronRight size={20} className="text-[#FF4646]" />
                  </motion.div>
                  <motion.div style={{ opacity: arrow3Opacity }}>
                    <ChevronRight size={24} className="text-[#FF4646]" />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Check animation in the center after loading */}
          <AnimatePresence>
            {isCompleted && !isLoading && (
              <motion.div
                className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.5 }}
              >
                <Check className="text-green-500" size={40} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Right unlock icon */}
        <motion.div 
          className="h-12 w-12 rounded-full flex items-center justify-center mr-2"
          style={{
            zIndex: openLockZ.get(),
            background: openLockColor,
            transform: `rotate(${openLockRotate.get()}deg) scale(${swipeActive ? 1.1 : 1})`,
            transition: 'all 0.3s cubic-bezier(.4,1.2,.6,1)',
          }}
        >
          <LockOpen size={18} className="text-white" />
        </motion.div>
      </div>
    </div>
  );
};

export default BookingFooter; 