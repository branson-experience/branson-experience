'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import GlassCard from './GlassCard';
import ReviewCard from './ReviewCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Activity } from '../data/activities';
import { categoryBadge } from '../data/activities';

interface ActivityDetailProps {
  activity: Activity;
}

export default function ActivityDetail({ activity }: ActivityDetailProps) {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % activity.images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activity.images.length]);

  const badgeClass = categoryBadge[activity.category] || 'badge-adventure';

  return (
    <div className="min-h-screen bg-[#0a0f0d] overflow-x-hidden">
      {/* ── Back to Map (floating mountain icon) ── */}
      <motion.div
        className="fixed top-3 sm:top-6 left-3 sm:left-6 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <button
          onClick={() => router.push('/')}
          className="group flex items-center gap-2 backdrop-blur-xl bg-[#0a0f0d]/70 border border-white/10 rounded-full px-3 py-2 sm:px-4 sm:py-2.5 text-white/70 hover:text-white hover:border-amber-400/40 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-amber-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 20l9-14 9 14" />
            <path d="M8 15l5-7 5 7" />
            <path d="M12 14v6" />
          </svg>
          <span className="font-outfit text-xs sm:text-sm tracking-wide">Map</span>
        </button>
      </motion.div>

      {/* ── Hero with parallax background ── */}
      <div ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Background images with crossfade */}
        {activity.images.map((img, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{
              opacity: i === currentImageIndex ? 1 : 0,
            }}
            transition={{ duration: 1.5 }}
          >
            <div
              className="absolute inset-[-20px]"
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `scale(${i === currentImageIndex ? 1 : 1.05})`,
              }}
            />
          </motion.div>
        ))}

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0d]/60 via-[#0a0f0d]/30 to-[#0a0f0d]" />

        {/* Hero content */}
        <div className="absolute inset-0 flex items-end justify-center pb-20 sm:pb-32 px-4 sm:px-6">
          <motion.div
            className="text-center max-w-3xl"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white mb-4 sm:mb-6 ${badgeClass}`}>
              {activity.category}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-playfair font-bold text-white mb-2 sm:mb-4 leading-tight">
              {activity.title}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-white/70 font-playfair italic mb-6 sm:mb-8">
              {activity.tagline}
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-amber-400">{activity.rating}</div>
                <div className="text-[10px] sm:text-xs text-white/50 font-outfit uppercase tracking-wider">Rating</div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-amber-400">{activity.priceRange}</div>
                <div className="text-[10px] sm:text-xs text-white/50 font-outfit uppercase tracking-wider">Price</div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="text-sm sm:text-2xl font-bold text-amber-400">{activity.duration}</div>
                <div className="text-[10px] sm:text-xs text-white/50 font-outfit uppercase tracking-wider">Duration</div>
              </div>
            </div>

            {/* Image dots */}
            <div className="flex justify-center gap-2">
              {activity.images.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    i === currentImageIndex ? 'bg-amber-400 w-6' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  onClick={() => setCurrentImageIndex(i)}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* ── Content Sections ── */}
      <div className="relative px-4 sm:px-6 pb-24 max-w-5xl mx-auto">
        {/* Overview */}
        <motion.div
          className="py-12 sm:py-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-8 sm:w-12 h-px bg-amber-400/50" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-white">Overview</h2>
          </div>
          <GlassCard intensity="medium" rounded="2xl">
            <p className="text-gray-300 font-outfit text-sm sm:text-base leading-relaxed p-4 sm:p-6">
              {activity.overview}
            </p>
          </GlassCard>
        </motion.div>

        {/* Highlights */}
        <motion.div
          className="py-12 sm:py-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-8 sm:w-12 h-px bg-amber-400/50" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-white">Highlights</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {activity.highlights.map((h, i) => (
              <GlassCard key={i} intensity="light" rounded="xl">
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4">
                  <span className="text-amber-400 text-lg mt-0.5 flex-shrink-0">✦</span>
                  <p className="text-gray-300 font-outfit text-sm leading-relaxed">{h}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Best For & Tags */}
        <motion.div
          className="py-12 sm:py-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-8 sm:w-12 h-px bg-amber-400/50" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-white">Perfect For</h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {activity.bestFor.map((tag, i) => (
              <GlassCard key={i} intensity="light" rounded="full" hover={false}>
                <span className="px-4 py-2 sm:px-6 sm:py-3 text-white/70 font-outfit text-xs sm:text-sm">{tag}</span>
              </GlassCard>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
            {activity.seasonal.map((s, i) => (
              <GlassCard key={i} intensity="light" rounded="full" hover={false}>
                <span className="px-4 py-2 sm:px-6 sm:py-3 text-amber-300/70 font-outfit text-xs sm:text-sm capitalize">{s}</span>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="py-12 sm:py-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-8 sm:w-12 h-px bg-amber-400/50" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-white">Visit</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <GlassCard intensity="medium" rounded="xl">
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-amber-400 text-xl flex-shrink-0">📍</span>
                  <div>
                    <div className="text-white/50 font-outfit text-xs uppercase tracking-wider mb-1">Address</div>
                    <div className="text-white font-outfit text-sm">{activity.contact.address}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-amber-400 text-xl flex-shrink-0">📞</span>
                  <div>
                    <div className="text-white/50 font-outfit text-xs uppercase tracking-wider mb-1">Phone</div>
                    <a href={`tel:${activity.contact.phone.replace(/\D/g, '')}`} className="text-white hover:text-amber-400 font-outfit text-sm transition-colors cursor-pointer">
                      {activity.contact.phone}
                    </a>
                  </div>
                </div>
              </div>
            </GlassCard>
            <GlassCard intensity="medium" rounded="xl">
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-amber-400 text-xl flex-shrink-0">🌐</span>
                  <div>
                    <div className="text-white/50 font-outfit text-xs uppercase tracking-wider mb-1">Website</div>
                    <a href={activity.contact.website} target="_blank" rel="noopener noreferrer" className="text-white hover:text-amber-400 font-outfit text-sm transition-colors cursor-pointer break-all">
                      {activity.contact.website.replace('https://', '')}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-amber-400 text-xl flex-shrink-0">🕐</span>
                  <div>
                    <div className="text-white/50 font-outfit text-xs uppercase tracking-wider mb-1">Hours</div>
                    <div className="text-white font-outfit text-sm">{activity.contact.hours}</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* Videos */}
        {activity.videoUrls.length > 0 && (
          <motion.div
            className="py-12 sm:py-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-8 sm:w-12 h-px bg-amber-400/50" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-white">Video</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {activity.videoUrls.map((url, i) => (
                <GlassCard key={i} intensity="heavy" rounded="2xl" hover={false}>
                  <div className="relative aspect-video overflow-hidden">
                    <iframe
                      src={url}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${activity.title} video ${i + 1}`}
                      loading="lazy"
                    />
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        <motion.div
          className="py-12 sm:py-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-8 sm:w-12 h-px bg-amber-400/50" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-white">Reviews</h2>
            <span className="text-amber-400 font-playfair text-xl sm:text-2xl">{activity.rating}</span>
            <span className="text-white/40 font-outfit text-xs sm:text-sm">/ 5.0</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {activity.reviews.map((r, i) => (
              <ReviewCard key={i} {...r} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="py-12 sm:py-20 text-center">
          <GlassCard intensity="light" rounded="2xl">
            <div className="p-6 sm:p-8">
              <p className="text-white/50 font-outfit text-xs sm:text-sm mb-3 sm:mb-4">
                Ready to explore more of the Ozarks?
              </p>
              <Link href="/" className="inline-block bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-outfit text-sm sm:text-base font-medium transition-colors cursor-pointer">
                ← Back to the Forest
              </Link>
            </div>
          </GlassCard>
          <div className="mt-8 sm:mt-12 text-white/20 font-outfit text-xs">
            <p>Content managed by Branson Experience AI Agent System</p>
            <p className="mt-1">Last reviewed: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
