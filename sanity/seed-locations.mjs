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

// Common reviews translated in English & French for restaurant locations
const sharedLocationReviews = [
  {
    _key: 'rev_loc_1',
    authorName: 'Yousra Djeddou',
    rating: 5,
    quote: '“Formules interessantes à partager, on a pris la box wings-tenders cétait pas mal dutout et généreux. Service rapide et efficace.”',
    quoteFr: '“Formules intéressantes à partager, on a pris la box wings-tenders c\'était pas mal du tout et généreux. Service rapide et efficace.”',
  },
  {
    _key: 'rev_loc_2',
    authorName: 'Arm',
    rating: 5,
    quote: "“A very nice, clean restaurant with fast service and a warm welcome. There's an outdoor terrace. The tacos are good and quite generous”",
    quoteFr: '“Un restaurant très agréable, propre avec un service rapide et un accueil chaleureux. Il y a une terrasse extérieure. Les tacos sont très bons et généreux.”',
  },
  {
    _key: 'rev_loc_3',
    authorName: 'Med saleck',
    rating: 5,
    quote: '“Beautiful place!! The tacos were delicious, the music was great, and just for the service”',
    quoteFr: '“Superbe endroit ! Les tacos étaient délicieux, la musique était excellente, et rien que pour le service ça vaut le détour.”',
  },
  {
    _key: 'rev_loc_4',
    authorName: 'Timeo scerri',
    rating: 5,
    quote: '“The staff were very pleasant and smiling, the food was excellent and served quickly, and the music created a great atmosphere. I highly recommend it”',
    quoteFr: '“L\'équipe était très agréable et souriante, la nourriture était excellente et servie rapidement, et la musique créait une ambiance géniale. Je recommande vivement !”',
  },
];

