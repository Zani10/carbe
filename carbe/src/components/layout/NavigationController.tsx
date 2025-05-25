"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import RenterBottomNav from './RenterBottomNav';
import HostBottomNav from './HostBottomNav';

const NavigationController = () => {
  const pathname = usePathname();

  // Don't show navigation on certain pages
  const hideNavigation = [
    '/signin',
    '/signup',
    '/verify',
    '/car/', // Car detail pages
    '/book/', // Booking pages
    '/host/garage/new', // Add car wizard
    '/unlock/', // Unlock car pages
  ].some(path => pathname?.startsWith(path));

  if (hideNavigation) {
    return null;
  }

  // Show host navigation ONLY if user is on host routes
  const isHostRoute = pathname?.startsWith('/host') || pathname?.startsWith('/dashboard/host');

  if (isHostRoute) {
    return <HostBottomNav />;
  }

  // Show renter navigation for all other pages
  return <RenterBottomNav />;
};

export default NavigationController; 