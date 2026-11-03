import { getActivityBySlug } from '../../data/activities';
import ActivityDetail from '../../components/ActivityDetail';
import { notFound } from 'next/navigation';
import type { Activity, Activity as ActivityInterface } from '../../data/activities';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

// All known slugs from static + DB for prerendering — revalidates every hour
const KNOWN_SLUGS = [
  'silver-dollar-city',
  'table-rock-lake',
  'titanic-museum',
  'shepherd-of-the-hills',
  'dolly-parton-stampede',
  'branson-landing',
];

// Let Vercel handle on-demand routes for any other slug
export function generateStaticParams() {
  return KNOWN_SLUGS.map(slug => ({ slug }));
}

// Revalidate every 30 minutes so new DB activities show up
export const revalidate = 1800;

/** Load an activity from the API/DB by slug, mapped to the Activity type. */
async function loadFromApi(slug: string): Promise<Activity | null> {
  const res = await fetch('https://branson-experience.vercel.app/api/activities', {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const activities = (await res.json()) as Array<{
    id: string; slug: string; title: string; category: string; hotspotX: number; hotspotY: number; image: string; score: number;
  }>;
  const match = activities.find(a => a.slug === slug);
  if (!match) return null;

  return {
    id: 'db-' + match.id,
    slug: match.slug,
    title: match.title,
    tagline: `${match.category.charAt(0).toUpperCase() + match.category.slice(1)} attraction in Branson`,
    category: match.category,
    description: `Discover ${match.title} in Branson, Missouri — a top-rated ${match.category} attraction.`,
    overview: `${match.title} is one of Branson's premier ${match.category} attractions, offering a unique experience for visitors of all ages.`,
    highlights: ['Top-rated experience', 'Located in the heart of Branson'],
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
  };
}

export default async function ActivityPage({ params }: PageProps) {
  const { slug } = params;

  // Static pages handle known slugs; this only catches DB-only activities
  const staticActivity = getActivityBySlug(slug);
  if (staticActivity) {
    return <ActivityDetail activity={staticActivity} />;
  }

  const dbActivity = await loadFromApi(slug);
  if (!dbActivity) return notFound();

  return <ActivityDetail activity={dbActivity} />;
}
