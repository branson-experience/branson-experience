'use client';

import { motion } from 'framer-motion';

interface HotspotProps {
  hotspot: {
    id: string;
    x: number;
    y: number;
    title: string;
    category: string;
    slug: string;
  };
  index: number;
  isMobile?: boolean;
}

const badgeClasses: Record<string, string> = {
  adventure: 'badge-adventure',
  water: 'badge-water',
  cultural: 'badge-cultural',
  outdoor: 'badge-outdoor',
  entertainment: 'badge-entertainment',
  relaxation: 'badge-relaxation',
  dining: 'badge-dining',
  cruise: 'badge-cruise',
};

export default function Hotspot({ hotspot, index, isMobile }: HotspotProps) {
  const href = `/activities/${hotspot.slug}`;

  return (
    <motion.div
      className="absolute"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 2.5 + index * 0.25, ease: 'easeOut' }}
    >
      {/* Clickable area — expanded touch target */}
      {/* pointer-events-auto: parent layer is pointer-events-none, re-enable here so dots stay tappable */}
      <a
        href={href}
        className={`pointer-events-auto absolute ${isMobile ? '-left-6 -top-6 w-12 h-12' : '-left-5 -top-5 w-10 h-10'} rounded-full flex items-center justify-center`}
        title={`Explore ${hotspot.title}`}
      />

      {/* Pulse rings */}
      <div className="absolute inset-0 -m-3 rounded-full bg-amber-400/30 hotspot-ring pointer-events-none" />
      <div className="absolute inset-0 -m-1.5 rounded-full bg-amber-400/20 hotspot-ring pointer-events-none" style={{ animationDelay: '0.5s' }} />

      {/* Dot — visual only, click handled by <a> behind it */}
      <div className={`absolute inset-0 m-auto rounded-full bg-amber-400 hotspot-dot flex items-center justify-center pointer-events-none ${isMobile ? 'w-8 h-8' : 'w-5 h-5'}`}>
        <div className={`rounded-full bg-white ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}`} />
      </div>

      {/* Label above dot */}
      <motion.div
        className="pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 3.5 + index * 0.2 }}
      >
        <span
          className={`absolute font-outfit font-medium tracking-wide whitespace-nowrap ${isMobile ? 'text-[10px]' : 'text-xs'}`}
          style={{
            left: isMobile ? `${hotspot.x}%` : `${hotspot.x + 3}%`,
            top: isMobile ? `${hotspot.y - 6}%` : `${hotspot.y}%`,
            transform: isMobile ? 'translateX(-50%)' : 'translateY(-50%)',
            color: '#fff',
            textShadow: '0 0 10px rgba(0,0,0,0.8)',
          }}
        >
          {hotspot.title}
        </span>
      </motion.div>
    </motion.div>
  );
}