// 4 official CFC locations with full English & French translations
const locations = [
  {
    slug: "bordeauxlac",
    name: "Bordeauxlac",
    cityTag: "Bordeaux Lac, France",
    badge: "Bordeaux Lac",
    badgeFr: "Bordeaux Lac",
    order: 1,
    rating: 4.7,
    reviewCount: 2183,
    mapCoords: {
      top: "12%",
      left: "47%",
    },
    coordinates: {
      lat: 44.8911124,
      lng: -0.5463199,
    },
    heroSubheading: "CFC Tasty",
    heroSubheadingFr: "CFC Savoureux",
    heroHeading: "Bordeauxlac",
    heroHeadingFr: "Bordeaux Lac",
    heroDescription: "Located near the lake in Bordeaux. Crispy fried chicken, generous portions, and fast, friendly service for crunch lovers.",
    heroDescriptionFr: "Situé près du lac à Bordeaux. Poulet frit croustillant, portions généreuses et service rapide et chaleureux pour les passionnés de croustillant.",
    tagline: {
      prefix: "Lakeside Crunch.",
      highlight: "Bordeaux Lac.",
      description: "Located near the lake in Bordeaux. Crispy fried chicken, generous portions, and fast, friendly service.",
    },
    taglineFr: {
      prefix: "Le croustillant au bord du lac.",
      highlight: "Bordeaux Lac.",
      description: "Situé près du lac à Bordeaux. Poulet frit croustillant, portions généreuses et service chaleureux.",
    },
    address: "32 Rue Yves Glotin, 33300 Bordeaux, France",
    phone: "+33 5 56 00 12 34",
    mapsUrl: "https://www.google.com/maps/place/32+Rue+Yves+Glotin,+33300+Bordeaux,+France/@44.8911124,-0.5463199,17z/data=!3m1!4b1!4m6!3m5!1s0xd55291f32352769:0x5b86a8c7c92e5f40!8m2!3d44.8911124!4d-0.5463199!16s%2Fg%2F11cpfnkhm1?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
    images: {
      storefrontUrl: "/locations/bordeaux_front.jpg",
      kiosksUrl: "/locations/kiosks.jpg",
      diningUrl: "/locations/dining.jpg",
      barStoolsUrl: "/locations/bar_stools.jpg",
      counterUrl: "/locations/counter.jpg",
      virtualTourUrl: "/locations/virtual_tour.jpg",
    },
    signatureDish: {
      badge: "Signature Dish",
      badgeFr: "Plat Signature",
      title: "The Original Tender Box.",
      titleFr: "La Box de Tenders Originale.",
      subtitle: "The Recipe That Started The Obsession",
      subtitleFr: "La recette qui a déclenché l'obsession",
    },
    openingHours: {
      weekday: "Mon–Thu 11:00–23:00",
      weekdayFr: "Lun–Jeu 11h00–23h00",
      weekend: "Fri–Sat 11:00–01:00",
      weekendFr: "Ven–Sam 11h00–01h00",
      sunday: "Sun 12:00–22:00",
      sundayFr: "Dim 12h00–22h00",
    },
    tourTitle: "Step Inside The Crunch",
    tourTitleFr: "Plongez dans le croustillant",
    tourSubtitle: "Take A Virtual Tour",
    tourSubtitleFr: "Faites une visite virtuelle",
    features: ["Digital Kiosks", "Dine-In", "Takeaway", "Late Night", "WiFi"],
    featuresFr: ["Bornes Digitales", "Sur Place", "À Emporter", "Service Nocturne", "WiFi Gratuit"],
    stats: {
      established: "2018",
      capacity: "85 Seats",
      averageWait: "4 Mins",
    },
    statsFr: {
      established: "2018",
      capacity: "85 Places",
      averageWait: "4 Min",
    },
    reviews: sharedLocationReviews,
  },
  {
    slug: "bordeaux",
    name: "Bordeaux",
    cityTag: "Bordeaux Centre, France",
    badge: "Flagship",
    badgeFr: "Restaurant Phare",
    order: 2,
    rating: 4.8,
    reviewCount: 2183,
    mapCoords: {
      top: "14%",
      left: "48.2%",
    },
    coordinates: {
      lat: 44.8298661,
      lng: -0.568634,
    },
    heroSubheading: "CFC Tasty",
    heroSubheadingFr: "CFC Savoureux",
    heroHeading: "Bordeaux",
    heroHeadingFr: "Bordeaux Centre",
    heroDescription: "Right In The Heart Of Bordeaux. Where It All Started In 2011, And Where The Lines Still Form For The Signature Shatter-Crunch.",
    heroDescriptionFr: "En plein cœur de Bordeaux. Là où tout a commencé en 2011, et où les files d'attente se forment toujours pour notre croustillant signature incomparable.",
    tagline: {
      prefix: "Bustling & Bold.",
      highlight: "Our Original.",
      description: "Right In The Heart Of Bordeaux. Where It All Started In 2011, And Where The Lines Still Form At Lunch.",
    },
    taglineFr: {
      prefix: "Vivant & Audacieux.",
      highlight: "Notre Original.",
      description: "En plein cœur de Bordeaux. Là où tout a commencé en 2011, et où les passionnés se retrouvent chaque jour pour notre croustillant signature.",
    },
    address: "69 Cours de la Marne, 33800 Bordeaux, France",
    phone: "+33 5 56 00 12 34",
    mapsUrl: "https://www.google.com/maps?q=Cfc,+69+Cr+de+la+Marne,+33800+Bordeaux,+France&ftid=0xd5527b60605d33d:0x14b9f742a04055b7&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,100821555,47071704,94218641,94282134,100835699,94286869,100820247,100822504&g_ep=CAISEjI2LjM5LjAuOTg0OTU2MzcwMBgAINeCAypnLDk0Mjk3Njk5LDk0MjMxMTg4LDk0MjgwNTY4LDEwMDgyMTU1NSw0NzA3MTcwNCw5NDIxODY0MSw5NDI4MjEzNCwxMDA4MzU2OTksOTQyODY4NjksMTAwODIwMjQ3LDEwMDgyMjUwNEICSU4%3D&skid=52b789de-1a58-4ab0-9da0-d3611203d4b1&g_st=iw",
    images: {
      storefrontUrl: "/locations/bordeaux_front.jpg",
      kiosksUrl: "/locations/kiosks.jpg",
      diningUrl: "/locations/dining.jpg",
      barStoolsUrl: "/locations/bar_stools.jpg",
      counterUrl: "/locations/counter.jpg",
      virtualTourUrl: "/locations/virtual_tour.jpg",
    },
    signatureDish: {
      badge: "Signature Dish",
      badgeFr: "Plat Signature",
      title: "The Original Tender Box.",
      titleFr: "La Box de Tenders Originale.",
      subtitle: "The Recipe That Started The Obsession",
      subtitleFr: "La recette qui a déclenché l'obsession",
    },
    openingHours: {
      weekday: "Mon–Thu 11:00–23:00",
      weekdayFr: "Lun–Jeu 11h00–23h00",
      weekend: "Fri–Sat 11:00–01:00",
      weekendFr: "Ven–Sam 11h00–01h00",
      sunday: "Sun 12:00–22:00",
      sundayFr: "Dim 12h00–22h00",
    },
    tourTitle: "Step Inside The Crunch",
    tourTitleFr: "Plongez dans le croustillant",
    tourSubtitle: "Take A Virtual Tour",
    tourSubtitleFr: "Faites une visite virtuelle",
    features: ["Digital Kiosks", "Dine-In", "Takeaway", "Late Night", "WiFi"],
    featuresFr: ["Bornes Digitales", "Sur Place", "À Emporter", "Service Nocturne", "WiFi Gratuit"],
    stats: {
      established: "2011",
      capacity: "85 Seats",
      averageWait: "4 Mins",
    },
    statsFr: {
      established: "2011",
      capacity: "85 Places",
      averageWait: "4 Min",
    },
    reviews: sharedLocationReviews,
  },
  {
    slug: "bouscat",
    name: "Bouscat",
    cityTag: "Le Bouscat, France",
    badge: "Gourmet Hub",
    badgeFr: "Espace Gourmand",
    order: 3,
    rating: 4.6,
    reviewCount: 2289,
    mapCoords: {
      top: "18%",
      left: "46.2%",
    },
    coordinates: {
      lat: 44.854328,
      lng: -0.593309,
    },
    heroSubheading: "CFC Tasty",
    heroSubheadingFr: "CFC Savoureux",
    heroHeading: "Bouscat",
    heroHeadingFr: "Le Bouscat",
    heroDescription: "Nestled In Le Bouscat. Modern Aesthetic, Warm Amber Glow, And Uncompromising Crunch Fresh From The Fryers.",
    heroDescriptionFr: "Niché au Bouscat. Ambiance moderne, lumière ambrée chaleureuse et un croustillant sans compromis tout juste sorti des friteuses.",
    tagline: {
      prefix: "Gourmet & Chill.",
      highlight: "Avenue Vibe.",
      description: "Nestled In Le Bouscat. Modern Aesthetic, Warm Amber Glow, And Uncompromising Crunch Fresh From The Fryers.",
    },
    taglineFr: {
      prefix: "Gourmand & Chaleureux.",
      highlight: "Ambiance Avenue.",
      description: "Niché au Bouscat. Ambiance moderne, lumière ambrée chaleureuse et croustillant sans compromis.",
    },
    address: "13bis Boulevard Pierre 1er, 33110 Le Bouscat, France",
    phone: "+33 5 56 00 90 12",
    mapsUrl: "https://www.google.com/maps?q=CFC,+13bis+Bd+Pierre+1er,+33110+Le+Bouscat,+France&ftid=0xd55295f654ce2cb:0x64afcf131183132b&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,100821555,47071704,94218641,94282134,100835699,94286869,100820247,100822504&g_ep=CAISEjI2LjM5LjAuOTg0OTU2MzcwMBgAINeCAypnLDk0Mjk3Njk5LDk0MjMxMTg4LDk0MjgwNTY4LDEwMDgyMTU1NSw0NzA3MTcwNCw5NDIxODY0MSw5NDI4MjEzNCwxMDA4MzU2OTksOTQyODY4NjksMTAwODIwMjQ3LDEwMDgyMjUwNEICSU4%3D&skid=ae67aa00-28ab-486e-a736-046720f73c95&g_st=iw",
    images: {
      storefrontUrl: "/locations/bordeaux_front.jpg",
      kiosksUrl: "/locations/kiosks.jpg",
      diningUrl: "/locations/dining.jpg",
      barStoolsUrl: "/locations/bar_stools.jpg",
      counterUrl: "/locations/counter.jpg",
      virtualTourUrl: "/locations/virtual_tour.jpg",
    },
    signatureDish: {
      badge: "Signature Dish",
      badgeFr: "Plat Signature",
      title: "Hot Honey Butter Sandwich.",
      titleFr: "Sandwich Beurre & Miel Épicé.",
      subtitle: "Smothered In Signature Glaze On Toasted Brioche",
      subtitleFr: "Nappé de notre glaçage signature sur brioche toastée",
    },
    openingHours: {
      weekday: "Mon–Thu 11:30–23:00",
      weekdayFr: "Lun–Jeu 11h30–23h00",
      weekend: "Fri–Sat 11:30–00:30",
      weekendFr: "Ven–Sam 11h30–00h30",
      sunday: "Sun 12:00–22:30",
      sundayFr: "Dim 12h00–22h30",
    },
    tourTitle: "Step Inside The Crunch",
    tourTitleFr: "Plongez dans le croustillant",
    tourSubtitle: "Take A Virtual Tour",
    tourSubtitleFr: "Faites une visite virtuelle",
    features: ["Outdoor Terrace", "Dine-In", "Express Kiosks", "Late Night", "WiFi"],
    featuresFr: ["Terrasse Extérieure", "Sur Place", "Bornes Express", "Service Nocturne", "WiFi Gratuit"],
    stats: {
      established: "2019",
      capacity: "90 Seats",
      averageWait: "4 Mins",
    },
    statsFr: {
      established: "2019",
      capacity: "90 Places",
      averageWait: "4 Min",
    },
    reviews: sharedLocationReviews,
  },
  {
    slug: "talence",
    name: "Talence",
    cityTag: "Talence, France",
    badge: "University",
    badgeFr: "Campus Étudiant",
    order: 4,
    rating: 5,
    reviewCount: 5242,
    mapCoords: {
      top: "10%",
      left: "46.2%",
    },
    coordinates: {
      lat: 44.8010635,
      lng: -0.5952759,
    },
    heroSubheading: "CFC Tasty",
    heroSubheadingFr: "CFC Savoureux",
    heroHeading: "Talence",
    heroHeadingFr: "Talence",
    heroDescription: "Steps From The University Campus. Packed With Student Deals, High-Top Charging Bars, And Non-Stop Crispy Vibes.",
    heroDescriptionFr: "À deux pas du campus universitaire. Formules étudiants, comptoirs de recharge et ambiance croustillante non-stop.",
    tagline: {
      prefix: "Campus Energy.",
      highlight: "Student Hub.",
      description: "Steps From The University Campus. Packed With Student Deals, High-Top Charging Bars, And Non-Stop Crispy Vibes.",
    },
    taglineFr: {
      prefix: "Énergie Campus.",
      highlight: "Hub Étudiant.",
      description: "À deux pas du campus universitaire. Formules étudiants et ambiance croustillante non-stop.",
    },
    address: "120 Cours Gambetta, 33400 Talence, France",
    phone: "+33 5 56 00 34 56",
    mapsUrl: "https://www.google.com/maps/place/CFC+Talence/@44.801064,-0.595276,17z/data=!4m6!3m5!1s0xd5527fb67c01f6f:0xa701a80dc754c8df!8m2!3d44.8010635!4d-0.5952759!16s%2Fg%2F11j8lz4s7x?hl=fr&entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
    images: {
      storefrontUrl: "/locations/bordeaux_front.jpg",
      kiosksUrl: "/locations/kiosks.jpg",
      diningUrl: "/locations/dining.jpg",
      barStoolsUrl: "/locations/bar_stools.jpg",
      counterUrl: "/locations/counter.jpg",
      virtualTourUrl: "/locations/virtual_tour.jpg",
    },
    signatureDish: {
      badge: "Signature Dish",
      badgeFr: "Plat Signature",
      title: "The Quad Stack Burger.",
      titleFr: "Le Quad Stack Burger.",
      subtitle: "Four Crispy Fillets With Double Pepper Jack",
      subtitleFr: "Quatre filets croustillants avec double pepper jack",
    },
    openingHours: {
      weekday: "Mon–Thu 11:00–23:00",
      weekdayFr: "Lun–Jeu 11h00–23h00",
      weekend: "Fri–Sat 11:00–02:00",
      weekendFr: "Ven–Sam 11h00–02h00",
      sunday: "Sun 12:00–23:00",
      sundayFr: "Dim 12h00–23h00",
    },
    tourTitle: "Step Inside The Crunch",
    tourTitleFr: "Plongez dans le croustillant",
    tourSubtitle: "Take A Virtual Tour",
    tourSubtitleFr: "Faites une visite virtuelle",
    features: ["Charging Stations", "Study Friendly", "Student Discount", "Fast WiFi", "Group Tables"],
    featuresFr: ["Prises & Recharge", "Espace Étude", "Menu Étudiant", "WiFi Rapide", "Grandes Tables"],
    stats: {
      established: "2021",
      capacity: "95 Seats",
      averageWait: "4 Mins",
    },
    statsFr: {
      established: "2021",
      capacity: "95 Places",
      averageWait: "4 Min",
    },
    reviews: sharedLocationReviews,
  },
];

