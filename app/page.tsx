'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Landscape from './components/Landscape';
import Hotspot from './components/Hotspot';
import CreativeNav from './components/CreativeNav';
import { getActivityHotspots, categoryBadge } from './data/activities';

type HotspotData = ReturnType<typeof getActivityHotspots>[number];

export default function HomePage() {
  const [hotspots] = useState<HotspotData[]>(() => getActivityHotspots());
  const [showExplore, setShowExplore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on client only — useEffect prevents hydration mismatch
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Delay explore grid appearance for cinematic feel
  useEffect(() => {
    const t = setTimeout(() => setShowExplore(true), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* ── Forest/Landscape Background ── */}
      <Landscape isMobile={isMobile} />

      {/* ── Creative Navigation ── */}
      <CreativeNav />

      {/* ── Hotspot Layer (tap → direct navigation via <a> tag) ── */}
      {/* suppressHydrationWarning: isMobile value differs between SSR (false) and client (true on mobile) */}
      <div className="absolute inset-0 z-10" suppressHydrationWarning>
        {hotspots.map((h, i) => (
          <Hotspot
            key={h.id}
            hotspot={{ ...h, slug: h.slug }}
            index={i}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* ── Scroll to Explore Grid ── */}
      <AnimatePresence>
        {showExplore && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-20"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Gradient fade */}
            <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0f0d] to-transparent pointer-events-none" />

            {/* Explore all CTA */}
            <div className="relative pb-4 sm:pb-6 px-2 sm:px-6">
              <p className="text-center text-white/40 text-[10px] sm:text-xs font-outfit tracking-widest uppercase mb-2 sm:mb-4">
                {isMobile ? 'Tap any point above •' : 'Hover any hotspot above •'} or explore them all below
              </p>

              {/* Mini activity grid — horizontal scroll on mobile, wrapped grid on desktop */}
              <div className="flex gap-3 overflow-x-auto pb-4 px-2 sm:overflow-x-visible sm:flex-wrap sm:justify-center sm:gap-4 scrollbar-hide">
                {hotspots.map((h, i) => (
                  <motion.a
                    key={h.id}
                    href={`/activities/${h.slug}`}
                    className="flex-shrink-0 overflow-hidden rounded-xl relative w-[80vw] sm:w-56 md:w-64"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                  >
                    <div className="relative h-48 sm:h-48">
                      <img
                        src={h.image}
                        alt={h.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d]/95 via-[#0a0f0d]/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white ${categoryBadge[h.category] ?? 'badge-adventure'}`}>
                          {h.category}
                        </span>
                        <p className="text-white font-playfair font-bold mt-1 text-base sm:text-lg leading-tight">{h.title}</p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll indicator (fades out after grid appears) ── */}
      <motion.div
        className={`absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center ${showExplore ? 'bottom-48' : 'bottom-16 sm:bottom-20'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: showExplore ? 0 : 1 }}
        transition={{ delay: 4, duration: 1 }}
      >
        <span className="text-white/40 text-[10px] sm:text-xs font-outfit tracking-widest uppercase mb-2">
          Scroll to explore
        </span>
        <div className="scroll-indicator w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
