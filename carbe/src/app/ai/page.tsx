'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSmartBooking } from '@/hooks/ai/useSmartBooking';
import Link from 'next/link';

export default function AIPage() {
  const [query, setQuery] = useState('');
  const { processQuery, result, isLoading, error, resetResults } = useSmartBooking();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    await processQuery(query.trim());
  };

  const exampleQueries = [
    "I need a 7-seater for tomorrow near Brussels, under €100/day",
    "Find me an automatic car for the weekend in Antwerp",
    "Looking for a cheap car today in Ghent, budget max €50",
    "Need an SUV for next week near Liège",
    "Family car for 5 people, automatic, near Brussels",
    "Luxury car for special occasion in Antwerp"
  ];

  return (
    <main className="min-h-screen bg-[#212121] text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF4646]/20 via-transparent to-transparent"></div>
        
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Hero Section */}
          <div className="text-center space-y-6 mb-12">
            {/* AI Icon with animation */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative mx-auto w-20 h-20 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] opacity-30 blur-xl animate-pulse"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                  <path d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z" fill="currentColor" opacity="0.7"/>
                  <path d="M5 7L5.5 8.5L7 9L5.5 9.5L5 11L4.5 9.5L3 9L4.5 8.5L5 7Z" fill="currentColor" opacity="0.5"/>
                </svg>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold mb-3">Smart Booking AI</h1>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                Tell me what you need in natural language and I&apos;ll find the perfect car for you
              </p>
            </motion.div>
          </div>

          {/* Search Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-4 mb-8"
          >
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe the car you need... (e.g., 'I need a 7-seater for tomorrow near Brussels, under €100/day')"
                className="w-full bg-gray-800 text-white rounded-2xl p-6 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4646] placeholder-gray-500 min-h-[120px]"
                rows={4}
                disabled={isLoading}
              />
              
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="absolute right-4 bottom-4 w-12 h-12 bg-[#FF4646] hover:bg-[#FF3333] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
            </div>
          </motion.form>

          {/* Example Queries */}
          {!result && !error && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">Try these examples</h3>
              <div className="grid grid-cols-1 gap-3">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(example)}
                    className="text-left p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-300 text-sm transition-colors border border-gray-700/50"
                  >
                    &quot;{example}&quot;
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {(result || error) && (
        <div className="px-6 py-8 border-t border-gray-800">
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="text-red-400 text-lg font-medium">{error}</div>
              <button
                onClick={() => {
                  resetResults();
                  setQuery('');
                }}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* AI Response */}
              <div className="bg-gray-800 rounded-2xl p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF4646] to-[#FF6B6B] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1">AI Assistant</div>
                    <div className="text-gray-300 leading-relaxed">{result.explanation}</div>
                  </div>
                </div>
              </div>

              {/* Car Results */}
              {result.cars.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-semibold">Found {result.cars.length} perfect match{result.cars.length !== 1 ? 'es' : ''}</h3>
                  
                  <div className="space-y-4">
                    {result.cars.map((car) => (
                      <Link key={car.id} href={`/car/${car.id}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gray-800 rounded-2xl p-4 hover:bg-gray-750 transition-all cursor-pointer"
                        >
                          <div className="flex items-center space-x-4">
                            <img 
                              src={car.images?.[0] || 'https://via.placeholder.com/120x80?text=No+Image'} 
                              alt={`${car.make} ${car.model}`}
                              className="w-24 h-16 rounded-xl object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold text-lg">
                                {car.make} {car.model}
                              </div>
                              <div className="text-gray-400 text-sm">{car.location}</div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="text-[#FF4646] font-bold text-lg">
                                  €{car.price_per_day}/day
                                </div>
                                {car.rating && (
                                  <div className="flex items-center space-x-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-yellow-400">
                                      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                                    </svg>
                                    <span className="text-gray-300 text-sm">{car.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* New Search Button */}
              <div className="text-center pt-4">
                <button
                  onClick={() => {
                    resetResults();
                    setQuery('');
                  }}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-colors"
                >
                  Search Again
                </button>
              </div>
            </motion.div>
          ) : null}
        </div>
      )}
    </main>
  );
}