// Separate Location Reviews Section document (overall review count + 6 general cards)
const locationReviewsDoc = {
  _id: 'locationReviews',
  _type: 'locationReviews',
  overallReviewCount: '11,897',
  title: "Reviews Can't Be Wrong",
  titleFr: "Les avis ne mentent pas",
  reviews: [
    {
      _key: 'rev_1',
      authorName: 'Yousra Djeddou',
      rating: 5,
      quote: '“Formules interessantes à partager, on a pris la box wings-tenders cétait pas mal dutout et généreux. Service rapide et efficace.”',
      quoteFr: '“Formules intéressantes à partager, on a pris la box wings-tenders c\'était pas mal du tout et généreux. Service rapide et efficace.”',
    },
    {
      _key: 'rev_2',
      authorName: 'Arm',
      rating: 5,
      quote: "“A very nice, clean restaurant with fast service and a warm welcome. There's an outdoor terrace. The tacos are good and quite generous”",
      quoteFr: '“Un restaurant très agréable, propre avec un service rapide et un accueil chaleureux. Il y a une terrasse extérieure. Les tacos sont très bons et généreux.”',
    },
    {
      _key: 'rev_3',
      authorName: 'Camille Roussel',
      rating: 5,
      quote: '“Des tenders croustillants marinés au babeurre, des sauces maison qui font toute la différence. Accueil au top !”',
      quoteFr: '“Des tenders croustillants marinés au babeurre, des sauces maison qui font toute la différence. Accueil au top !”',
    },
    {
      _key: 'rev_4',
      authorName: 'Med saleck',
      rating: 5,
      quote: '“Beautiful place!! The tacos were delicious, the music was great, and just for the service”',
      quoteFr: '“Superbe endroit ! Les tacos étaient délicieux, la musique était excellente, et rien que pour le service ça vaut le détour.”',
    },
    {
      _key: 'rev_5',
      authorName: 'Timeo scerri',
      rating: 5,
      quote: '“The staff were very pleasant and smiling, the food was excellent and served quickly, and the music created a great atmosphere. I highly recommend it”',
      quoteFr: '“L\'équipe était très agréable et souriante, la nourriture était excellente et servie rapidement, et la musique créait une ambiance géniale. Je recommande vivement !”',
    },
    {
      _key: 'rev_6',
      authorName: 'Thomas Dubois',
      rating: 5,
      quote: '“Un vrai régal à chaque passage. Le bucket à partager et les frites croustillantes sont tout simplement incontournables.”',
      quoteFr: '“Un vrai régal à chaque passage. Le bucket à partager et les frites croustillantes sont tout simplement incontournables.”',
    },
  ],
};

