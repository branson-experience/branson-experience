'use client';

import { motion } from 'framer-motion';
import { ReactNode, CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
  rounded?: string;
  hover?: boolean;
  style?: CSSProperties;
}

const intensityStyles: Record<string, string> = {
  light: 'rgba(255, 255, 255, 0.05) 0px 4px 30px rgba(0, 0, 0, 0.1)',
  medium: 'rgba(255, 255, 255, 0.1) 0px 8px 40px rgba(0, 0, 0, 0.2)',
  heavy: 'rgba(255, 255, 255, 0.15) 0px 8px 60px rgba(0, 0, 0, 0.3)',
};

const bgStyles: Record<string, string> = {
  light: 'rgba(10, 15, 13, 0.4)',
  medium: 'rgba(10, 15, 13, 0.6)',
  heavy: 'rgba(10, 15, 13, 0.8)',
};

export default function GlassCard({
  children,
  intensity = 'medium',
  className = '',
  rounded = '2xl',
  hover = true,
  style,
}: GlassCardProps) {
  return (
    <motion.div
      className={`backdrop-blur-xl border border-white/10 rounded-${rounded} ${className}`}
      style={{
        backgroundColor: bgStyles[intensity],
        boxShadow: intensityStyles[intensity],
        ...style,
      }}
      {...(hover ? {
        whileHover: {
          scale: 1.01,
          backgroundColor: bgStyles[intensity === 'light' ? 'medium' : intensity],
          boxShadow: intensityStyles[intensity === 'light' ? 'medium' : intensity],
        },
        transition: { duration: 0.3 },
      } : {})}
    >
      {children}
    </motion.div>
  );
}
