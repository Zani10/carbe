'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartBooking } from '@/hooks/ai/useSmartBooking';
import Link from 'next/link';

interface SmartBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartBookingModal({ isOpen, onClose }: SmartBookingModalProps) {
  const [query, setQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    cars?: Array<{
      id: string;
      make: string;
      model: string;
      location?: string;
      price_per_day: number;
      rating?: number;
      images?: string[];
    }>;
    timestamp: Date;
  }>>([]);
  
  const { processQuery, result, isLoading, error, resetResults } = useSmartBooking();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    // Add user message to history
    const userMessage = {
      type: 'user' as const,
      content: query.trim(),
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    setQuery('');

    // Process the query
    await processQuery(userMessage.content);
  };

  // Add AI response to conversation when result updates
  useEffect(() => {
    if (result) {
      const aiMessage = {
        type: 'ai' as const,
        content: result.explanation,
        cars: result.cars,
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, aiMessage]);
    }
  }, [result]);

  // Add error message to conversation
  useEffect(() => {
    if (error) {
      const errorMessage = {
        type: 'ai' as const,
        content: error,
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, errorMessage]);
    }
  }, [error]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setConversationHistory([]);
    setQuery('');
    resetResults();
    onClose();
  };

  const exampleQueries = [
    "I need a 7-seater for tomorrow near Brussels, under €100/day",
    "Find me an automatic car for the weekend in Antwerp",
    "Looking for a cheap car today in Ghent, budget max €50",
    "Need an SUV for next week near Liège"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.5 
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] rounded-t-[32px] shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                {/* AI Icon with glow */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] opacity-30 blur-md animate-pulse"></div>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold text-lg">Smart Booking AI</h3>
                  <p className="text-gray-400 text-sm">Describe what you&apos;re looking for</p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {conversationHistory.length === 0 ? (
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="text-gray-300 text-lg font-medium">What can I help you find?</div>
                    <div className="text-gray-500 text-sm">
                      Try asking in natural language - I&apos;ll find the perfect car for you!
                    </div>
                  </div>
                  
                  {/* Example queries */}
                  <div className="space-y-2">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wide">Examples</div>
                    {exampleQueries.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(example)}
                        className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-300 text-sm transition-colors border border-gray-700/50"
                      >
                        &quot;{example}&quot;
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversationHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${
                        message.type === 'user' 
                          ? 'bg-[#FF4646] text-white rounded-l-2xl rounded-tr-2xl' 
                          : 'bg-gray-800 text-gray-200 rounded-r-2xl rounded-tl-2xl'
                      } p-4 space-y-3`}>
                        <div className="text-sm leading-relaxed">{message.content}</div>
                        
                        {/* Show cars if AI response includes them */}
                        {message.type === 'ai' && message.cars && message.cars.length > 0 && (
                          <div className="space-y-3 pt-2 border-t border-gray-700">
                            {message.cars.map((car) => (
                              <Link key={car.id} href={`/car/${car.id}`} onClick={handleClose}>
                                <div className="bg-gray-900 rounded-xl p-3 hover:bg-gray-850 transition-colors cursor-pointer">
                                  <div className="flex items-center space-x-3">
                                    <img 
                                      src={car.images?.[0] || 'https://via.placeholder.com/80x60?text=No+Image'} 
                                      alt={`${car.make} ${car.model}`}
                                      className="w-16 h-12 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white font-medium text-sm truncate">
                                        {car.make} {car.model}
                                      </div>
                                      <div className="text-gray-400 text-xs">{car.location}</div>
                                      <div className="text-[#FF4646] font-semibold text-sm">
                                        €{car.price_per_day}/day
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-r-2xl rounded-tl-2xl p-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[#FF4646] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[#FF4646] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-[#FF4646] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-gray-400 text-sm">Searching...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-6 border-t border-gray-800">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Describe the car you need..."
                  className="w-full bg-gray-800 text-white rounded-2xl p-4 pr-14 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4646] placeholder-gray-500 max-h-32"
                  rows={2}
                  disabled={isLoading}
                />
                
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="absolute right-3 bottom-3 w-8 h-8 bg-[#FF4646] hover:bg-[#FF3333] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              
              <div className="text-gray-500 text-xs mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 