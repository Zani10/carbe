'use client'

import React from 'react';
import { Share2, Heart, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

interface HeaderBarProps {
  showTitle?: boolean;
  title?: string;
  isFavorite?: boolean;
  isTransparent?: boolean;
  onBack?: () => void;
  onShare?: () => void;
  onToggleFavorite?: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  showTitle = false,
  title = '',
  isFavorite = false,
  isTransparent = true,
  onBack = () => {},
  onShare = () => {},
  onToggleFavorite = () => {},
}) => {
  const containerClass = clsx(
    'w-full px-4 py-3 flex items-center justify-between transition-all duration-300',
    isTransparent ? 'bg-transparent' : 'bg-[#212121]/90 backdrop-blur-md shadow-md'
  );
  
  return (
    <div className={containerClass}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-[30px] flex items-center justify-center text-white transition-all hover:bg-black/40"
        aria-label="Go back"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Title (only shown when scrolled) */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 whitespace-nowrap" 
           style={{ opacity: showTitle ? 1 : 0 }}>
        <h1 className="text-white font-medium text-lg">{title}</h1>
      </div>

      {/* Right buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onShare}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-[30px] flex items-center justify-center text-white transition-all hover:bg-black/40"
          aria-label="Share"
        >
          <Share2 size={20} />
        </button>
        <button
          onClick={onToggleFavorite}
          className={clsx(
            "w-10 h-10 rounded-full bg-black/30 backdrop-blur-[30px] flex items-center justify-center transition-all",
            isFavorite ? "text-red-500 hover:bg-red-500/10" : "text-white hover:bg-black/40"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} className="transition-transform duration-200 hover:scale-110" />
        </button>
      </div>
    </div>
  );
};

export default HeaderBar; 