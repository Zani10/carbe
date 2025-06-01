'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Car } from 'lucide-react';

interface BookingImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function BookingImageCarousel({ images, alt, className = '' }: BookingImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <Car className="h-16 w-16 text-gray-600" />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Image */}
      <div className="relative w-full h-full overflow-hidden rounded-t-2xl">
        <Image
          src={images[currentIndex]}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-300"
        />
        
        {/* Navigation Arrows - Only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 rounded-full">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Dots Indicator - Only show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 