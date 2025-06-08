'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartBooking } from '@/hooks/ai/useSmartBooking';
import { QUICK_SEARCHES } from '@/lib/ai';
import Link from 'next/link';

interface SmartBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartBookingModal({ isOpen, onClose }: SmartBookingModalProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    search, 
    reset, 
    isLoading, 
    isThinking,
    result, 
    error, 
    hasResults,
    confidence,
    followUpSuggestions 
  } = useSmartBooking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setShowResults(true);
    await search(query.trim());
  };

  const handleQuickSearch = async (quickQuery: string) => {
    setQuery(quickQuery);
    setShowResults(true);
    await search(quickQuery);
  };

  const handleClose = () => {
    setQuery('');
    setShowResults(false);
    reset();
    onClose();
  };

  const handleBack = () => {
    setShowResults(false);
    reset();
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current && !showResults) {
      inputRef.current.focus();
    }
  }, [isOpen, showResults]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showResults) {
          handleBack();
        } else {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, showResults]);

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
            onClick={showResults ? handleBack : handleClose}
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] rounded-t-[32px] shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                {showResults && (
                  <button
                    onClick={handleBack}
                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors mr-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                
                {/* AI Icon with dynamic glow */}
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] flex items-center justify-center transition-all ${
                    isThinking ? 'animate-pulse scale-110' : ''
                  }`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] opacity-30 blur-md transition-all ${
                    isThinking ? 'animate-pulse scale-150' : ''
                  }`}></div>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {showResults ? 'Search Results' : 'Smart Booking AI'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {showResults 
                      ? `Found ${result?.cars.length || 0} cars` 
                      : 'Describe what you\'re looking for'
                    }
                  </p>
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {!showResults ? (
                /* Search Input Screen */
                <div className="p-6 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="I need a car for tomorrow in Brussels under €50/day..."
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4646] focus:border-transparent min-h-[100px] max-h-[200px]"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                        {query.length}/500
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!query.trim() || isLoading}
                      className="w-full bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] hover:from-[#FF3333] hover:to-[#FF5555] disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>{isThinking ? 'Thinking...' : 'Searching...'}</span>
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                          </svg>
                          <span>Find my perfect car</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Quick Searches */}
                  <div className="space-y-4">
                    <div className="text-gray-400 text-sm font-medium">Quick searches</div>
                    <div className="grid grid-cols-2 gap-3">
                      {QUICK_SEARCHES.map((quickSearch, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSearch(quickSearch.query)}
                          disabled={isLoading}
                          className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 rounded-xl text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                              {quickSearch.icon}
                            </span>
                            <div>
                              <div className="text-white font-medium text-sm">{quickSearch.label}</div>
                              <div className="text-gray-400 text-xs">{quickSearch.query}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Results Screen */
                <div className="p-6 space-y-6">
                  {/* AI Response */}
                  {result?.response && (
                    <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-700/30">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] flex items-center justify-center flex-shrink-0 mt-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm leading-relaxed">
                            {result.response.explanation}
                          </div>
                          {confidence > 0 && (
                            <div className="mt-3 flex items-center space-x-2">
                              <div className="text-xs text-gray-400">Confidence:</div>
                              <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] h-1.5 rounded-full transition-all"
                                  style={{ width: `${confidence * 100}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-400">{Math.round(confidence * 100)}%</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                      <div className="text-red-400 text-sm">{error}</div>
                    </div>
                  )}

                  {/* Cars Results */}
                  {hasResults && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Perfect matches</h4>
                        <div className="text-gray-400 text-sm">
                          {result?.cars.length} of {result?.totalAvailable} cars
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {result?.cars.map((car) => (
                          <Link key={car.id} href={`/car/${car.id}`} onClick={handleClose}>
                            <div className="bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 rounded-2xl p-4 transition-all cursor-pointer group">
                              <div className="flex items-center space-x-4">
                                <img 
                                  src={car.images?.[0] || 'https://via.placeholder.com/80x60?text=No+Image'} 
                                  alt={`${car.make} ${car.model}`}
                                  className="w-20 h-15 rounded-xl object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-medium text-sm group-hover:text-[#FF4646] transition-colors">
                                    {car.make} {car.model}
                                  </div>
                                  <div className="text-gray-400 text-xs mt-1">
                                    {car.location} • {car.fuel_type || 'N/A'} • {car.transmission || 'N/A'}
                                  </div>
                                  <div className="flex items-center space-x-3 mt-2">
                                    <div className="text-[#FF4646] font-semibold text-sm">
                                      €{car.price_per_day}/day
                                    </div>
                                    {car.rating && (
                                      <div className="flex items-center space-x-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700" className="text-yellow-400">
                                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                        </svg>
                                        <span className="text-gray-400 text-xs">{car.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-gray-500 group-hover:text-[#FF4646] transition-colors">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Suggestions */}
                  {followUpSuggestions.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-gray-400 text-sm font-medium">Suggestions</div>
                      <div className="space-y-2">
                        {followUpSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickSearch(suggestion)}
                            className="w-full text-left p-3 bg-gray-800/20 hover:bg-gray-800/40 border border-gray-700/30 rounded-xl text-gray-300 text-sm transition-all"
                          >
                            💡 {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Search Button */}
                  <div className="pt-4 border-t border-gray-800">
                    <button
                      onClick={handleBack}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-2xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                        <path d="M21 21l-4.35-4.35" strokeWidth="2"/>
                      </svg>
                      <span>New search</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 