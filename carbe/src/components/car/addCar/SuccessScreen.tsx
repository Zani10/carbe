'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Car, Star, TrendingUp } from 'lucide-react';

export default function SuccessScreen() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#FF2800]"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 2 + 3,
                ease: 'easeOut',
                delay: Math.random() * 2,
              }}
              style={{
                backgroundColor: [
                  '#FF2800',
                  '#FFD700',
                  '#00FF00',
                  '#FF69B4',
                  '#00BFFF'
                ][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.6,
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="bg-[#2A2A2A] border border-gray-700/50 rounded-2xl p-8 max-w-md w-full text-center relative z-10"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
            <CheckCircle className="relative w-20 h-20 text-white mx-auto" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            🎉 Car Listed Successfully!
          </h1>
          <p className="text-gray-300 mb-6">
            Your car is now live and ready to be booked by guests.
          </p>
        </motion.div>

        {/* Success Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="text-center">
            <Car className="h-6 w-6 text-[#FF2800] mx-auto mb-1" />
            <p className="text-xs text-gray-400">Listed</p>
          </div>
          <div className="text-center">
            <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Verified</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Ready</p>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#1F1F1F] border border-gray-700/50 rounded-xl p-4 mb-6"
        >
          <h3 className="text-white font-medium mb-2">What&apos;s Next?</h3>
          <ul className="text-sm text-gray-400 space-y-1 text-left">
            <li>✓ Your listing is now searchable</li>
            <li>✓ Guests can book immediately</li>
            <li>✓ You&apos;ll receive booking notifications</li>
          </ul>
        </motion.div>

        {/* Redirect Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-gray-500"
        >
          Redirecting to your garage in 2 seconds...
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, delay: 1 }}
          className="h-1 bg-[#FF2800] rounded-full mt-3"
        />
      </motion.div>
    </div>
  );
} 