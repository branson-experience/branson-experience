"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Real Ozark mountain photos — local files for reliable CDN delivery
// Sourced from Pexels (CC0) and Wikimedia Commons (public domain)
const BGS = [
  // Table Rock Lake, Branson, Missouri — aerial view of the lake with Ozark hills
  "/images/ozark-mountain-1.jpg",
  // Ozark scenery — rolling hills and meadows typical of the Branson region
  "/images/ozark-mountain-2.jpg",
  // Scenic view of the Ozarks in autumn light — lush forest and hillside
  "/images/pexels-ozarks-autumn-HD.jpg",
];

const LAYERS = [
  { id: "far", f: "#1a2e35", d: 0.4, p: 0.02,
    u: "M0,320 L100,240 L200,200 L350,260 L500,180 L650,220 L800,250 L960,200 L960,480 L0,480 Z" },
  { id: "mid", f: "#15232a", d: 0.6, p: 0.04,
    u: "M0,380 L80,310 L180,340 L300,280 L420,310 L540,270 L680,300 L780,290 L960,260 L960,480 L0,480 Z" },
  { id: "f1", f: "#1a2f22", d: 0.8, p: 0.06,
    u: "M0,400 Q40,370 80,395 Q120,360 160,395 Q200,368 240,382 Q280,355 320,372 Q360,370 400,368 Q440,360 480,370 Q520,375 560,368 Q600,365 640,368 Q680,370 720,365 Q760,360 800,368 Q840,375 880,370 Q920,370 960,390 L960,480 L0,480 Z" },
  { id: "f2", f: "#142518", d: 1.0, p: 0.08,
    u: "M0,420 Q30,388 60,402 Q90,395 120,410 Q150,385 180,400 Q210,395 240,408 Q270,380 300,398 Q330,400 360,395 Q390,385 420,398 Q450,395 480,392 Q510,380 540,396 Q570,395 600,398 Q630,390 660,400 Q690,400 720,395 Q750,385 780,398 Q810,400 840,395 Q870,390 900,402 Q930,405 960,415 L960,480 L0,480 Z" },
  { id: "trees", f: "#0d1a0f", d: 1.2, p: 0.12,
    u: "M0,480 L0,440 L8,440 L8,430 L16,430 L16,440 L24,440 L24,450 L36,480 Z M40,480 L40,445 L47,445 L47,435 L54,435 L54,445 L61,445 L61,460 L71,480 Z M130,480 L130,430 L142,430 L142,420 L154,420 L154,430 L166,430 L166,445 L178,480 Z M270,480 L270,435 L280,435 L280,425 L290,425 L290,435 L300,435 L300,455 L310,480 Z M400,480 L400,420 L412,420 L412,410 L424,410 L424,420 L436,420 L436,440 L448,480 Z M540,480 L540,430 L552,430 L552,420 L564,420 L564,430 L576,430 L576,450 L588,480 Z M720,480 L720,435 L732,435 L732,425 L744,425 L744,435 L756,435 L756,455 L768,480 Z M870,480 L870,440 L880,440 L880,430 L890,430 L890,440 L900,440 L900,455 L910,480 Z" },
];

interface FF {
  id: number; x: number; y: number;
  dx: number; dy: number;
  dur: string; del: string; sz: number;
}

interface StarData { id: number; x: number; y: number; sz: number; dur: string; del: string; }

const MIST = [
  { y: 60, w: 40, o: 0.15, delay: 0 },
  { y: 72, w: 50, o: 0.1, delay: 8 },
  { y: 55, w: 35, o: 0.12, delay: 15 },
];

interface LandscapeProps { isMobile?: boolean; }

interface PP { y: any; o: any; }

// Deterministic generators — same output every call so SSR === client (no hydration mismatch)
function makeFFs(count: number): FF[] {
  const ffs: FF[] = [];
  for (let i = 0; i < count; i++) {
    // Seeded from index — deterministic
    const seed = i * 7 + 13;
    ffs.push({
      id: i,
      x: (seed * 37) % 100,
      y: 20 + (seed * 19) % 70,
      dx: ((seed * 23) % 80) - 40,
      dy: ((seed * 29) % 80) - 40,
      dur: (4 + (seed * 11) % 80 / 10).toFixed(1) + "s",
      del: ((seed * 17) % 60) / 10 + "s",
      sz: 2 + (seed * 31) % 30 / 10,
    });
  }
  return ffs;
}

function makeStars(count: number): StarData[] {
  const stars: StarData[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 5 + 7;
    stars.push({
      id: i,
      x: (seed * 41) % 100,
      y: (seed * 23) % 35,
      sz: 1 + (seed * 17) % 20 / 10,
      dur: (2 + (seed * 13) % 40 / 10).toFixed(1) + "s",
      del: ((seed * 19) % 30) / 10 + "s",
    });
  }
  return stars;
}

