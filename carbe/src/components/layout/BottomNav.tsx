"use client";

import React from 'react';
import {
  Compass,
  Heart,
  Car,
  MessageSquare,
  UserCircle2,
} from 'lucide-react';
import clsx from 'clsx';

interface BottomNavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  isOutlineIcon?: boolean;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  isOutlineIcon,
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center justify-center pt-4 pb-2 px-2 focus:outline-none transition-colors duration-150 ease-in-out',
        isActive ? 'text-red-500' : 'text-gray-300 hover:text-gray-100'
      )}
    >
      <Icon 
        className="h-6 w-6" 
        strokeWidth={isActive ? 2.5 : 1.8}
        fill={isActive && !isOutlineIcon ? 'currentColor' : 'none'}
      />
      <span className={clsx("text-xs mt-1 font-medium", isActive ? "font-semibold" : "font-normal")}>{label}</span>
    </button>
  );
};

const BottomNav = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const navItems = [
    { icon: Compass, label: 'Explore', isOutlineIcon: true },
    { icon: Heart, label: 'Saved', isOutlineIcon: false },
    { icon: Car, label: 'Rides', isOutlineIcon: true },
    { icon: MessageSquare, label: 'Inbox', isOutlineIcon: true },
    { icon: UserCircle2, label: 'Profile', isOutlineIcon: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <div className="relative w-[437px] pointer-events-auto shadow-[0px_-5px_25px_-5px_rgba(0,0,0,0.2),_0px_-3px_10px_-7px_rgba(0,0,0,0.15)]">
        {/* Layer in the back: Angular gradient attempt */}
        {/* Tailwind doesn't have native angular gradients. This is an approximation. */}
        {/* For a true angular gradient, custom CSS/SVG might be needed. */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[96px] rounded-t-[80px] z-0
            bg-[conic-gradient(from_180deg_at_50%_70%,_#292929_0%,_#707070_100%)]"
        />

        {/* Layer between the 2: Solid color, holds the content */}
        <div className="absolute inset-x-0 bottom-0 h-[89px] rounded-t-[80px] bg-[#292929] flex justify-center items-stretch gap-x-3 z-10">
          {navItems.map((item, index) => (
            <BottomNavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              isOutlineIcon={item.isOutlineIcon}
            />
          ))}
        </div>

        {/* Layer on top: Linear gradient with blur for highlight/sheen */}
        <div
          className="absolute inset-x-0 bottom-0 h-[89px] rounded-t-[80px] blur-[8px] z-20 pointer-events-none
            bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.22)_0%,_rgba(255,255,255,0.12)_12%,_rgba(255,255,255,0)_28%)]"
        />
         {/* This top layer's opacity/gradient stops might need tweaking to achieve the exact visual depth */}
      </div>
    </div>
  );
};

export default BottomNav; 