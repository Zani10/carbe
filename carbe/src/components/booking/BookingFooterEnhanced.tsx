'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LockIcon, LockOpen, ChevronRight, Check, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { PaymentStatus, BookingStatus } from '@/types/booking';

interface BookingFooterEnhancedProps {
  pricePerDay: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onConfirm: () => void;
  currency?: string;
  
  // Enhanced props for booking flow
  requiresApproval?: boolean;
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
  approvalDeadline?: Date;
}

const BookingFooterEnhanced: React.FC<BookingFooterEnhancedProps> = ({
  pricePerDay,
  startDate,
  endDate,
  onConfirm,
  currency = '€',
  requiresApproval = false,
  bookingStatus = 'pending',
  paymentStatus = 'pending',
  approvalDeadline,
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

  // Animation values
  const progress = useMotionValue(swipeProgress);
  useEffect(() => { progress.set(swipeProgress); }, [swipeProgress]);

  const lockColor = useTransform(progress, [0, 0.5, 1], ["#FF4646", "#FF4646", "#00A650"]);
  const lockFade = useTransform(progress, [0, 0.5, 0.7], [1, 0.7, 0]);
  const lockScale = useTransform(progress, [0, 1], [1, 1.12]);
  const redBgOpacity = useTransform(progress, [0, 0.7], [1, 1]);
  const openLockColor = useTransform(progress, [0.6, 1], ["#333333", "#00A650"]);
  const openLockZ = useTransform(progress, [0.6, 0.7, 1], [10, 20, 30]);
  const openLockRotate = useTransform(progress, [0.6, 1], [-10, 0]);
  const arrow1Opacity = useTransform(progress, [0, 0.3], [0.3, 1]);
  const arrow2Opacity = useTransform(progress, [0.2, 0.6], [0.3, 1]);
  const arrow3Opacity = useTransform(progress, [0.4, 1], [0.3, 1]);
  const arrowSlide = useTransform(progress, [0, 1], [0, 32]);

  // Get display text based on booking state
  const getDisplayText = () => {
    if (progress.get() > 0.7) return 'Release to Book';
    
    switch (bookingStatus) {
      case 'awaiting_approval':
        return 'Awaiting Host Approval';
      case 'confirmed':
        return paymentStatus === 'captured' ? 'Booking Confirmed' : 'Complete Payment';
      case 'rejected':
        return 'Booking Rejected';
      case 'cancelled':
        return 'Booking Cancelled';
      default:
        return requiresApproval ? 'Request Booking' : 'Book Now';
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (bookingStatus) {
      case 'awaiting_approval':
        return 'text-yellow-400';
      case 'confirmed':
        return 'text-green-400';
      case 'rejected':
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'd MMM')} — ${format(endDate, 'd MMM')}`;
    }
    return '';
  };

  // Format approval deadline
  const formatApprovalDeadline = () => {
    if (!approvalDeadline) return '';
    const now = new Date();
    const deadline = new Date(approvalDeadline);
    const diffHours = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours <= 0) return 'Expired';
    if (diffHours < 24) return `${diffHours}h remaining`;
    return format(deadline, 'MMM d, HH:mm');
  };

  // Handle touch/mouse events (simplified for brevity)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isConfirming || isCompleted || isLoading || bookingStatus !== 'pending') return;
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart || !isDragging || !containerRef.current || !lockRef.current) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const containerWidth = containerRef.current.offsetWidth - (lockRef.current.offsetWidth * 2);
    const moveDistance = Math.max(0, Math.min(currentTouch - touchStart, containerWidth));
    const progress = moveDistance / containerWidth;
    
    setSwipeProgress(progress);
    setSwipeActive(progress >= swipeThreshold);
  };

  const handleTouchEnd = () => {
    if (bookingStatus !== 'pending') return;
    setIsDragging(false);
    
    if (swipeActive) {
      setIsConfirming(true);
      setIsLoading(true);
      
      setTimeout(() => {
        onConfirm();
        setIsLoading(false);
        setIsCompleted(true);
        
        setTimeout(() => {
          setSwipeProgress(0);
          setSwipeActive(false);
          setIsConfirming(false);
          setIsCompleted(false);
        }, 1200);
      }, 1200);
    } else {
      setSwipeProgress(0);
    }
    
    setTouchStart(null);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (bookingStatus !== 'pending') return;
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  // Status icon component
  const StatusIcon = () => {
    switch (bookingStatus) {
      case 'awaiting_approval':
        return <Clock size={16} className="text-yellow-400" />;
      case 'confirmed':
        return paymentStatus === 'captured' ? 
          <Check size={16} className="text-green-400" /> : 
          <CreditCard size={16} className="text-blue-400" />;
      case 'rejected':
      case 'cancelled':
        return <div className="w-4 h-4 rounded-full bg-red-400" />;
      default:
        return null;
    }
  };

  // Get slider background
  const getSliderBackground = () => {
    if (isCompleted) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (bookingStatus === 'awaiting_approval') return 'bg-gradient-to-r from-yellow-600 to-yellow-700';
    if (bookingStatus === 'confirmed') return 'bg-gradient-to-r from-green-600 to-green-700';
    if (bookingStatus === 'rejected' || bookingStatus === 'cancelled') return 'bg-gradient-to-r from-red-600 to-red-700';
    if (swipeActive) return 'bg-[#292929]';
    return 'bg-[#292929]';
  };

  const progressBarWidth = isCompleted ? '100%' : `${swipeProgress * 100}%`;
  const isInteractive = bookingStatus === 'pending';

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
              <div className="flex flex-col">
                <div className="text-white text-sm font-bold">{formatDateRange()}</div>
                {bookingStatus === 'awaiting_approval' && approvalDeadline && (
                  <div className="text-xs text-yellow-400">{formatApprovalDeadline()}</div>
                )}
              </div>
              <div className="text-white font-bold text-lg">
                {currency}{pricePerDay}
                <span className="text-xs font-normal text-gray-300">/day</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced booking button */}
      <div 
        ref={containerRef}
        className={`flex items-center h-17 ${getSliderBackground()} rounded-full relative overflow-hidden transition-colors duration-300`}
        style={{ touchAction: 'none' }}
      >
        {/* Progress overlay */}
        {isInteractive && (
          <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#FF4646] to-transparent z-10 pointer-events-none"
            style={{ opacity: redBgOpacity }}
            initial={{ width: 0 }}
            animate={{ width: progressBarWidth }}
            transition={{ duration: 0, ease: "linear" }}
          />
        )}
        
        {/* Draggable lock (only for interactive states) */}
        {isInteractive && (
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
          >
            <LockIcon className={swipeActive ? "text-[#FF4646]" : "text-white"} size={18} />
          </motion.div>
        )}
        
        {/* Status icon for non-interactive states */}
        {!isInteractive && (
          <div className="h-13 w-13 rounded-full flex items-center justify-center ml-2 bg-gray-600">
            <StatusIcon />
          </div>
        )}
        
        {/* Text and status */}
        <div className="flex-1 flex items-center justify-center pl-16 relative ml-3">
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.5 }}
              >
                <Check className="text-green-500" size={40} />
              </motion.div>
            ) : isLoading ? (
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
                  className={`font-medium mr-4 ${getStatusColor()}`}
                  initial={false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {getDisplayText()}
                </motion.span>
                
                {/* Arrows for interactive states */}
                {isInteractive && (
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
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Right unlock icon */}
        <motion.div 
          className="h-12 w-12 rounded-full flex items-center justify-center mr-2"
          style={{
            zIndex: isInteractive ? openLockZ.get() : 10,
            background: isInteractive ? openLockColor : '#666',
            transform: isInteractive ? `rotate(${openLockRotate.get()}deg) scale(${swipeActive ? 1.1 : 1})` : 'none',
            transition: 'all 0.3s cubic-bezier(.4,1.2,.6,1)',
          }}
        >
          <LockOpen size={18} className="text-white" />
        </motion.div>
      </div>
    </div>
  );
};

export default BookingFooterEnhanced; 