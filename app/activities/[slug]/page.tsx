import { getActivityBySlug } from '../../data/activities';
import type { Activity } from '../../data/activities';
import ActivityDetailPage from './ActivityDetailPage';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mkzbfiwfnkpvhxvuvuqr.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function toSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchApiActivities(): Promise<Activity[]> {
  try {
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/activities?select=*&status=eq.active&order=name.asc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!dbRes.ok) return [];
    const records = await dbRes.json();

    // Build static lookup for hotspot coordinates
    const staticMap: Record<string, Activity> = {};
    try {
      const { activities: staticActivities } = await import('../../data/activities');
      for (const a of staticActivities) {
        staticMap[a.slug] = a;
      }
    } catch {
      // ignore
    }

    const images = ['/images/ozark-mountain-1.jpg', '/images/ozark-mountain-2.jpg', '/images/pexels-ozarks-autumn-HD.jpg'];

    return records.map((record: Record<string, unknown>) => {
      const name = record.name as string;
      const slug = toSlug(name);
      const staticMatch = staticMap[slug];
      const title = (record.full_name as string) || name;
      const imgIdx = (name.length) % images.length;
      const img = staticMatch ? (staticMatch.images[imgIdx % staticMatch.images.length] || images[imgIdx]) : images[imgIdx];

      let hx: number, hy: number;
      if (staticMatch) {
        hx = staticMatch.hotspotX;
        hy = staticMatch.hotspotY;
      } else {
        const hash = name.split('').reduce((acc, c) => ((acc << 5) + acc + c.charCodeAt(0)) & 0xFFFF, 0);
        hx = 15 + (hash % 70);
        hy = 15 + ((hash >> 7) % 70);
      }

      return {
        id: 'db-' + (record.id as string),
        slug,
        title: title.replace(/\b\w/g, c => c.toUpperCase()),
        tagline: `${record.category as string} attraction in Branson`,
        category: record.category as string,
        description: `Discover ${title} in Branson, Missouri — a top-rated ${record.category} attraction.`,
        overview: `${title} is one of Branson's premier ${record.category} attractions, offering a unique experience for visitors of all ages.`,
        highlights: ['Top-rated experience', 'Located in the heart of Branson', 'Must-visit destination'],
        images: [img, images[(imgIdx + 1) % images.length], images[(imgIdx + 2) % images.length]],
        videoUrls: [],
        rating: 4.5,
        reviews: [],
        contact: {
          phone: '',
          website: '',
          hours: 'Hours vary — check the website',
          address: 'Branson, MO 65616',
        },
        hotspotX: hx,
        hotspotY: hy,
        seasonal: ['spring', 'summer', 'fall', 'winter'],
        priceRange: '$–$$',
        bestFor: ['Families', 'All Ages'],
        duration: '2–3 Hours',
      };
    });
  } catch {
    return [];
  }
}

export default async function ActivityPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1) Check static data first
  const staticActivity = getActivityBySlug(slug);
  if (staticActivity) {
    return <ActivityDetailPage activity={staticActivity} />;
  }

  // 2) Fetch from DB
  const activities = await fetchApiActivities();
  const dbActivity = activities.find(a => a.slug === slug);
  if (!dbActivity) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl text-white/80">Activity Not Found</h1>
        <p className="text-white/50">&ldquo;{slug}&rdquo; does not exist</p>
        <a href="/" className="text-amber-400 hover:text-amber-300 underline">← Back</a>
      </div>
    );
  }

  return <ActivityDetailPage activity={dbActivity} />;
}

// Revalidate every 10 minutes — catches new DB activities
export const revalidate = 600;
