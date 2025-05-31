'use client';

import React from 'react';
import { Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface HostApprovalToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const HostApprovalToggle: React.FC<HostApprovalToggleProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">Booking Approval</h3>
        <p className="text-sm text-gray-400">
          Choose how you want to handle booking requests for your car.
        </p>
      </div>

      {/* Toggle Options */}
      <div className="space-y-3">
        {/* Instant Booking Option */}
        <div
          onClick={() => !disabled && onChange(false)}
          className={clsx(
            'relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
            !value
              ? 'border-[#FF2800] bg-[#FF2800]/10'
              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center mt-0.5',
                  !value ? 'bg-[#FF2800]' : 'bg-gray-600'
                )}
              >
                <Check size={14} className="text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-white">Instant Booking</h4>
                <p className="text-sm text-gray-400">
                  Guests can book immediately without waiting for your approval. 
                  Payment is processed right away.
                </p>
              </div>
            </div>
            {!value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 rounded-full bg-[#FF2800]"
              />
            )}
          </div>
        </div>

        {/* Manual Approval Option */}
        <div
          onClick={() => !disabled && onChange(true)}
          className={clsx(
            'relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
            value
              ? 'border-[#FF2800] bg-[#FF2800]/10'
              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center mt-0.5',
                  value ? 'bg-[#FF2800]' : 'bg-gray-600'
                )}
              >
                <Clock size={14} className="text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-white">Requires Approval</h4>
                <p className="text-sm text-gray-400">
                  You manually approve each booking request. Payment is held until you decide.
                  You have 24 hours to respond.
                </p>
              </div>
            </div>
            {value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 rounded-full bg-[#FF2800]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-medium text-white">How it works</h5>
            <p className="text-xs text-gray-400">
              {value ? (
                <>
                  When a guest requests your car, their payment is authorized but not charged. 
                  You have 24 hours to approve or decline. If approved, payment is captured. 
                  If declined or no response, the authorization is released.
                </>
              ) : (
                <>
                  Guests can book your car instantly. Payment is processed immediately, 
                  and you&apos;ll receive a notification about the new booking. 
                  This typically leads to more bookings.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostApprovalToggle; 