export default function Landscape({ isMobile = false }: LandscapeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: ref });
  const [bgUrl] = useState(BGS[0]);
  const [ffs] = useState(() => makeFFs(isMobile ? 10 : 40));
  const [stars] = useState(() => makeStars(isMobile ? 12 : 30));
  const [ok, setOk] = useState(true);
  // Fade layers in after mount
  useEffect(() => { setOk(true); }, []);

  const px: PP[] = [];
  for (let i = 0; i < LAYERS.length; i++) {
    const layer = LAYERS[i];
    const y = useTransform(scrollY, [0, 600], [0, -layer.p * 600]);
    const o = useTransform(scrollY, [0, 200], [1, 0.8]);
    px.push({ y, o });
  }

  return (
    <div ref={ref} className="relative w-full h-screen overflow-hidden parallax-container">
      <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.5, ease: "easeOut" }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(" + bgUrl + ")" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0d]/70 via-[#0a1a10]/50 to-[#0a0f0d]" />
      </motion.div>

      <motion.div className="absolute inset-0" initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.5 }}>
        {stars.map((s) => {
          if (isMobile) {
            // Fewer, smaller stars on mobile for performance
            if (s.id >= 12) return null;
          }
          const style: Record<string, any> = { left: s.x + "%", top: s.y + "%", width: isMobile ? s.sz * 0.7 : s.sz, height: isMobile ? s.sz * 0.7 : s.sz };
          style["--duration" as any] = s.dur;
          style["--delay" as any] = s.del;
          return <div key={s.id} className="absolute rounded-full bg-white star" style={style} />;
        })}
      </motion.div>

      {LAYERS.map((layer, i) => {
        const layerStyle: Record<string, any> = {};
        layerStyle.y = px[i].y;
        layerStyle.opacity = px[i].o;
        return (
          <motion.div key={layer.id} className="absolute bottom-0 left-0 right-0"
            style={layerStyle} initial={{ y: 200, opacity: 0 }}
            animate={ok ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1.4, delay: layer.d, ease: [0.16, 1, 0.3, 1] }}>
            <svg viewBox="0 160 960 320" preserveAspectRatio="none" className="w-full"
              style={{ height: isMobile ? "240px" : "480px", minHeight: isMobile ? "160px" : "320px" }}>
              <path d={layer.u} fill={layer.f} />
            </svg>
          </motion.div>
        );
      })}

      {MIST.map((m, i) => (
        <div key={"m" + i} className={"absolute " + (i % 2 === 0 ? "mist-layer" : "mist-layer-reverse")}
          style={{
            left: "-20%", width: m.w + "%", top: m.y + "%", height: "15%",
            background: "radial-gradient(ellipse, rgba(200,220,210," + m.o + ") 0%, transparent 70%)",
            // Skip mist on mobile for performance
            display: isMobile ? "none" : undefined,
            animationDelay: m.delay + "s"
          }} />
      ))}

      <div className="absolute inset-0 pointer-events-none">
        {ffs.slice(0, isMobile ? 10 : ffs.length).map((fv) => {
          const fs: Record<string, any> = {
            left: fv.x + "%", top: fv.y + "%", width: fv.sz, height: fv.sz,
            background: "radial-gradient(circle, rgba(255,230,100,0.9) 0%, rgba(255,180,50,0.5) 40%, transparent 70%)",
            boxShadow: "0 0 " + (fv.sz * 4) + "px rgba(255,220,60,0.6)",
          };
          fs["--dx" as any] = fv.dx + "px";
          fs["--dy" as any] = fv.dy + "px";
          fs["--duration" as any] = fv.dur;
          fs["--delay" as any] = fv.del;
          return <div key={fv.id} className="absolute rounded-full firefly" style={fs} />;
        })}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f0d]/60 via-transparent to-[#0a0f0d]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-[#0a0f0d]/40" />
      </div>

      <motion.div className="absolute" style={{ right: isMobile ? "6%" : "12%", top: isMobile ? "4%" : "8%" }}
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, delay: 0.8, ease: "easeOut" }}>
        <div className="rounded-full" style={{
          width: isMobile ? 40 : 60, height: isMobile ? 40 : 60,
          background: "radial-gradient(circle at 35% 35%, #fef3c7 0%, #fde68a 50%, #d4a843 100%)",
          boxShadow: isMobile ? "0 0 40px rgba(254,243,199,0.2)" : "0 0 60px rgba(254,243,199,0.3), 0 0 120px rgba(254,243,199,0.15)",
        }} />
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div className="text-center px-4" initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.6, ease: "easeOut" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="text-[8px] sm:text-xs md:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase text-amber-300/80 mb-2 sm:mb-4 font-outfit">
            {"Missouri\u2019s Premier Destination"}
          </motion.div>
          <motion.h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-playfair font-black text-white leading-none mb-2 sm:mb-3"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.2, ease: "easeOut" }}
            style={{ textShadow: "0 0 40px rgba(255,170,50,0.3), 0 4px 20px rgba(0,0,0,0.5)" }}>
            BRANSON
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.6 }}
            className="text-xs sm:text-sm md:text-base text-gray-300 font-outfit font-light tracking-wide">
            Explore the heart of the Ozarks
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
