import { getActivityBySlug } from '../../data/activities';
import ActivityDetail from '../../components/ActivityDetail';
import { notFound } from 'next/navigation';
import type { Activity } from '../../data/activities';

interface PageProps {
  params: { slug: string };
}

/** Load an activity from the API/DB by slug, mapped to the Activity type. */
async function loadFromApi(slug: string): Promise<Activity | null> {
  const res = await fetch('https://branson-experience.vercel.app/api/activities', {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const activities = await res.json();
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
