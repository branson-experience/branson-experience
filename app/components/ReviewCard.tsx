'use client';

import { motion } from 'framer-motion';

interface ReviewCardProps {
  author: string;
  date: string;
  rating: number;
  text: string;
  index: number;
}

export default function ReviewCard({ author, date, rating, text, index }: ReviewCardProps) {
  return (
    <motion.div
      className="backdrop-blur-xl bg-[#1a1f1c]/70 border border-white/10 rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(255,170,50,0.3)' }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-amber-400' : 'text-white/20'}`}
          >
            ★
          </span>
        ))}
      </div>

      {/* Review text */}
      <p className="text-gray-300 font-outfit text-sm leading-relaxed italic mb-4">
        &ldquo;{text}&rdquo;
      </p>

      {/* Author & date */}
      <div className="flex items-center justify-between">
        <span className="text-white/60 font-outfit text-xs">{author}</span>
        <span className="text-white/40 font-outfit text-xs">
          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
}
