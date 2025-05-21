import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onChange: (minValue: number, maxValue: number) => void;
  formatValue?: (value: number) => string;
  unit?: string;
  color?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  minValue,
  maxValue,
  onChange,
  formatValue = (value) => value.toString(),
  unit = '',
  color = '#6b72f2',
}) => {
  const [localMinValue, setLocalMinValue] = useState(minValue);
  const [localMaxValue, setLocalMaxValue] = useState(maxValue);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  
  const trackRef = useRef<HTMLDivElement>(null);
  
  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };
  
  const minThumbProps = useSpring({
    left: `${getPercentage(localMinValue)}%`,
    config: { tension: 300, friction: 30 }
  });
  
  const maxThumbProps = useSpring({
    left: `${getPercentage(localMaxValue)}%`,
    config: { tension: 300, friction: 30 }
  });
  
  const progressProps = useSpring({
    left: `${getPercentage(localMinValue)}%`,
    right: `${100 - getPercentage(localMaxValue)}%`,
    config: { tension: 300, friction: 30 }
  });
  
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const value = Math.round((percentage * (max - min) + min) / step) * step;
    
    // Determine which thumb to move based on distance
    const minDistance = Math.abs(value - localMinValue);
    const maxDistance = Math.abs(value - localMaxValue);
    
    if (minDistance <= maxDistance) {
      setLocalMinValue(value);
      onChange(value, localMaxValue);
    } else {
      setLocalMaxValue(value);
      onChange(localMinValue, value);
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const value = Math.round((percentage * (max - min) + min) / step) * step;
    
    if (isDragging === 'min') {
      if (value < localMaxValue) {
        setLocalMinValue(value);
        onChange(value, localMaxValue);
      }
    } else {
      if (value > localMinValue) {
        setLocalMaxValue(value);
        onChange(localMinValue, value);
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(null);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove as unknown as EventListener);
      window.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as unknown as EventListener);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Update local values when props change
  useEffect(() => {
    setLocalMinValue(minValue);
    setLocalMaxValue(maxValue);
  }, [minValue, maxValue]);
  
  return (
    <div className="w-full px-2 py-4">
      <div 
        ref={trackRef}
        className="relative h-1 bg-gray-700 rounded-full cursor-pointer"
        onClick={handleTrackClick}
      >
        <animated.div 
          className="absolute h-full rounded-full"
          style={{ 
            ...progressProps,
            backgroundColor: color
          }} 
        />
        
        <animated.div
          className="absolute w-6 h-6 -mt-2.5 -ml-3 bg-white rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={minThumbProps}
          onMouseDown={() => setIsDragging('min')}
          onTouchStart={() => setIsDragging('min')}
        />
        
        <animated.div
          className="absolute w-6 h-6 -mt-2.5 -ml-3 bg-white rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={maxThumbProps}
          onMouseDown={() => setIsDragging('max')}
          onTouchStart={() => setIsDragging('max')}
        />
      </div>
      
      <div className="flex justify-between mt-6">
        <div className="px-4 py-2 bg-[#212121] border border-gray-700 rounded-md text-white">
          {formatValue(localMinValue)}{unit}
        </div>
        <div className="px-4 py-2 bg-[#212121] border border-gray-700 rounded-md text-white">
          {formatValue(localMaxValue)}{unit}
        </div>
      </div>
    </div>
  );
};

export default RangeSlider; 