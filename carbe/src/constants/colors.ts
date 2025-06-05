/**
 * Carbe Brand Colors
 * Centralized color definitions for consistent branding across the platform
 */

export const COLORS = {
  // Primary Brand Colors
  primary: {
    red: '#FF4646',      // Primary CTA color, active states, brand highlights
    redHover: '#FF3333', // Hover state for red elements
    redLight: '#FF4646', // Light variant (same as primary for now)
    redDark: '#E63939',  // Dark variant for pressed states
  },

  // Accent Colors (Ferrari-inspired)
  accent: {
    yellow: '#FFC400',   // Secondary accents, badges, highlights
    green: '#00A650',    // Success states, confirmations
    orange: '#FF8C00',   // Warning states, notifications
  },

  // Neutral Colors (Silver/Gray palette)
  neutral: {
    brand: '#B0B0B0',    // Brand silver
    white: '#FFFFFF',
    black: '#000000',
  },

  // Gray Scale (Dark theme)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#0F1419',
  },

  // Dark Theme Specific
  dark: {
    background: '#212121',    // Main background
    surface: '#2A2A2A',       // Cards, modals, elevated surfaces
    surfaceVariant: '#1F1F1F', // Secondary surfaces
    border: '#374151',        // Default borders
    borderLight: '#4B5563',   // Lighter borders
  },

  // Status Colors
  status: {
    success: '#10B981',       // Green for success
    error: '#EF4444',         // Red for errors
    warning: '#F59E0B',       // Amber for warnings
    info: '#3B82F6',          // Blue for info
  },

  // Glassmorphism Colors
  glass: {
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: 'rgba(42, 42, 42, 0.8)',
    border: 'rgba(75, 85, 99, 0.3)',
    highlight: 'rgba(255, 70, 70, 0.1)', // Primary red with transparency
  }
} as const;

// Utility type for color keys
export type ColorKey = keyof typeof COLORS;

// Helper functions for common color operations
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = COLORS;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Color path "${path}" not found`);
      return '#FF4646'; // Fallback to primary red
    }
  }
  
  return typeof value === 'string' ? value : '#FF4646';
};

// Common color combinations
export const COLOR_COMBINATIONS = {
  primaryButton: {
    background: COLORS.primary.red,
    hover: COLORS.primary.redHover,
    active: COLORS.primary.redDark,
    text: COLORS.neutral.white,
  },
  
  glassmorphismCard: {
    background: 'backdrop-blur-xl bg-gradient-to-br from-gray-800/20 via-gray-900/10 to-transparent',
    border: 'border-gray-600/20',
    hover: 'hover:border-gray-500/30',
  },
  
  accentCard: {
    background: `bg-gradient-to-br from-[${COLORS.primary.red}]/10 via-[${COLORS.primary.red}]/5 to-transparent`,
    border: `border-[${COLORS.primary.red}]/20`,
  },
} as const;

export default COLORS; 