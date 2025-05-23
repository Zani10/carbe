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
        'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200',
        isActive 
          ? 'bg-gray-900 text-white shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      <Icon className="h-5 w-5 mb-1" strokeWidth={isActive ? 2 : 1.5} />
      <span className="text-xs font-medium">{label}</span>
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
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-md mx-auto">
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
    </div>
  );
};

export default HostBottomNav; 