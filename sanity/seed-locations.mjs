import { createClient } from 'next-sanity';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local natively without external dependencies
const envPath = resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-16';
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

if (!projectId) {
  console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID is missing in .env.local');
  process.exit(1);
}

if (!token) {
  console.error('❌ Error: SANITY_API_READ_TOKEN or SANITY_API_WRITE_TOKEN is missing in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// Import locations data
const locations = [
  {
    slug: "bordeaux-centre",
    name: "Bordeaux Centre",
    cityTag: "Bordeaux, France",
    badge: "Flagship",
    order: 1,
    mapCoords: {
      top: "14%",
      left: "48.2%",
    },
    coordinates: {
      lat: 44.8416106,
      lng: -0.5810938,
    },
    tagline: {
      prefix: "Bustling & Bold.",
      highlight: "Our Original.",
      description: "Right In The Heart Of The City. \nWhere It All Started In 2011, And Where The Lines Still Form At Lunch.",
    },
    address: "14 Rue Sainte-Catherine, 33000 Bordeaux",
    phone: "+33 5 56 00 12 34",
    mapsUrl: "https://maps.google.com/?q=14+Rue+Sainte-Catherine+Bordeaux",
    images: {
      storefrontUrl: "/location_details-hero.jpg",
      kiosksUrl: "/locations/kiosks.jpg",
      diningUrl: "/locations/dining.jpg",
      barStoolsUrl: "/locations/bar_stools.jpg",
      counterUrl: "/locations/counter.jpg",
      virtualTourUrl: "/locations/virtual_tour.jpg",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "The Original Tender Box.",
      subtitle: "The Recipe That Started The Obsession",
    },
    openingHours: {
      weekday: "Mon–Thu 11:00–23:00",
      weekend: "Fri–Sat 11:00–01:00",
      sunday: "Sun 12:00–22:00",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    features: ["Digital Kiosks", "Dine-In", "Takeaway", "Late Night", "WiFi"],
    stats: {
      established: "2011",
      capacity: "85 Seats",
      averageWait: "4 Mins",
    },
  },
  {
    slug: "merignac",
    name: "Mérignac",
    cityTag: "Mérignac, France",
    badge: "Airport Hub",
    order: 2,
    mapCoords: {
      top: "15%",
      left: "46.2%",
    },
    coordinates: {
      lat: 51.5072,
      lng: -0.1276,
    },
    tagline: {
      prefix: "Drive-Thru & Speed.",
      highlight: "Airport Corridor.",
      description: "Designed For Those On The Move. Ultra-Fast Service, Generous Parking, And The Same Golden Crispy Crunch.",
    },
    address: "85 Avenue John Fitzgerald Kennedy, 33700 Mérignac",
    phone: "+33 5 56 00 56 78",
    mapsUrl: "https://maps.google.com/?q=85+Avenue+JFK+Merignac",
    images: {
      storefrontUrl: "/location_details-hero.jpg",
      kiosksUrl: "/locations/kiosks.jpg",
      diningUrl: "/locations/dining.jpg",
      barStoolsUrl: "/locations/bar_stools.jpg",
      counterUrl: "/locations/counter.jpg",
      virtualTourUrl: "/locations/virtual_tour.jpg",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "The Mega Crunch Bucket.",
      subtitle: "Freshly Dipped Wings & Tenders For The Crew",
    },
    openingHours: {
      weekday: "Mon–Thu 11:00–23:30",
      weekend: "Fri–Sat 11:00–01:30",
      sunday: "Sun 11:30–23:00",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    features: ["Drive-Thru", "Free Parking", "Express Kiosks", "Family Zone", "Fast Pick-Up"],
    stats: {
      established: "2016",
      capacity: "120 Seats",
      averageWait: "3 Mins",
    },
  },
  {
    slug: "bordeaux-bastide",
    name: "Bordeaux Bastide",
    cityTag: "Bastide, Bordeaux",
    badge: "Riverside",
    order: 3,
    mapCoords: {
      top: "18%",
      left: "46.2%",
    },
    coordinates: {
      lat: 52.5200,
      lng: 13.4050,
    },
    tagline: {
      prefix: "Riverside Chill.",
      highlight: "Right Bank Vibe.",
      description: "Overlooking The Garonne River. Sunset Views With Serious Crunch, Craft Sauces, And A Relaxed Terrace.",
    },
    address: "28 Avenue Thiers, 33100 Bordeaux",
    phone: "+33 5 56 00 90 12",
    mapsUrl: "https://maps.google.com/?q=28+Avenue+Thiers+Bordeaux",
    images: {
      storefrontUrl: "/location_details-hero.jpg",
      kiosksUrl: "/locations/kiosks.jpg",
      diningUrl: "/locations/dining.jpg",
      barStoolsUrl: "/locations/bar_stools.jpg",
      counterUrl: "/locations/counter.jpg",
      virtualTourUrl: "/locations/virtual_tour.jpg",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "Hot Honey Butter Sandwich.",
      subtitle: "Smothered In Signature Glaze On Toasted Brioche",
    },
    openingHours: {
      weekday: "Mon–Thu 11:30–23:00",
      weekend: "Fri–Sat 11:30–00:30",
      sunday: "Sun 12:00–22:30",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    features: ["Riverside Terrace", "Outdoor Seating", "Cocktail Bar", "Late Night", "Pet Friendly"],
    stats: {
      established: "2019",
      capacity: "95 Seats",
      averageWait: "5 Mins",
    },
  },
  {
    slug: "talence",
    name: "Talence",
    cityTag: "Talence, Bordeaux",
    badge: "University",
    order: 4,
    mapCoords: {
      top: "10%",
      left: "46.2%",
    },
    coordinates: {
      lat: 51.9028,
      lng: 12.4964,
    },
    tagline: {
      prefix: "Campus Energy.",
      highlight: "Student Hub.",
      description: "Steps From The University. Packed With Student Deals, High-Top Charging Bars, And Non-Stop Crispy Vibes.",
    },
    address: "120 Cours Gambetta, 33400 Talence",
    phone: "+33 5 56 00 34 56",
    mapsUrl: "https://maps.google.com/?q=120+Cours+Gambetta+Talence",
    images: {
      storefrontUrl: "/location_details-hero.jpg",
      kiosksUrl: "/locations/kiosks.jpg",
      diningUrl: "/locations/dining.jpg",
      barStoolsUrl: "/locations/bar_stools.jpg",
      counterUrl: "/locations/counter.jpg",
      virtualTourUrl: "/locations/virtual_tour.jpg",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "The Quad Stack Burger.",
      subtitle: "Four Crispy Fillets With Double Pepper Jack",
    },
    openingHours: {
      weekday: "Mon–Thu 11:00–23:00",
      weekend: "Fri–Sat 11:00–02:00",
      sunday: "Sun 12:00–23:00",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    features: ["Charging Stations", "Study Friendly", "Student Discount", "Fast WiFi", "Group Tables"],
    stats: {
      established: "2021",
      capacity: "110 Seats",
      averageWait: "4 Mins",
    },
  },
  {
    slug: "pessac",
    name: "Pessac",
    cityTag: "Pessac, France",
    badge: "Family Haven",
    order: 5,
    mapCoords: {
      top: "20%",
      left: "46.8%",
    },
    coordinates: {
      lat: 40.4168,
      lng: -3.7038,
    },
    tagline: {
      prefix: "Suburban Comfort.",
      highlight: "Family Haven.",
      description: "A Spacious Gathering Spot For Families And Friends. Easy Parking, Generous Seating, And Fresh Chicken Daily.",
    },
    address: "42 Avenue Pasteur, 33600 Pessac",
    phone: "+33 5 56 00 78 90",
    mapsUrl: "https://maps.google.com/?q=42+Avenue+Pasteur+Pessac",
    images: {
      storefrontUrl: "/location_details-hero.jpg",
      kiosksUrl: "/locations/kiosks.jpg",
      diningUrl: "/locations/dining.jpg",
      barStoolsUrl: "/locations/bar_stools.jpg",
      counterUrl: "/locations/counter.jpg",
      virtualTourUrl: "/locations/virtual_tour.jpg",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "Family Feast Sharing Platter.",
      subtitle: "30 Tenders, 4 Large Dips, Hand-Cut Fries",
    },
    openingHours: {
      weekday: "Mon–Thu 11:00–22:30",
      weekend: "Fri–Sat 11:00–00:00",
      sunday: "Sun 11:30–22:00",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    features: ["Kids Play Area", "Free Parking", "Large Booths", "Disabled Access", "Takeaway"],
    stats: {
      established: "2023",
      capacity: "140 Seats",
      averageWait: "4 Mins",
    },
  },
];

async function seed() {
  console.log(`🚀 Starting location seed for project: ${projectId} (${dataset})...`);

  for (const loc of locations) {
    const doc = {
      _id: `location-${loc.slug}`,
      _type: 'location',
      name: loc.name,
      slug: { _type: 'slug', current: loc.slug },
      cityTag: loc.cityTag,
      badge: loc.badge,
      order: loc.order,
      coordinates: loc.coordinates,
      mapCoords: loc.mapCoords,
      tagline: loc.tagline,
      address: loc.address,
      phone: loc.phone,
      mapsUrl: loc.mapsUrl,
      images: loc.images,
      signatureDish: loc.signatureDish,
      openingHours: loc.openingHours,
      tourTitle: loc.tourTitle,
      tourSubtitle: loc.tourSubtitle,
      features: loc.features,
      stats: loc.stats,
    };

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        const res = await client.createOrReplace(doc);
        console.log(`✅ Uploaded / Replaced location: "${res.name}" (ID: ${res._id})`);
        success = true;
      } catch (err) {
        if (attempt === 3) {
          console.error(`❌ Failed to upload "${loc.name}" after 3 attempts:`, err.message);
        } else {
          console.warn(`⚠️ Attempt ${attempt} failed for "${loc.name}" (${err.message}), retrying...`);
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    }
  }

  console.log('\n🎉 Finished seeding locations to Sanity!');
}

seed().catch(console.error);
