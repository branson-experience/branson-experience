// Shared activity data — powers both the landing page hotspots and detail pages

export interface Review {
  author: string;
  date: string;
  rating: number;
  text: string;
}

export interface Contact {
  phone: string;
  website: string;
  hours: string;
  address: string;
}

export interface Activity {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  overview: string;
  highlights: string[];
  images: string[];
  videoUrls: string[];
  rating: number;
  reviews: Review[];
  contact: Contact;
  // Hotspot position on landscape
  hotspotX: number; // percentage 0-100
  hotspotY: number; // percentage 0-100
  // Season info for AI agent
  seasonal: string[];
  priceRange: string;
  bestFor: string[];
  duration: string;
}

export const activities: Activity[] = [
  {
    id: '1',
    slug: 'silver-dollar-city',
    title: "Silver Dollar City",
    tagline: "A Magical Mountain Experience",
    category: 'adventure',
    description: "Thrilling themed amusement park set in the Cherokee mountains with world-class rides, crafts, and shows.",
    overview: `Silver Dollar City is one of the most visited theme parks in the United States, set against the stunning backdrop of the Ozark Mountains. This 300-acre park brings American heritage to life through authentic crafts, live entertainment, and some of the most thrilling roller coasters in the country. From the heart-pounding Outlaw run to the family-friendly Log Ride, every corner of this park tells a story of the Old West intertwined with Cherokee culture.`,
    highlights: [
      "Outlaw — one of the fastest wooden roller coasters with 7 inversions",
      "Master Craftsman demonstrations — watch artisans at work",
      "River Blaster — log flume with 65-foot drop",
      "Over 25 shows and entertainers performing daily",
      "Seasonal events: Mountain Music Fest, Holiday Lights, ThunderStruck",
      "Award-winning cuisine with farm-fresh ingredients",
    ],
    images: [
      '/images/ozark-mountain-1.jpg',
      '/images/ozark-mountain-2.jpg',
      '/images/pexels-ozarks-autumn-HD.jpg',
    ],
    videoUrls: ['https://www.youtube.com/embed/KlvJ6Fw5G8E'],
    rating: 4.8,
    reviews: [
      { author: "Sarah M.", date: "2024-06-15", rating: 5, text: "We've been coming for 10 years and it just keeps getting better. The Outlaw coaster is absolutely incredible and the craftsman demonstrations are educational for the kids." },
      { author: "James T.", date: "2024-08-22", rating: 5, text: "Holiday Lights in December is pure magic. The entire park transforms into a winter wonderland. Easily the best night-time show in the Ozarks." },
      { author: "Emily R.", date: "2024-07-03", rating: 4, text: "Great for all ages. The food is legitimately good — the corn dog and pulled pork are must-trys. Can get crowded on peak weekends." },
      { author: "David L.", date: "2024-05-18", rating: 5, text: "ThunderStruck during summer is electrifying. They fire cannons and have special nighttime shows that make this the perfect summer destination." },
    ],
    contact: {
      phone: "(437) 331-1171",
      website: "https://www.silverdollarcity.com",
      hours: "Monday–Sunday: 9:00 AM – 10:00 PM (varies by season)",
      address: "951 Silver Dollar Cir, Branson, MO 65616",
    },
    hotspotX: 28, hotspotY: 38,
    seasonal: ['summer', 'fall', 'winter'],
    priceRange: '$$$',
    bestFor: ['Families', 'Thrill-Seekers', 'All Ages'],
    duration: 'Full Day (6–10 hours)',
  },
  {
    id: '2',
    slug: 'table-rock-lake',
    title: "Table Rock Lake",
    tagline: "Crystal Waters of the Ozarks",
    category: 'water',
    description: "Sparkling crystal-clear lake perfect for boating, fishing, swimming, and kayaking in the Ozarks.",
    overview: `Table Rock Lake stretches across the Missouri-Arkansas border, offering over 1,000 miles of shoreline through rugged Ozark hills and coves. This 68,500-acre reservoir is renowned for its exceptionally clear blue-green waters, making it one of the most scenic lakes in the Midwest. Whether you're fishing for smallmouth bass, kayaking through hidden coves, or simply watching the sunset paint the mountains purple, Table Rock Lake delivers an unforgettable outdoor experience.`,
    highlights: [
      "1,000+ miles of shoreline with secluded coves",
      "Premier smallmouth bass fishing destination",
      "Table Rock State Park with hiking trails and viewpoints",
      "Crystal-clear waters perfect for kayaking and paddleboarding",
      "Branson Landing waterfront dining and entertainment nearby",
      "Bull Shoals connection for extended water adventures",
    ],
    images: [
      '/images/ozark-mountain-2.jpg',
      '/images/ozark-mountain-1.jpg',
      '/images/pexels-ozarks-autumn-HD.jpg',
    ],
    videoUrls: ['https://www.youtube.com/embed/-hc7P_NFbUQ'],
    rating: 4.7,
    reviews: [
      { author: "Mike P.", date: "2024-07-20", rating: 5, text: "Rented a cabin with a private dock for a week — it was paradise. The water visibility is incredible, especially in the summer months." },
      { author: "Amanda K.", date: "2024-06-05", rating: 5, text: "Best lake we've visited for fishing. Caught nothing but smallmouth bass day after day. The coves are beautiful and not overcrowded." },
      { author: "Chris W.", date: "2024-08-12", rating: 4, text: "Great for kayaking and paddleboarding. The morning mist over the water is absolutely breathtaking. Parking can be tough at popular spots on weekends." },
    ],
    contact: {
      phone: "(437) 335-7433",
      website: "https://www.dnr.mo.state.us/inst/parks/tablerock.html",
      hours: "Table Rock State Park: 8:00 AM – Dusk daily",
      address: "4194 Table Rock Lake Rd, Branson, MO 65616",
    },
    hotspotX: 65, hotspotY: 55,
    seasonal: ['spring', 'summer', 'fall'],
    priceRange: '$–$$',
    bestFor: ['Families', 'Outdoor Enthusiasts', 'Couples'],
    duration: 'Half to Full Day',
  },
  {
    id: '3',
    slug: 'titanic-museum',
    title: "Titanic Museum Attractions",
    tagline: "Step Aboard the Ship of Dreams",
    category: 'cultural',
    description: "Step aboard the full-scale replica of the RMS Titanic with over 15,000 original artifacts from the actual ship.",
    overview: `The Titanic Museum Attractions is one of the most visited attractions in the United States. This museum features a full-scale recreation of the Titanic's bow — you walk through a towering ship-shaped building that captures the grandeur of the legendary ocean liner. Inside, explore decks filled with more than 15,000 authentic artifacts recovered from the wreck, including life preservers, china, and personal effects of passengers. The immersive experience includes the chilling iceberg slide, survivor stories, and a replica of the grand staircase.`,
    highlights: [
      "Full-scale replica of the Titanic's bow — walk inside the ship",
      "15,000+ authentic artifacts from the actual wreck",
      "Immersive iceberg slide experience",
      "Replica cabins showing first, second, and third-class life",
      "Survivor and Titanic-themed gift shops",
      "Interactive exhibits for kids and adults alike",
    ],
    images: [
      '/images/pexels-ozarks-autumn-HD.jpg',
      '/images/ozark-mountain-1.jpg',
      '/images/ozark-mountain-2.jpg',
    ],
    videoUrls: ['https://www.youtube.com/embed/T5kDHUBMvKQ'],
    rating: 4.6,
    reviews: [
      { author: "Jennifer B.", date: "2024-09-01", rating: 5, text: "The scale of this building is breathtaking. You really feel like you're on the ship. The artifact collection is one of the most comprehensive in the world." },
      { author: "Robert N.", date: "2024-04-15", rating: 4, text: "Fascinating and well-done museum. Plan at least 2-3 hours to see everything. The iceberg slide is a blast for the kids." },
      { author: "Lisa C.", date: "2024-11-08", rating: 5, text: "We visited during the holiday season and they had special Titanic Christmas decorations inside. Truly one-of-a-kind experience." },
      { author: "Thomas H.", date: "2024-07-28", rating: 5, text: "As a Titanic historian, I was impressed by the authenticity. They have artifacts I've only seen in academic journals." },
    ],
    contact: {
      phone: "(437) 335-0400",
      website: "https://www.thetitanicbranson.com",
      hours: "Monday–Saturday: 9:00 AM – 7:00 PM, Sunday: 12:00 PM – 7:00 PM",
      address: "1012 W US-65 South, Branson, MO 65616",
    },
    hotspotX: 45, hotspotY: 30,
    seasonal: ['winter', 'spring', 'summer', 'fall'],
    priceRange: '$$',
    bestFor: ['Families', 'History Buffs', 'Rainy Day Activity'],
    duration: '2–3 Hours',
  },
  {
    id: '4',
    slug: 'shepherd-of-the-hills',
    title: "Shepherd of the Hills",
    tagline: "America's Largest Outdoor Amphitheater",
    category: 'outdoor',
    description: "America's largest outdoor amphitheater featuring live shows amid stunning mountain scenery.",
    overview: `Nestled deep in the Ozark Mountains, the Shepherd of the Hills Coliseum is a 1,000-seat outdoor amphitheater that has been captivating audiences since 1927. Carved into the mountainside near the confluence of the Jacks Fork and South Fork rivers, this historic venue presents multiple shows throughout the year. The star attraction is "The Shepherd of the Hills" — a live dramatization of Howard P. Chandler's beloved novel, complete with horses, cattle, and Native American performers on a grand stage set against a backdrop of untouched nature.`,
    highlights: [
      "Historic 1,000-seat outdoor amphitheater since 1927",
      "The Shepherd of the Hills — epic outdoor drama with horses and cattle drives",
      "Ozark Mountain Playhouse — family-friendly musical comedies",
      "Stunning natural river and mountain scenery",
      "Camping available on-site for show attendees",
      "Shepherd's Inn lodging and dining nearby",
    ],
    images: [
      '/images/ozark-mountain-1.jpg',
      '/images/pexels-ozarks-autumn-HD.jpg',
      '/images/ozark-mountain-2.jpg',
    ],
    videoUrls: ['https://www.youtube.com/embed/Nqoj5d26LS8'],
    rating: 4.5,
    reviews: [
      { author: "Nancy D.", date: "2024-08-05", rating: 5, text: "Brought the whole family and camped nearby. The outdoor show against the mountain backdrop is one of the most moving experiences we've ever had." },
      { author: "Frank S.", date: "2024-07-14", rating: 4, text: "The grounds are spectacular. Even if you don't attend a show, driving through the grounds and hiking the trails is worth the trip." },
      { author: "Karen V.", date: "2024-09-20", rating: 5, text: "We saw Ozark Mountain Playhouse — hilarious and perfect for families. The setting alone is worth the drive into the mountains." },
    ],
    contact: {
      phone: "(437) 438-2600",
      website: "https://www.theshepherd.org",
      hours: "Show times vary by season — check website for schedule",
      address: "1827 Shepherd of the Hills Rd, West Plains, MO 65775",
    },
    hotspotX: 80, hotspotY: 35,
    seasonal: ['spring', 'summer', 'fall'],
    priceRange: '$$',
    bestFor: ['Families', 'Nature Lovers', 'Show Fans'],
    duration: 'Evening (2–3 hours for shows)',
  },
  {
    id: '5',
    slug: 'dolly-parton-stampede',
    title: "Dolly Parton's Stampede",
    tagline: "The World's Greatest Dinner Show",
    category: 'dining',
    description: "Award-winning dinner show with horse stunts, cattle drives, and Southern charm on a grand Western stage.",
    overview: `Now in its sixth decade, Dolly Parton's Stampede is one of the most successful dinner shows on the planet, having served over 70 million guests. The 2,000-seat Western-themed arena puts on an extraordinary equestrian performance that includes bull riding, calf roping, trick riding, and dramatic cattle drives — all while you feast on a four-course all-you-can-eat meal. The menu features the famous "Stampede Sandwich" (roast beef and cornbread), along with fried chicken, baked ham, and all the fixins'. It's a masterclass in entertainment value.`,
    highlights: [
      "Over 4 hours of spectacular Western entertainment",
      "Four-course all-you-can-eat dinner included in ticket",
      "Trick riders performing dangerous stunts on horseback",
      "Live cattle drives and bulldogging",
      "Over 70 million guests served since 1977",
      "Photo ops with authentic Western props and horses",
    ],
    images: [
      '/images/ozark-mountain-2.jpg',
      '/images/ozark-mountain-1.jpg',
      '/images/pexels-ozarks-autumn-HD.jpg',
    ],
    videoUrls: ['https://www.youtube.com/embed/XqemEPCgHiE'],
    rating: 4.7,
    reviews: [
      { author: "Patricia G.", date: "2024-06-22", rating: 5, text: "The food quality shocked us — legitimately great roast beef and cornbread. Don't skip the biscuits! The horse show is world-class." },
      { author: "Gary M.", date: "2024-08-30", rating: 5, text: "Our family's tradition for 5 years running. The kids love the horses and we love the food. It's expensive but absolutely worth it." },
      { author: "Susan H.", date: "2024-07-08", rating: 4, text: "Great show, good food, but arrive early as seating fills fast. The trick riding had us cheering from our seats." },
    ],
    contact: {
      phone: "(437) 334-5200",
      website: "https://www.stampede.com",
      hours: "Shows: 11:00 AM, 4:00 PM, 8:00 PM daily",
      address: "1 Dolly Parton Pkwy, Pigeon Forge, TN 37863",
    },
    hotspotX: 55, hotspotY: 65,
    seasonal: ['spring', 'summer', 'fall', 'winter'],
    priceRange: '$$$',
    bestFor: ['Families', 'First-Time Visitors', 'Food Lovers'],
    duration: '4 Hours',
  },
  {
    id: '6',
    slug: 'branson-landing',
    title: "Branson Landing",
    tagline: "Waterfront Entertainment Hub",
    category: 'entertainment',
    description: "Waterfront entertainment complex with shops, dining, live music, and seasonal events on the majestic Table Rock Lake.",
    overview: `Branson Landing is a spectacular waterfront development that sits right on the shores of Table Rock Lake. Designed as a mix of upscale shopping, diverse dining, and live entertainment venues, this destination offers something for every family member. The complex features a dramatic fountain show, an old-fashioned carousel, a full-size Ferris wheel, and multiple live music venues performing country, bluegrass, and southern rock nightly. In winter, it transforms into a holiday market with ice skating and festive lights.`,
    highlights: [
      "Dramatic fountain shows with music and light displays",
      "Over 20 dining options from casual to fine dining",
      "Live music venues with nightly performances",
      "Ferris wheel with panoramic lake views",
      "Holiday season transforms into Branson Christmas Festival",
      "Carousel, mini train, and splash pad for kids",
    ],
    images: [
      '/images/pexels-ozarks-autumn-HD.jpg',
      '/images/ozark-mountain-1.jpg',
      '/images/ozark-mountain-2.jpg',
    ],
    videoUrls: ['https://www.youtube.com/embed/t_jDcxgq6F8'],
    rating: 4.5,
    reviews: [
      { author: "Brian A.", date: "2024-10-01", rating: 5, text: "The Christmas Festival is magical. The entire waterfront is decorated and there are ice skating, carolers, and live music everywhere." },
      { author: "Melissa F.", date: "2024-07-19", rating: 4, text: "Perfect evening destination. Food court has great options, the fountain shows are free, and the lake views are stunning at sunset." },
      { author: "Kevin D.", date: "2024-05-30", rating: 5, text: "Even if you just come for dinner, stick around for the fountain show. It rivals Las Vegas in quality." },
    ],
    contact: {
      phone: "(437) 274-4300",
      website: "https://www.bransonlanding.com",
      hours: "Open daily — individual venue hours vary",
      address: "600 W Lakeview Dr, Branson, MO 65616",
    },
    hotspotX: 40, hotspotY: 72,
    seasonal: ['spring', 'summer', 'fall', 'winter'],
    priceRange: '$–$$$ (free to browse)',
    bestFor: ['Families', 'Couples', 'All Ages'],
    duration: 'Half Day (2–4 hours)',
  },
  {
    id: '7',
    slug: 'mountain-grove-lake',
    title: "Mountain Grove Lake",
    tagline: "Peaceful Ozark Serenity",
    category: 'relaxation',
    description: "Serene lake offering peaceful fishing, kayaking, and breathtaking Ozark sunsets away from the crowds.",
    overview: `Tucked away from Branson's main tourist corridor, Mountain Grove Lake is a hidden gem known for its crystal-clear waters and peaceful atmosphere. This natural lake — the largest natural lake in Southwest Missouri — sits at 1,180 feet elevation and is surrounded by dense Ozark forest. The lake has no submerged dams or man-made structures, giving it a naturally pristine appearance. Popular activities include trout fishing, kayaking through coves, and watching spectacular sunsets that paint the surrounding mountains in gold and purple hues.`,
    highlights: [
      "Missouri's largest natural lake at 1,180 feet elevation",
      "Pristine trout fishing — rainbow and brown trout",
      "Kayak and canoe rentals from local outfitters",
      "Scenic hiking trails around the lake perimeter",
      "Spectacular sunrise and sunset viewpoints",
      "Peaceful cabins available for rent — perfect getaways",
    ],
    images: [
      '/images/ozark-mountain-1.jpg',
      '/images/ozark-mountain-2.jpg',
      '/images/pexels-ozarks-autumn-HD.jpg',
    ],
    videoUrls: ['https://www.youtube.com/embed/OJXJ3yH_DfI'],
    rating: 4.8,
    reviews: [
      { author: "Diana W.", date: "2024-04-25", rating: 5, text: "This place is heaven. We kayaked at sunrise and it was silent except for the occasional loon call. Most beautiful sunrise of our lives." },
      { author: "Paul R.", date: "2024-09-10", rating: 5, text: "Best fishing lake in Missouri, hands down. The trout population is healthy and the scenery while you fish is unbeatable." },
    ],
    contact: {
      phone: "(417) 479-3322",
      website: "https://www.visitmountaingrove.com",
      hours: "Public access — dawn to dusk",
      address: "Mountain Grove, MO 65711",
    },
    hotspotX: 22, hotspotY: 60,
    seasonal: ['spring', 'summer', 'fall'],
    priceRange: '$–$$',
    bestFor: ['Couples', 'Nature Lovers', 'Fishing Enthusiasts'],
    duration: 'Flexible (full day to weekend)',
  },
  {
    id: '8',
    slug: 'the-show-brig',
    title: "The Show Brig",
    tagline: "Pirate Adventure on the Water",
    category: 'cruise',
    description: "Pirate ship dinner cruise through Table Rock Lake with live comedy, music, and entertainment.",
    overview: `The Show Brig is a beloved Branson institution — a converted brigantine rig that sails Table Rock Lake while putting on a hilarious live comedy show. Captain Hook and his pirate crew regale passengers with jokes, skits, and musical performances as you glide past the stunning Ozark mountain scenery. The ship hosts buffet dinners with seafood and Southern favorites, and offers both day cruises and sunset dinner packages. Kids especially love the pirate theme — there are treasure hunts, costume photo ops, and plenty of interactive moments with the cast.`,
    highlights: [
      "Live comedy and entertainment on the water",
      "Captain Hook live comedy show",
      "Buffet dinner with seafood and Southern cuisine",
      "Day cruises, sunset cruises, and private charter options",
      "Treasure hunts and interactive activities for kids",
      "Stunning mountain and lake views from the water",
    ],
    images: [
      '/images/ozark-mountain-2.jpg',
      '/images/pexels-ozarks-autumn-HD.jpg',
      '/images/ozark-mountain-1.jpg',
    ],
    videoUrls: [],
    rating: 4.3,
    reviews: [
      { author: "Mark J.", date: "2024-06-30", rating: 4, text: "Fun family experience! The Captain Hook show had the whole family laughing. Food was decent buffet-quality and the lake views were gorgeous." },
      { author: "Rachel T.", date: "2024-08-15", rating: 5, text: "Did the sunset cruise — absolutely magical. The sky turned purple over the mountains and the pirates were singing. Perfect date night." },
      { author: "Steve L.", date: "2024-07-22", rating: 4, text: "Great for kids the ages 5-12. Treasure hunt was the highlight for our 7-year-old. Book dinner cruise for the full experience." },
    ],
    contact: {
      phone: "(437) 334-6400",
      website: "https://www.showbrig.com",
      hours: "Cruises: 2:00 PM – 4:00 PM and 5:30 PM – 7:30 PM daily",
      address: "Branson Landing Dock, 600 W Lakeview Dr, Branson, MO 65616",
    },
    hotspotX: 85, hotspotY: 62,
    seasonal: ['spring', 'summer', 'fall'],
    priceRange: '$$',
    bestFor: ['Families', 'Kids', 'Entertainment Lovers'],
    duration: '2 Hours',
  },
];

// Lookup helpers
export function getActivityBySlug(slug: string): Activity | undefined {
  return activities.find(a => a.slug === slug);
}

export function getActivityHotspots() {
  return activities.map(a => ({
    id: a.id,
    slug: a.slug,
    x: a.hotspotX,
    y: a.hotspotY,
    title: a.title,
    category: a.category,
    description: a.description,
    image: a.images[0],
  }));
}

// Category badge colors (matches globals.css)
export const categoryBadge: Record<string, string> = {
  adventure: 'badge-adventure',
  water: 'badge-water',
  cultural: 'badge-cultural',
  outdoor: 'badge-outdoor',
  entertainment: 'badge-entertainment',
  relaxation: 'badge-relaxation',
  dining: 'badge-dining',
  cruise: 'badge-cruise',
  themes: 'badge-adventure',
};
