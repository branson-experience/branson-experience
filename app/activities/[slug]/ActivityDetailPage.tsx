'use client';

import ActivityDetail from '../../components/ActivityDetail';
import type { Activity } from '../../data/activities';

export default function ActivityDetailPage({ activity }: { activity: Activity }) {
  return <ActivityDetail activity={activity} />;
}
