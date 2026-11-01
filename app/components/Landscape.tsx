"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const BGS = [
  "https://images.unsplash.com/photo-1441974231545-c8154874d5f7?w=1920&q=80",
  "https://images.unsplash.com/photo-1506905925346-0428988f53ed?w=1920&q=80",
  "https://images.unsplash.com/photo-1596394523518-613a7fa5f7c0?w=1920&q=80",
];

const LAYERS = [
  { id: "far", f: "#1a2e35", d: 0.4, p: 0.02,
    u: "M0,320 L100,240 L200,200 L350,260 L500,180 L650,220 L800,250 L960,200 L960,480 L0,480 Z" },
  { id: "mid", f: "#15232a", d: 0.6, p: 0.04,
    u: "M0,380 L80,310 L180,340 L300,280 L420,310 L540,270 L680,300 L780,290 L960,260 L960,480 L0,480 Z" },
  { id: "f1", f: "#1a2f22", d: 0.8, p: 0.06,
    u: "M0,400 Q40,370 80,395 Q120,360 160,395 Q200,375 Q280,355 Q360,370 Q440,360 Q520,375 Q600,365 Q680,370 Q760,360 Q840,375 Q920,370 L960,390 L960,480 L0,480 Z" },
  { id: "f2", f: "#142518", d: 1.0, p: 0.08,
    u: "M0,420 Q30,390 Q90,395 Q150,385 Q210,395 Q270,380 Q330,400 Q390,385 Q450,395 Q510,380 Q570,395 Q630,390 Q690,400 Q750,385 Q810,400 Q870,390 Q930,405 L960,415 L960,480 L0,480 Z" },
  { id: "trees", f: "#0d1a0f", d: 1.2, p: 0.12,
    u: "M0,480 L0,440 L8,440 L8,430 L16,430 L16,440 L24,440 L24,450 L36,480 Z M40,480 L40,445 L47,445 L47,435 L54,435 L54,445 L61,445 L61,460 L71,480 Z M130,480 L130,430 L142,430 L142,420 L154,420 L154,430 L166,430 L166,445 L178,480 Z M270,480 L270,435 L280,435 L280,425 L290,425 L290,435 L300,435 L300,455 L310,480 Z M400,480 L400,420 L412,420 L412,410 L424,410 L424,420 L436,420 L436,440 L448,480 Z M540,480 L540,430 L552,430 L552,420 L564,420 L564,430 L576,430 L576,450 L588,480 Z M720,480 L720,435 L732,435 L732,425 L744,425 L744,435 L756,435 L756,455 L768,480 Z M870,480 L870,440 L880,440 L880,430 L890,430 L890,440 L900,440 L900,455 L910,480 Z" },
];

interface FF {
  id: number; x: number; y: number;
  dx: number; dy: number;
  dur: string; del: string; sz: number;
}

function makeFFs(): FF[] {
  const ffs: FF[] = [];
  for (let i = 0; i < 40; i++) {
    ffs.push({
      id: i,
      x: Math.random() * 100,
      y: 20 + Math.random() * 70,
      dx: (Math.random() - 0.5) * 80,
      dy: (Math.random() - 0.5) * 80,
      dur: (4 + Math.random() * 8).toFixed(1) + "s",
      del: (Math.random() * 6).toFixed(1) + "s",
      sz: 2 + Math.random() * 3,
    });
  }
  return ffs;
}

interface StarData { id: number; x: number; y: number; sz: number; dur: string; del: string; }

function makeStars(): StarData[] {
  const stars: StarData[] = [];
  for (let i = 0; i < 30; i++) {
    stars.push({
      id: i, x: Math.random() * 100, y: Math.random() * 35,
      sz: 1 + Math.random() * 2,
      dur: (2 + Math.random() * 4).toFixed(1) + "s",
      del: (Math.random() * 3).toFixed(1) + "s",
    });
  }
  return stars;
}

const MIST = [
  { y: 60, w: 40, o: 0.15, delay: 0 },
  { y: 72, w: 50, o: 0.1, delay: 8 },
  { y: 55, w: 35, o: 0.12, delay: 15 },
];

interface PP { y: any; o: any; }

export default function Landscape() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: ref });
  const [bgUrl, setBgUrl] = useState(BGS[0]);
  const [ffs, setFfs] = useState<FF[]>([]);
  const [ok, setOk] = useState(false);
  const [stars, setStars] = useState<StarData[]>([]);
  useEffect(() => {
    setBgUrl(BGS[Math.floor(Math.random() * BGS.length)]);
    setFfs(makeFFs());
    setStars(makeStars());
    setOk(true);
  }, []);

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
          const style: Record<string, any> = { left: s.x + "%", top: s.y + "%", width: s.sz, height: s.sz };
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
              style={{ height: "480px", minHeight: "320px" }}>
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
            animationDelay: m.delay + "s"
          }} />
      ))}

      <div className="absolute inset-0 pointer-events-none">
        {ffs.map((fv) => {
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

      <motion.div className="absolute" style={{ right: "12%", top: "8%" }}
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, delay: 0.8, ease: "easeOut" }}>
        <div className="rounded-full" style={{
          width: 60, height: 60,
          background: "radial-gradient(circle at 35% 35%, #fef3c7 0%, #fde68a 50%, #d4a843 100%)",
          boxShadow: "0 0 60px rgba(254,243,199,0.3), 0 0 120px rgba(254,243,199,0.15)",
        }} />
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div className="text-center px-4" initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.6, ease: "easeOut" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="text-xs sm:text-sm tracking-[0.4em] uppercase text-amber-300/80 mb-4 font-outfit">
            {"Missouri\u2019s Premier Destination"}
          </motion.div>
          <motion.h1 className="text-5xl sm:text-7xl lg:text-9xl font-playfair font-black text-white leading-none mb-3"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.2, ease: "easeOut" }}
            style={{ textShadow: "0 0 40px rgba(255,170,50,0.3), 0 4px 20px rgba(0,0,0,0.5)" }}>
            BRANSON
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.6 }}
            className="text-sm sm:text-base text-gray-300 font-outfit font-light tracking-wide">
            Explore the heart of the Ozarks
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
