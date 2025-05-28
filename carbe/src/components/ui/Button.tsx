import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'host-primary' | 'host-secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#FF4646] hover:bg-[#FF4646]/90 text-white focus:ring-[#FF4646]/50 shadow-md',
    secondary: 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white border border-gray-700 focus:ring-gray-500/50',
    outline: 'border border-[#FF4646] text-[#FF4646] hover:bg-[#FF4646] hover:text-white focus:ring-[#FF4646]/50',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/10 focus:ring-white/20',
    'host-primary': 'bg-white hover:bg-gray-100 text-gray-900 focus:ring-gray-500/50 shadow-sm',
    'host-secondary': 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500/50',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 