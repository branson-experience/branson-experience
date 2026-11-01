import { getActivityBySlug } from '../../data/activities';
import ActivityDetail from '../../components/ActivityDetail';
import { notFound } from 'next/navigation';

const activity = getActivityBySlug('titanic-museum')!;

export function generateMetadata() {
  return {
    title: `${activity.title}` + ' — Branson Experience',
    description: activity.description,
    openGraph: { images: [activity.images[0]] },
  };
}

export default function Page() {
  if (!activity) notFound();
  return <ActivityDetail activity={activity} />;
}
