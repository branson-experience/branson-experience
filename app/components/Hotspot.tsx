"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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
}

const badgeClasses: Record<string, string> = {
  adventure: "badge-adventure",
  water: "badge-water",
  cultural: "badge-cultural",
  outdoor: "badge-outdoor",
  entertainment: "badge-entertainment",
  relaxation: "badge-relaxation",
  dining: "badge-dining",
  cruise: "badge-cruise",
};

export default function Hotspot({ hotspot, index, onSelect }: HotspotProps) {
  const [hovered, setHovered] = useState(false);
  const badgeClass = badgeClasses[hotspot.category] || "badge-adventure";

  return (
    <motion.div
      className="absolute cursor-pointer hotspot-enter z-20"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 2.5 + index * 0.25, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(hotspot)}
    >
      {/* Pulse rings */}
      <div className="absolute inset-0 -m-4 rounded-full bg-amber-400/30 hotspot-ring" />
      <div className="absolute inset-0 -m-2 rounded-full bg-amber-400/20 hotspot-ring" style={{ animationDelay: "0.5s" }} />

      {/* Dot */}
      <div className="relative w-5 h-5 rounded-full bg-amber-400 hotspot-dot flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>

      {/* Label (always visible on desktop, hidden on mobile) */}
      <motion.div
        className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 3.5 + index * 0.2 }}
      >
        <span className="text-white text-xs font-outfit font-medium tracking-wide" style={{ textShadow: "0 0 10px rgba(0,0,0,0.8)" }}>
          {hotspot.title}
        </span>
      </motion.div>

      {/* Hover card */}
      <motion.div
        className={`absolute left-7 top-full mt-3 w-64 rounded-xl overflow-hidden shadow-2xl pointer-events-auto hidden ${hotspot.id === '1' ? "glow-card" : ""}`}
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10, scaleY: hovered ? 1 : 0.95 }}
        transition={{ duration: 0.3 }}
        style={{ display: hovered ? "block" : "none" }}
      >
        <div className="relative h-32">
          <img src={hotspot.image} alt={hotspot.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className={`absolute bottom-2 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${badgeClass}`}>
            {hotspot.category}
          </div>
        </div>
        <div className="p-3 bg-[#1a1f1c]/95 backdrop-blur-md">
          <h3 className="text-white font-playfair font-bold text-sm mb-1">{hotspot.title}</h3>
          <p className="text-gray-300 text-xs leading-relaxed font-outfit">{hotspot.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
