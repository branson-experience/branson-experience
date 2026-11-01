"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "explore", label: "Explore", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8z", desc: "Discover attractions" },
  { id: "activities", label: "Activities", icon: "M21 6h-2v2H5V6H3v14h18V6zm-2 12H5V8h14v10z", desc: "Things to do" },
  { id: "experiences", label: "Experiences", icon: "M12 21.39l-3.09-3.08L1 10.53V4.18h5V1.18h12v3h5v6.35L15.09 18.31z", desc: "Unforgettable moments" },
  { id: "about", label: "About", icon: "M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z", desc: "About Branson" },
  { id: "plan", label: "Plan Trip", icon: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z", desc: "Start planning" },
];

const RADIUS_DESKTOP = 80;
const RADIUS_MOBILE = 55;

export default function CreativeNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Center toggle */}
      <motion.button
        className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 w-14 h-14 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/30 flex items-center justify-center cursor-pointer hover:bg-amber-500/30 transition-colors"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="compass-inner-ring w-10 h-10 rounded-full border border-amber-400/40 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3 7h-6l3-7z" fill="currentColor" />
            <path d="M12 22l-3-7h6l-3 7z" fill="currentColor" opacity="0.5" />
            <path d="M2 12l7-3v6l-7-3z" fill="currentColor" opacity="0.3" />
            <path d="M22 12l-7 3v-6l7 3z" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
      </motion.button>

      {/* Outer spinning ring */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full border border-amber-400/10 compass-outer-ring"
        style={{ width: RADIUS_DESKTOP * 2 + 40, height: RADIUS_DESKTOP * 2 + 40 }}>
        {/* Cardinal markers */}
        {[0, 90, 180, 270].map(deg => (
          <div key={deg} className="absolute w-1 h-1 rounded-full bg-amber-400/30"
            style={{
              left: `${50 + 50 * Math.cos((deg - 90) * Math.PI / 180)}%`,
              top: `${50 + 50 * Math.sin((deg - 90) * Math.PI / 180)}%`,
            }} />
        ))}
      </div>

      {/* Nav items */}
      <AnimatePresence>
        {open && navItems.map((item, i) => {
          const angle = (i / navItems.length) * Math.PI * 2 - Math.PI / 2;
          const r = typeof window !== "undefined" && window.innerWidth < 640 ? RADIUS_MOBILE : RADIUS_DESKTOP;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          return (
            <motion.div
              key={item.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: "50%", top: "50%" }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x, y, opacity: 1, scale: 1 }}
              exit={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={() => setActive(active === item.id ? null : item.id)}
            >
              <div className="relative group cursor-pointer">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                    active === item.id
                      ? "bg-amber-500/30 border-amber-400/60 shadow-lg shadow-amber-500/20"
                      : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-amber-400/40"
                  }`}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
                    <path d={item.icon} />
                  </svg>
                </motion.div>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-[#1a1f1c]/95 backdrop-blur-md rounded-lg px-3 py-2 border border-amber-400/20">
                    <div className="text-amber-200 text-xs font-outfit font-bold">{item.label}</div>
                    <div className="text-gray-400 text-[10px]">{item.desc}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
