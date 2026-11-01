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
  const [selected, setSelected] = useState<HotspotData | null>(null);
  const [showExplore, setShowExplore] = useState(false);

  // Delay explore button appearance for cinematic feel
  useEffect(() => {
    const t = setTimeout(() => setShowExplore(true), 3500);
    return () => clearTimeout(t);
  }, []);

  // Keyboard navigation
  const handleExplore = () => {
    if (selected) {
      window.location.href = `/activities/${selected.slug}`;
    }
    setSelected(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* ── Forest/Landscape Background ── */}
      <Landscape />

      {/* ── Creative Navigation ── */}
      <CreativeNav />

      {/* ── Hotspot Layer ── */}
      <div className="absolute inset-0 z-10">
        {hotspots.map((h, i) => (
          <Hotspot
            key={h.id}
            hotspot={{ ...h, slug: h.slug }}
            index={i}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* ── Page Title Overlay ── */}
      <motion.div
        className="absolute top-12 left-0 right-0 z-20 text-center pointer-events-none"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white/90 tracking-wide">
          Branson
        </h1>
        <p className="text-sm md:text-base text-white/40 font-outfit tracking-[0.3em] uppercase mt-2">
          The Heart of the Ozarks
        </p>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mx-auto mt-4" />
      </motion.div>

      {/* ── Selected Detail Modal ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="max-w-lg mx-4"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl glow-card">
                {/* Image with overlay */}
                <div className="relative h-56">
                  <img
                    src={selected.image}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/40 to-transparent" />

                  {/* Category badge */}
                  <div
                    className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${categoryBadge[selected.category] ?? 'badge-adventure'}`}
                  >
                    {selected.category}
                  </div>

                  {/* Close button */}
                  <button
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
                    onClick={() => setSelected(null)}
                  >
                    ✕
                  </button>
                </div>

                {/* Detail content */}
                <div className="p-6 bg-[#1a1f1c]/95 backdrop-blur-md rounded-b-2xl">
                  <h2 className="text-2xl font-playfair font-bold text-white mb-2">
                    {selected.title}
                  </h2>
                  <p className="text-gray-300 font-outfit text-sm leading-relaxed mb-4">
                    {selected.description}
                  </p>

                  {/* Explore → fly button */}
                  <motion.button
                    className="group bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 px-4 py-3 rounded-lg text-sm font-outfit font-medium transition-all w-full cursor-pointer flex items-center justify-center gap-2"
                    onClick={handleExplore}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Explore This Experience</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      ↑
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="relative pb-6 px-6">
              <p className="text-center text-white/40 text-xs font-outfit tracking-widest uppercase mb-4">
                Tap any hotspot above • or explore them all below
              </p>

              {/* Mini activity grid */}
              <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-hide">
                {hotspots.map((h, i) => (
                  <motion.a
                    key={h.id}
                    href={`/activities/${h.slug}`}
                    className="flex-shrink-0 w-48 overflow-hidden rounded-xl relative group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="relative h-28">
                      <img
                        src={h.image}
                        alt={h.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d]/90 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${categoryBadge[h.category] ?? 'badge-adventure'}`}>
                          {h.category}
                        </div>
                        <p className="text-white text-xs font-outfont font-bold mt-1 line-clamp-1">{h.title}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-amber-400 text-xs">↑</span>
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
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: showExplore ? 0 : 1 }}
        transition={{ delay: 4, duration: 1 }}
      >
        <span className="text-white/40 text-xs font-outfit tracking-widest uppercase mb-2">
          Scroll to explore
        </span>
        <div className="scroll-indicator w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
