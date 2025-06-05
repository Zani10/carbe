"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Car,
  MessageSquare,
  Menu,
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/colors';

interface HostBottomNavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  isOutlineIcon?: boolean;
}

const HostBottomNavItem: React.FC<HostBottomNavItemProps> = ({
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
        isActive ? 'text-gray-300 hover:text-gray-100' : 'text-gray-300 hover:text-gray-100'
      )}
      style={isActive ? { color: COLORS.primary.red } : {}}
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

const HostBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Listen for selection mode changes from calendar
  useEffect(() => {
    const handleSelectionModeChange = (event: CustomEvent) => {
      setIsSelectionMode(event.detail.isSelecting);
    };

    window.addEventListener('selectionModeChange', handleSelectionModeChange as EventListener);
    
    return () => {
      window.removeEventListener('selectionModeChange', handleSelectionModeChange as EventListener);
    };
  }, []);
  
  const navItems = [
    { path: '/host/home', icon: BarChart3, label: 'Home', isOutlineIcon: true, requiresAuth: true },
    { path: '/host/calendar', icon: Calendar, label: 'Calendar', isOutlineIcon: true, requiresAuth: true },
    { path: '/host/garage', icon: Car, label: 'Garage', isOutlineIcon: true, requiresAuth: true },
    { path: '/host/messages', icon: MessageSquare, label: 'Inbox', isOutlineIcon: true, requiresAuth: true },
    { path: '/host/menu', icon: Menu, label: 'Menu', isOutlineIcon: true, requiresAuth: true },
  ];

  const handleNavigation = (path: string, requiresAuth: boolean) => {
    if (requiresAuth && !user && !isLoading) {
      // If auth is required but no user is logged in, redirect to profile to show login form
      router.push('/profile');
    } else {
      router.push(path);
    }
  };

  const getIsActive = (path: string): boolean => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none transition-opacity duration-300 ${
        isSelectionMode ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <div className="relative w-full max-w-[437px] pointer-events-auto shadow-[0px_-5px_25px_-5px_rgba(0,0,0,0.2),_0px_-3px_10px_-7px_rgba(0,0,0,0.15)]">
        {/* Layer in the back: Angular gradient attempt */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[96px] rounded-t-[80px] z-0
            bg-[conic-gradient(from_180deg_at_50%_70%,_#292929_0%,_#707070_100%)]"
        />

        {/* Layer between the 2: Solid color, holds the content */}
        <div className="absolute inset-x-0 bottom-0 h-[89px] rounded-t-[80px] bg-[#292929] flex justify-center items-stretch gap-x-3 z-10">
          {navItems.map((item) => (
            <HostBottomNavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={getIsActive(item.path)}
              onClick={() => handleNavigation(item.path, item.requiresAuth)}
              isOutlineIcon={item.isOutlineIcon}
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