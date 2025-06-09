'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface SmartBookingButtonProps {
  onClick: () => void;
}

export default function SmartBookingButton({ onClick }: SmartBookingButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-28 right-6 z-30"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.3 
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Main button container */}
      <div className="relative bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] rounded-full px-6 py-3 shadow-2xl">
        {/* Inner gradient overlay for depth */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-white/10"></div>
        
        {/* Button content */}
        <div className="relative flex items-center justify-center">
          {/* AI Sparkle Icon */}
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-white mr-2"
          >
            <path 
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
              fill="currentColor"
            />
            <path 
              d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z" 
              fill="currentColor" 
              opacity="0.7"
            />
          </svg>
          
          {/* Text */}
          <span className="text-white font-semibold text-base tracking-wide">
            AI
          </span>
        </div>
        
        {/* Subtle shine effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0"
          animate={{
            x: [-60, 60],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.button>
  );
} 