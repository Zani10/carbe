import React from 'react';
import clsx from 'clsx';

interface FilterGroupProps {
  title?: string;
  subtitle?: string;
  count?: number; 
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  subtitle,
  count,
  rightAction,
  children,
  className,
}) => {
  return (
    <div className={clsx('mb-8', className)}>
      {/* Header */}
      {(title || rightAction) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-2xl font-medium text-white flex items-center">
                {title}
                {count !== undefined && (
                  <span className="ml-2 text-sm bg-[#FF4646] text-white px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </h3>
            )}
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
          </div>
          {rightAction && <div>{rightAction}</div>}
        </div>
      )}
      
      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FilterGroup; 