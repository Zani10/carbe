import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '@/constants/colors';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  gradient?: 'default' | 'subtle' | 'accent';
}

export default function GlassCard({ 
  children, 
  className = '',
  hover = true,
  padding = 'md',
  gradient = 'default'
}: GlassCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const gradientClasses = {
    default: 'bg-gradient-to-br from-gray-800/20 via-gray-900/10 to-transparent',
    subtle: 'bg-gradient-to-br from-gray-800/10 via-gray-900/5 to-transparent',
    accent: `bg-gradient-to-br from-[${COLORS.primary.red}]/10 via-[${COLORS.primary.red}]/5 to-transparent border-[${COLORS.primary.red}]/20`
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative backdrop-blur-xl 
        ${gradientClasses[gradient]}
        border border-gray-600/20 
        rounded-2xl 
        ${paddingClasses[padding]}
        shadow-lg 
        ${hover ? 'hover:border-gray-500/30 transition-all' : ''} 
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
} 