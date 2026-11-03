'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Activity } from '../../data/activities';

export default function ActivityPageDynamic({ params }: { params: { slug: string } }) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/activities`, { cache: 'no-store' })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to load');
        const list = await res.json();
        const match = list.find(a => a.slug === params.slug);
        if (!match) throw new Error('Activity not found');
        setActivity({
          id: 'db-' + (match.id || params.slug),
          slug: match.slug,
          title: match.title,
          tagline: `${match.category.charAt(0).toUpperCase() + match.category.slice(1)} attraction in Branson`,
          category: match.category,
          description: `Discover ${match.title} in Branson, Missouri — a top-rated ${match.category} attraction.`,
          overview: `${match.title} is one of Branson's premier ${match.category} attractions, offering a unique experience for visitors of all ages.`,
          highlights: ['Top-rated experience', 'Located in the heart of Branson', 'Must-visit destination'],
          images: [match.image, '/images/ozark-mountain-1.jpg', '/images/pexels-ozarks-autumn-HD.jpg'],
          videoUrls: [],
          rating: 4.5,
          reviews: [],
          contact: {
            phone: '',
            website: '',
            hours: 'Hours vary — check the website',
            address: 'Branson, MO 65616',
          },
          hotspotX: match.hotspotX || 50,
          hotspotY: match.hotspotY || 50,
          seasonal: ['spring', 'summer', 'fall', 'winter'],
          priceRange: '$–$$',
          bestFor: ['Families', 'All Ages'],
          duration: '2–3 Hours',
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
        <p className="text-white/60 text-lg animate-pulse">Loading activity...</p>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl text-white/80">Activity Not Found</h1>
        <p className="text-white/50">{error}</p>
        <Link href="/" className="text-amber-400 hover:text-amber-300 underline">
          ← Back to Branson Experience
        </Link>
      </div>
    );
  }

  // Render the full ActivityDetail component
  return <DynamicActivityDetail activity={activity} />;
}

// Inline client-side ActivityDetail rendering
function DynamicActivityDetail({ activity }: { activity: Activity }) {
  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      {/* Hero */}
      <div className="relative h-[50vh] flex items-end">
        <img
          src={activity.images[0]}
          alt={activity.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-8">
          <Link href="/" className="text-amber-400/80 hover:text-amber-300 text-sm mb-4 inline-block">
            ← Back to Activities
          </Link>
          <h1 className="text-5xl font-bold mb-2">{activity.title}</h1>
          <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-400 text-sm rounded-full border border-amber-400/30">
            {activity.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <p className="text-lg text-white/80 leading-relaxed">{activity.description}</p>
        <p className="text-white/60">{activity.overview}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Highlights</h2>
            <ul className="space-y-2">
              {activity.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-white/80">
                  <span className="text-amber-400 mt-1">✦</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Details</h2>
            <dl className="space-y-3 text-white/70">
              {[
                ['Category', activity.category],
                ['Price Range', activity.priceRange],
                ['Duration', activity.duration],
                ['Contact', activity.contact.phone || 'Check website'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt>{label}</dt>
                  <dd className="text-white/90">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {activity.contact.website && (
          <div className="text-center pt-6">
            <a
              href={activity.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-amber-400/20 text-amber-400 border border-amber-400/40 rounded-lg hover:bg-amber-400/30 transition-colors"
            >
              Visit Official Website
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
