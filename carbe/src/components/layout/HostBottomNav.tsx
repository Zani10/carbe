"use client";

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Car,
  MessageSquare,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter, usePathname } from 'next/navigation';

interface HostNavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const HostNavItem: React.FC<HostNavItemProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
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
        fill={isActive ? 'none' : 'none'}
      />
      <span className={clsx("text-xs mt-1 font-medium", isActive ? "font-semibold" : "font-normal")}>{label}</span>
    </button>
  );
};

const HostBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const navItems = [
    { path: '/host/today', icon: LayoutDashboard, label: 'Today' },
    { path: '/host/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/host/listings', icon: Car, label: 'Listings' },
    { path: '/host/messages', icon: MessageSquare, label: 'Inbox' },
    { path: '/host/menu', icon: Settings, label: 'Menu' },
  ];

  const getIsActive = (path: string): boolean => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <div className="relative w-full max-w-[437px] pointer-events-auto shadow-[0px_-5px_25px_-5px_rgba(0,0,0,0.2),_0px_-3px_10px_-7px_rgba(0,0,0,0.15)]">
        {/* Layer in the back: Angular gradient attempt */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[96px] rounded-t-[80px] z-0
            bg-[conic-gradient(from_180deg_at_50%_70%,_#292929_0%,_#707070_100%)]"
        />

        {/* Layer between the 2: Solid color, holds the content */}
        <div className="absolute inset-x-0 bottom-0 h-[89px] rounded-t-[80px] bg-[#292929] flex justify-center items-stretch gap-x-3 z-10">
          {navItems.map((item) => (
            <HostNavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={getIsActive(item.path)}
              onClick={() => router.push(item.path)}
            />
          ))}
        </div>

        {/* Layer on top: Linear gradient with blur for highlight/sheen */}
        <div
          className="absolute inset-x-0 bottom-0 h-[89px] rounded-t-[80px] blur-[8px] z-20 pointer-events-none
            bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.22)_0%,_rgba(255,255,255,0.12)_12%,_rgba(255,255,255,0)_28%)]"
        />
      </div>
    </div>
  );
};

export default HostBottomNav; 