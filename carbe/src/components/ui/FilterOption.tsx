import React from 'react';
import clsx from 'clsx';

interface FilterOptionProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const FilterOption: React.FC<FilterOptionProps> = ({
  id,
  label,
  icon,
  isSelected = false,
  onClick,
  className,
}) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center justify-center p-4 rounded-2xl transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6b72f2]',
        isSelected 
          ? 'bg-[#6b72f2] text-white border border-[#6b72f2]' 
          : 'bg-[#212121] border border-gray-700 hover:border-gray-500 text-white',
        className
      )}
    >
      {icon && <div className="mb-2 text-2xl">{icon}</div>}
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </button>
  );
};

export default FilterOption; 