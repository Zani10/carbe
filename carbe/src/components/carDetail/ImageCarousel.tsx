'use client'

import React, { useState, useRef } from 'react';
import { Share2, Heart, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

interface ImageCarouselProps {
  images: string[];
  rating: number;
  location: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onBack?: () => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  rating,
  location,
  isFavorite = false,
  onToggleFavorite = () => {},
  onShare = () => {},
  onBack = () => {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      goToNext();
    }
    if (touchStart - touchEnd < -50) {
      // Swipe right
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="relative w-full h-[60vh] bg-black">
      {/* Main Image with rounded corners at bottom */}
      <div 
        ref={carouselRef}
        className="relative w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="w-full h-full flex transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${images.length * 100}%`
          }}
        >
          {images.map((img, index) => (
            <div 
              key={index} 
              className="relative h-full"
              style={{ width: `${100 / images.length}%` }}
            >
              <img
                src={img}
                alt={`Car image ${index + 1}`}
                className="w-full h-full object-cover rounded-b-[35px]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute left-4 top-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-[30px] flex items-center justify-center text-white"
        aria-label="Go back"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Top right icons */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={onShare}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-[30px] flex items-center justify-center text-white"
          aria-label="Share"
        >
          <Share2 size={20} />
        </button>
        <button
          onClick={onToggleFavorite}
          className={clsx(
            "w-10 h-10 rounded-full bg-black/30 backdrop-blur-[30px] flex items-center justify-center",
            isFavorite ? "text-red-500" : "text-white"
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Location indicator */}
      <div className="absolute bottom-16 left-4 flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-white text-sm font-medium">{location}</span>
      </div>

      {/* Rating indicator */}
      <div className="absolute bottom-16 right-4 flex items-center space-x-1 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
        <span className="text-yellow-400">★</span>
        <span className="text-white text-sm font-medium">{rating.toFixed(1)}</span>
      </div>

      {/* Pagination indicators (dots) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5">
        {images.map((_, index) => (
          <div 
            key={index} 
            className={clsx(
              "h-1 rounded-full transition-all duration-200",
              currentIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
            )}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel; 