async function seed() {
  console.log(`🚀 Starting location seed for project: ${projectId} (${dataset})...`);

  // 1. Seed each restaurant location
  for (const loc of locations) {
    const cityName = loc.cityTag.split(',')[0].trim();
    const doc = {
      _id: `location-${loc.slug}`,
      _type: 'location',
      // 1. Basic Information (Tab 1)
      name: loc.name,
      slug: { _type: 'slug', current: loc.slug },
      city: cityName,
      country: 'France',
      address: loc.address,
      latitude: loc.coordinates.lat,
      longitude: loc.coordinates.lng,
      badge: loc.badge,
      badgeFr: loc.badgeFr,
      order: loc.order,
      rating: loc.rating,
      reviewCount: loc.reviewCount,
      cardImageUrl: loc.images.storefrontUrl,

      // 2. Hero Section (Tab 2)
      heroBackgroundImageUrl: loc.images.storefrontUrl,
      heroLocationLabel: loc.cityTag,
      heroSubheading: loc.heroSubheading || "CFC Tasty",
      heroSubheadingFr: loc.heroSubheadingFr || "CFC Savoureux",
      heroHeading: loc.heroHeading || loc.name,
      heroHeadingFr: loc.heroHeadingFr || loc.name,
      heroDescription: loc.heroDescription || `${loc.tagline.prefix} ${loc.tagline.highlight} ${loc.tagline.description}`.replace(/\n/g, ' '),
      heroDescriptionFr: loc.heroDescriptionFr || `${loc.taglineFr.prefix} ${loc.taglineFr.highlight} ${loc.taglineFr.description}`.replace(/\n/g, ' '),
      heroDirectionsUrl: loc.mapsUrl,

      // 3. Experience Section (Tab 3)
      interiorImages: {
        diningUrl: loc.images.diningUrl,
        barStoolsUrl: loc.images.barStoolsUrl,
        counterUrl: loc.images.counterUrl,
      },
      orderingKioskImageUrl: loc.images.kiosksUrl,
      signatureDish: {
        badge: loc.signatureDish.badge,
        badgeFr: loc.signatureDish.badgeFr,
        title: loc.signatureDish.title,
        titleFr: loc.signatureDish.titleFr,
        subtitle: loc.signatureDish.subtitle,
        subtitleFr: loc.signatureDish.subtitleFr,
        imageUrl: "/fried-chickens.png",
      },
      openingHours: {
        weekday: loc.openingHours.weekday,
        weekdayFr: loc.openingHours.weekdayFr,
        weekend: loc.openingHours.weekend,
        weekendFr: loc.openingHours.weekendFr,
        sunday: loc.openingHours.sunday,
        sundayFr: loc.openingHours.sundayFr,
      },

      // 4. Virtual Tour Section (Tab 4)
      virtualTourBackgroundImageUrl: "/cfc_ambience.jpg",
      virtualTourHeading: loc.tourTitle || "Step Inside The Crunch",
      virtualTourHeadingFr: loc.tourTitleFr || "Plongez dans le croustillant",
      virtualTourButtonText: loc.tourSubtitle || "Take A Virtual Tour",
      virtualTourButtonTextFr: loc.tourSubtitleFr || "Faites une visite virtuelle",
      virtualTourUrl: `https://my.matterport.com/show/?m=sample-${loc.slug}`,

      // 5. Customer Reviews (Tab 5)
      reviews: loc.reviews,

      // Backward compatibility objects
      cityTag: loc.cityTag,
      coordinates: loc.coordinates,
      mapCoords: loc.mapCoords,
      tagline: loc.tagline,
      phone: loc.phone,
      mapsUrl: loc.mapsUrl,
      images: loc.images,
      tourTitle: loc.tourTitle,
      tourSubtitle: loc.tourSubtitle,
      features: loc.features,
      stats: loc.stats,
    };

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        // Clean up any stale draft so Sanity Studio immediately shows the published translations
        await client.delete(`drafts.${doc._id}`).catch(() => {});
        const res = await client.createOrReplace(doc);
        console.log(`✅ Uploaded / Replaced location: "${res.name}" (ID: ${res._id}, Badge FR: "${res.badgeFr}")`);
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

  // 2. Seed the separate Location Reviews section
  try {
    const res = await client.createOrReplace(locationReviewsDoc);
    console.log(`✅ Uploaded separate Location Reviews document: ID "${res._id}" (Title FR: "${res.titleFr}", Count: ${res.overallReviewCount})`);
  } catch (err) {
    console.error('❌ Failed to upload location reviews section:', err.message);
  }

  console.log('\n🎉 Finished seeding locations & separate reviews section with French translations to Sanity!');
}

seed().catch(console.error);
