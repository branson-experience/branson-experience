// @ts-nocheck
/**
 * GET /api/activities
 * Returns active activities from Supabase, mapped to frontend hotspot shape.
 * Also populates the DB with missing hotspot/image data on first fetch.
 */
import { NextResponse } from 'next/server';
import { SUPABASE_CONFIG } from '../agents/meeting/config';
import { activities as staticActivities, getActivityHotspots } from '../../data/activities';

const BASE = SUPABASE_CONFIG.url;
const ANON = SUPABASE_CONFIG.anonKey;

// Generate a slug from an activity name
function toSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Map DB records to frontend hotspots, filling in coordinates/images from static data
function mapToHotspots(records: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  // Build a lookup from static data (slug → static activity)
  const staticMap: Record<string, Record<string, unknown>> = {};
  for (const a of staticActivities) {
    staticMap[a.slug] = a;
  }

  return records.map(record => {
    const name = (record.name as string) || '';
    const slug = toSlug(name);
    const staticMatch = staticMap[slug];

    // Use static data's hotspot coords if available, otherwise random-ish based on name hash
    let x: number, y: number;
    if (staticMatch) {
      x = staticMatch.hotspotX as number;
      y = staticMatch.hotspotY as number;
    } else {
      const hash = name.split('').reduce((a, c) => ((a << 5) + a + c.charCodeAt(0)) & 0xFFFF, 0);
      x = 15 + (hash % 70); // 15-85
      y = 15 + ((hash >> 7) % 70); // 15-85
    }

    // Use static data's image or first image from static match
    let image = '/images/ozark-mountain-1.jpg';
    if (staticMatch && staticMatch.images && (staticMatch.images as string[]).length > 0) {
      image = (staticMatch.images as string[])[0];
    }
    // Rotate image source for variety
    const images = [
      '/images/ozark-mountain-1.jpg',
      '/images/ozark-mountain-2.jpg',
      '/images/pexels-ozarks-autumn-HD.jpg',
    ];
    const idx = (name.length) % images.length;
    image = staticMatch ? (staticMatch.images as string[])[idx % (staticMatch.images as string[]).length] : images[idx];

    return {
      id: record.id,
      slug,
      title: (record['full_name'] || name).replace(/\b\w/g, c => c.toUpperCase()), // Title case
      category: record.category,
      description: record['description'] || record.metadata?.description || '',
      image,
      rating: (record.score as number) / 20 || 4.5, // Normalize 0-100 score to rating
      hotspotX: x,
      hotspotY: y,
      score: record.score,
    };
  });
}

export async function GET() {
  try {
    // Fetch active activities from Supabase
    const url = `${BASE}/rest/v1/activities?select=*&status=eq.active&order=name.asc`;
    const res = await fetch(url, {
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
        'X-Client-Info': 'branson-frontend',
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    const records = await res.json();
    const hotspots = mapToHotspots(records);

    // Also update records that are missing hotspots/coordinates
    // We do this lazily to keep the API simple
    for (const record of records) {
      const metadata = record.metadata as Record<string, unknown> || {};
      if (!metadata.hotspotX && !metadata.hotspotY) {
        // Add hotspot coordinates to metadata
        const staticMatch = staticActivities.find(a => a.slug === toSlug(record.name as string));
        if (staticMatch) {
          metadata.hotspotX = staticMatch.hotspotX;
          metadata.hotspotY = staticMatch.hotspotY;
          // Update the record in DB (best effort)
          try {
            await fetch(`${BASE}/rest/v1/activities?id=eq.${record.id}`, {
              method: 'PATCH',
              headers: {
                apikey: ANON,
                Authorization: `Bearer ${ANON}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
              },
              body: JSON.stringify({ metadata }),
            });
          } catch {
            // Non-critical
          }
        }
      }
    }

    return NextResponse.json(hotspots);
  } catch (err) {
    console.error('[activities] fetch failed:', err);
    return NextResponse.json(
      { error: 'Failed to load activities' },
      { status: 500 }
    );
  }
}
