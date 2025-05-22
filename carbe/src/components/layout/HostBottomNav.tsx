'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, // Today
  CalendarDays,  // Calendar
  Car,           // Listings (using Car as a placeholder, consider a more specific icon if available)
  MessageSquare, // Messages
  Menu           // Menu
} from 'lucide-react';
import clsx from 'clsx';

const hostNavItems = [
  { name: 'Today', href: '/dashboard/host/today', icon: LayoutDashboard },
  { name: 'Calendar', href: '/dashboard/host/calendar', icon: CalendarDays },
  { name: 'Listings', href: '/dashboard/host/listings', icon: Car },
  { name: 'Messages', href: '/dashboard/host/messages', icon: MessageSquare },
  { name: 'Menu', href: '/dashboard/host/menu', icon: Menu },
];

export default function HostBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-top-sm">
      <div className="max-w-md mx-auto flex justify-around items-center h-20">
        {hostNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard/host/today' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center text-center px-3 py-2 rounded-lg transition-colors duration-150 w-1/5',
                {
                  'text-accent-1': isActive,
                  'text-gray-500 hover:text-gray-700': !isActive,
                }
              )}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={clsx(
                'text-xs mt-1 font-medium',
                { 'text-accent-1': isActive, 'text-gray-700': !isActive }
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 