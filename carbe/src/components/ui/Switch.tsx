import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import clsx from 'clsx';

interface SwitchProps {
  isChecked: boolean;
  onChange: () => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  isChecked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translateX: 16,
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translateX: 20,
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translateX: 28,
    },
  };

  const springProps = useSpring({
    transform: isChecked ? `translateX(${sizes[size].translateX}px)` : 'translateX(2px)',
    config: { tension: 300, friction: 20 },
  });

  return (
    <div className={clsx('flex items-center', className)}>
      {(label || description) && (
        <div className="flex-grow mr-3">
          {label && <div className="text-white font-medium">{label}</div>}
          {description && <div className="text-gray-400 text-sm">{description}</div>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={onChange}
        className={clsx(
          'relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4646]',
          disabled && 'opacity-50 cursor-not-allowed',
          isChecked ? 'bg-[#FF4646]' : 'bg-gray-700',
          sizes[size].track
        )}
      >
        <span className="sr-only">{label}</span>
        <animated.span
          className={clsx(
            'pointer-events-none rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200',
            sizes[size].thumb
          )}
          style={springProps}
        />
      </button>
    </div>
  );
};

export default Switch; 