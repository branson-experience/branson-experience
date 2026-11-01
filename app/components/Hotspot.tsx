'use client';

import { useState, useCallback } from 'react';
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
  // Desktop only: hover opens preview card
  const [active, setActive] = useState(false);
  const badgeClass = badgeClasses[hotspot.category] || 'badge-adventure';

  // On mobile: tap navigates directly. On desktop: click opens card.
  const handleClick = useCallback(() => {
    if (isMobile) {
      onSelect(hotspot);
    } else {
      setActive(a => !a);
    }
  }, [isMobile, hotspot, onSelect]);

  const handleExplore = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActive(false);
    onSelect(hotspot);
  }, [hotspot, onSelect]);

  return (
    <motion.div
      className="absolute cursor-pointer hotspot-enter z-20"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 2.5 + index * 0.25, ease: 'easeOut' }}
      onClick={handleClick}
      onMouseEnter={() => !isMobile && setActive(true)}
      onMouseLeave={() => !isMobile && setActive(false)}
    >
      {/* Pulse rings */}
      <div className="absolute inset-0 -m-4 rounded-full bg-amber-400/30 hotspot-ring" />
      <div className="absolute inset-0 -m-2 rounded-full bg-amber-400/20 hotspot-ring" style={{ animationDelay: '0.5s' }} />

      {/* Dot */}
      <div className={`relative rounded-full bg-amber-400 hotspot-dot flex items-center justify-center ${isMobile ? 'w-10 h-10' : 'w-5 h-5'}`}>
        <div className={`rounded-full bg-white ${isMobile ? 'w-4 h-4' : 'w-2 h-2'}`} />
      </div>

      {/* Label */}
      <motion.div
        className="pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 3.5 + index * 0.2 }}
        style={isMobile
          ? { position: 'absolute', left: '50%', bottom: '100%', marginBottom: '8px', transform: 'translateX(-50%)' }
          : { position: 'absolute', left: '28px', top: '50%', transform: 'translateY(-50%)' }
        }
      >
        <span
          className="font-outfit font-medium tracking-wide whitespace-nowrap"
          style={{ color: '#fff', fontSize: isMobile ? '11px' : '12px', textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
        >
          {hotspot.title}
        </span>
      </motion.div>

      {/* Desktop hover card — not shown on mobile (mobile taps navigate directly) */}
      {!isMobile && (
        <AnimatePresence>
          {active && (
            <motion.div
              className="absolute left-7 top-full mt-3 w-64 rounded-xl overflow-hidden shadow-2xl pointer-events-auto z-30"
              style={{ backgroundColor: '#1a1f1c' }}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={handleExplore}
            >
              <div className="relative h-32">
                <img src={hotspot.image} alt={hotspot.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className={`absolute bottom-2 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${badgeClass}`}>
                  {hotspot.category}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-white font-playfair font-bold text-sm mb-1">{hotspot.title}</h3>
                <p className="text-gray-300 text-xs leading-relaxed font-outfit line-clamp-2">{hotspot.description}</p>
                <div className="mt-2 text-amber-300 text-xs font-outfont font-medium">Explore →</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
