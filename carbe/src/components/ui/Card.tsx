import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'dark',
  padding = 'md',
  className,
  onClick,
}) => {
  const baseClasses = 'transition-all duration-200';
  
  const variants = {
    dark: 'bg-[#2A2A2A] border border-gray-700/50 text-white',
    light: 'bg-white border border-gray-200 text-gray-900 shadow-sm',
    glass: 'bg-black/20 backdrop-blur-md border border-white/10 text-white',
  };
  
  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={clsx(
        baseClasses,
        variants[variant],
        paddings[padding],
        'rounded-xl',
        onClick && 'hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF2800]/50 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export default Card; 