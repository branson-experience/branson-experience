'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, ReactNode } from 'react';

interface FlyTransitionProps {
  trigger: boolean;
  hotspotOrigin?: { x: number; y: number };
  onComplete?: () => void;
  children: ReactNode;
}

export default function FlyTransition({
  trigger,
  hotspotOrigin = { x: 50, y: 50 },
  onComplete,
  children,
}: FlyTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'outbound' | 'loading' | 'inbound'>('idle');

  useEffect(() => {
    if (trigger && phase === 'idle') {
      setPhase('outbound');
      const t1 = setTimeout(() => setPhase('loading'), 600);
      const t2 = setTimeout(() => { setPhase('inbound'); onComplete?.(); }, 2600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [trigger, phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none"
          style={{ overflow: 'hidden' }}
        >
          {/* Phase 1: Zoom out from hotspot — camera pulls deep into the scene */}
          {phase === 'outbound' && (
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${hotspotOrigin.x}% ${hotspotOrigin.y}%, rgba(255,170,50,0.3) 0%, rgba(10,15,13,0.95) 60%)`,
              }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
            />
          )}

          {/* Phase 2: Full-screen loading with nature scene */}
          {(phase === 'loading' || phase === 'inbound') && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: '#0a0f0d' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Animated nature path */}
              <motion.div
                className="w-48 h-1 rounded-full overflow-hidden bg-white/10"
                initial={{ width: 0 }}
                animate={{ width: 192 }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500/60 to-amber-300"
                  animate={{ width: `${phase === 'inbound' ? 100 : 65}%` }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                />
              </motion.div>

              <motion.p
                className="text-amber-200/60 font-outfit text-sm tracking-widest uppercase mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Journeying to your destination
              </motion.p>

              {/* Floating particles during load */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-amber-400/20"
                  style={{
                    width: 2 + Math.random() * 4,
                    height: 2 + Math.random() * 4,
                    left: `${10 + Math.random() * 80}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -30 + Math.random() * 60],
                    opacity: [0, 0.6, 0],
                    scale: [1, 1.5, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 1.5,
                    repeat: Infinity,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Phase 3: Camera zooms in on target — reveal children */}
          {phase === 'inbound' && (
            <motion.div
              className="absolute inset-0 pointer-events-auto"
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Scroll-triggered reveal sections for detail pages
export function AnimatedSection({
  children,
  delay = 0,
  className = '',
}: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
