export interface LocationData {
  slug: string;
  name: string;
  cityTag: string;
  mapCoords: {
    top: string;
    left: string;
  };
  badge?: string;
  tagline: {
    prefix: string;
    highlight: string;
    description: string;
  };
  address: string;
  phone: string;
  mapsUrl: string;
  images: {
    storefront: string;
    kiosks: string;
    dining: string;
    barStools: string;
    counter: string;
    virtualTour: string;
  };
  signatureDish: {
    title: string;
    badge: string;
    subtitle: string;
  };
  openingHours: {
    weekday: string;
    weekend: string;
    sunday: string;
  };
  tourTitle: string;
  tourSubtitle: string;
  features: string[];
  stats?: {
    established: string;
    capacity: string;
    averageWait: string;
  };
}

export const locationsData: LocationData[] = [
  {
    slug: "bordeaux-centre",
    name: "Bordeaux Centre",
    cityTag: "Bordeaux, France",
    badge: "Flagship",
    mapCoords: {
      top: "33%",
      left: "48.2%",
    },
    tagline: {
      prefix: "Bustling & Bold.",
      highlight: "Our Original.",
      description: "Right In The Heart Of The City. Where It All Started In 2011, And Where The Lines Still Form At Lunch.",
    },
    address: "14 Rue Sainte-Catherine, 33000 Bordeaux",
    phone: "+33 5 56 00 12 34",
    mapsUrl: "https://maps.google.com/?q=14+Rue+Sainte-Catherine+Bordeaux",
    images: {
      storefront: "/locations/bordeaux_front.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
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
    tourSubtitle: "Take A Virtual Tour ↗",
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
    mapCoords: {
      top: "35.5%",
      left: "46.2%",
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
      storefront: "/locations/bordeaux_front.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
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
    tourSubtitle: "Take A Virtual Tour ↗",
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
    mapCoords: {
      top: "32%",
      left: "50.2%",
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
      storefront: "/locations/bordeaux_front.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
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
    tourSubtitle: "Take A Virtual Tour ↗",
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
    mapCoords: {
      top: "37.5%",
      left: "48.6%",
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
      storefront: "/locations/bordeaux_front.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
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
    tourSubtitle: "Take A Virtual Tour ↗",
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
    mapCoords: {
      top: "38.5%",
      left: "46.8%",
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
      storefront: "/locations/bordeaux_front.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
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
    tourSubtitle: "Take A Virtual Tour ↗",
    features: ["Kids Play Area", "Free Parking", "Large Booths", "Disabled Access", "Takeaway"],
    stats: {
      established: "2023",
      capacity: "140 Seats",
      averageWait: "4 Mins",
    },
  },
];

export function getLocationBySlug(slug: string): LocationData | undefined {
  return locationsData.find((loc) => loc.slug === slug);
}

export function getAllLocationSlugs(): string[] {
  return locationsData.map((loc) => loc.slug);
}
