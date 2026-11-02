'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Activity } from '../data/activities';

interface MapModalProps {
  address: string;
  city: string;
}

export function MapButton({ activity }: { activity: Activity }) {
  const [open, setOpen] = useState(false);
  const address = activity.contact.address;

  // Build Google Maps URL from address
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-93.2268!3d36.6436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(address)}!5e0!3m2!1sen!2sus!4v1`;

  return (
    <>
      {/* Map button */}
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 backdrop-blur-xl bg-[#0a0f0d]/70 border border-white/10 rounded-full px-3 py-2 sm:px-4 sm:py-2.5 text-white/70 hover:text-white hover:border-amber-400/40 transition-all cursor-pointer"
        aria-label="Show location map"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-amber-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <span className="font-outfit text-xs sm:text-sm tracking-wide">Map</span>
      </button>

      {/* Map modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl bg-[#1a1f1c] border border-white/10"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h3 className="text-white font-playfair font-bold text-lg">{activity.title}</h3>
                  <p className="text-white/50 font-outfit text-xs mt-0.5">{address}</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Map embed */}
              <div className="relative aspect-[16/10]">
                <iframe
                  src={mapUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${activity.title} location`}
                />
              </div>

              {/* Directions link */}
              <div className="p-4 flex justify-between items-center border-t border-white/10">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-400 font-outfit text-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  Get Directions
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
