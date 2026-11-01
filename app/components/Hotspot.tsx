'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HotspotProps {
  hotspot: {
    id: string;
    x: number;
    y: number;
    title: string;
    category: string;
    description: string;
    image: string;
    slug: string;
  };
  index: number;
  onSelect: (h: HotspotProps['hotspot']) => void;
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

export default function Hotspot({ hotspot, index, onSelect, isMobile }: HotspotProps) {
  const [active, setActive] = useState(false);
  const badgeClass = badgeClasses[hotspot.category] || 'badge-adventure';

  const handleClick = useCallback(() => {
    // Always navigate on tap/click — never toggle popup
    onSelect(hotspot);
  }, [hotspot, onSelect]);

  // Only toggle popup on hover (desktop) — no popup on mobile at all
  const handleMouseEnter = useCallback(() => {
    if (!isMobile) setActive(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) setActive(false);
  }, [isMobile]);

  return (
    <motion.div
      className="absolute"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 2.5 + index * 0.25, ease: 'easeOut' }}
    >
      {/* Touch target — bigger on mobile */}
      <button
        className={`absolute cursor-pointer rounded-full bg-transparent ${isMobile ? '-left-5 -top-5 w-10 h-10' : '-left-3 -top-3 w-6 h-6'}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`Explore ${hotspot.title}`}
      >
        {/* Pulse rings */}
        <div className="absolute inset-0 -m-3 rounded-full bg-amber-400/30 hotspot-ring" />
        <div className="absolute inset-0 -m-1.5 rounded-full bg-amber-400/20 hotspot-ring" style={{ animationDelay: '0.5s' }} />

        {/* Dot */}
        <div className={`absolute inset-0 m-auto rounded-full bg-amber-400 flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-5 h-5'}`}>
          <div className={`rounded-full bg-white ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}`} />
        </div>
      </button>

      {/* Label */}
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

      {/* Desktop-only hover card — never renders on mobile */}
      <AnimatePresence>
        {!isMobile && active && (
          <motion.div
            className="absolute left-10 top-6 w-60 rounded-xl overflow-hidden shadow-2xl pointer-events-auto z-50"
            style={{ backgroundColor: '#1a1f1c' }}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            onClick={handleClick}
          >
            <div className="relative h-28">
              <img src={hotspot.image} alt={hotspot.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className={`absolute bottom-2 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${badgeClass}`}>
                {hotspot.category}
              </span>
            </div>
            <div className="p-3">
              <h3 className="text-white font-playfair font-bold text-sm mb-1">{hotspot.title}</h3>
              <p className="text-gray-300 text-xs leading-relaxed font-outfit line-clamp-2">{hotspot.description}</p>
              <span className="text-amber-300 text-xs font-medium">Explore →</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
