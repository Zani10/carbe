"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from './BottomNav';
import HostBottomNav from './HostBottomNav';

const NavigationController = () => {
  const pathname = usePathname();
  const { user, isHostMode } = useAuth();

  // Don't show navigation on certain pages
  const hideNavigation = [
    '/signin',
    '/signup',
    '/verify',
    '/car/', // Car detail pages
    '/book/', // Booking pages
  ].some(path => pathname?.startsWith(path));

  if (hideNavigation) {
    return null;
  }

  // Show host navigation if user is in host mode or on host pages
  const isHostRoute = pathname?.startsWith('/host') || pathname?.startsWith('/dashboard/host');
  const shouldShowHostNav = user && (isHostMode || isHostRoute);

  if (shouldShowHostNav) {
    return <HostBottomNav />;
  }

  // Show regular navigation for renter mode or general pages
  return <BottomNav />;
};

export default NavigationController; 