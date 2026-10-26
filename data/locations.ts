/**
 * ============================================================================
 * CFC LOCATIONS DATA MODEL & STORE
 * ============================================================================
 * Structured to directly mirror the Sanity CMS schema hierarchy:
 * 
 * Restaurant Location
 *   │
 *   ├── Basic Information
 *   │   ├── Restaurant Name (name)
 *   │   ├── Slug (slug)
 *   │   ├── City (city)
 *   │   ├── Country (country)
 *   │   ├── Address (address)
 *   │   ├── Latitude (latitude)
 *   │   └── Longitude (longitude)
 *   │
 *   ├── Hero Section
 *   │   ├── Background Image (backgroundImage)
 *   │   ├── Location Label (locationLabel)
 *   │   ├── Heading (heading)
 *   │   ├── Description (description)
 *   │   └── Directions URL (directionsUrl)
 *   │
 *   ├── Experience Section
 *   │   ├── Restaurant Interior Images (interiorImages)
 *   │   ├── Ordering Kiosk Image (orderingKioskImage)
 *   │   ├── Signature Dish (signatureDish)
 *   │   └── Opening Hours (openingHours)
 *   │
 *   └── Virtual Tour Section
 *       ├── Background Image (backgroundImage)
 *       ├── Heading (heading)
 *       ├── Button Text (buttonText)
 *       └── Virtual Tour URL (virtualTourUrl)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. SECTION INTERFACES (Mirrors CMS Schema)
// ----------------------------------------------------------------------------

/** Section 2: Hero Section */
export interface LocationHero {
  backgroundImage: string;
  locationLabel: string;
  heading: string;
  description: string;
  directionsUrl: string;
}

/** Section 3: Experience Section */
export interface LocationInteriorImages {
  dining: string;
  barStools: string;
  counter: string;
}

export interface LocationSignatureDish {
  badge: string;
  title: string;
  subtitle: string;
  image?: string;
}

export interface LocationOpeningHours {
  weekday: string;
  weekend: string;
  sunday: string;
}

export interface LocationExperience {
  interiorImages: LocationInteriorImages;
  orderingKioskImage: string;
  signatureDish: LocationSignatureDish;
  openingHours: LocationOpeningHours;
}

/** Section 4: Virtual Tour Section */
export interface LocationVirtualTourSection {
  backgroundImage: string;
  heading: string;
  buttonText: string;
  virtualTourUrl: string;
}

// ----------------------------------------------------------------------------
// Legacy & Globe Helpers (for 3D Globe, Flat Map & backward compatibility)
// ----------------------------------------------------------------------------
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationMapCoords {
  top: string;
  left: string;
}

export interface LocationTagline {
  prefix: string;
  highlight: string;
  description: string;
}

export interface LocationImages {
  storefront: string;
  kiosks: string;
  dining: string;
  barStools: string;
  counter: string;
  virtualTour: string;
}

export interface LocationStats {
  established: string;
  capacity: string;
  averageWait: string;
}

// ----------------------------------------------------------------------------
// Complete Restaurant Location Model
// ----------------------------------------------------------------------------
export interface LocationData {
  // ─── 1. Basic Information ──────────────────────────────────────────────────
  name: string;
  slug: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  badge?: string;
  order?: number;

  // ─── 2. Hero Section ───────────────────────────────────────────────────────
  hero: LocationHero;

  // ─── 3. Experience Section ─────────────────────────────────────────────────
  experience: LocationExperience;

  // ─── 4. Virtual Tour Section ───────────────────────────────────────────────
  virtualTour: LocationVirtualTourSection;

  // ─── Backward-Compatibility Aliases (keeps existing UI / Globe components functional)
  cityTag: string;
  coordinates: LocationCoordinates;
  mapCoords: LocationMapCoords;
  tagline: LocationTagline;
  phone: string;
  mapsUrl: string;
  openingHours: LocationOpeningHours;
  signatureDish: LocationSignatureDish;
  tourTitle: string;
  tourSubtitle: string;
  images: LocationImages;
  features: string[];
  stats?: LocationStats;
}

// ----------------------------------------------------------------------------
// Static Locations Dataset (Fallback & Default Data)
// ----------------------------------------------------------------------------

export const locationsData: LocationData[] = [
  // ==========================================================================
  // LOCATION 1: BORDEAUX CENTRE (FLAGSHIP)
  // ==========================================================================
  {
    // 1. Basic Information
    name: "Bordeaux Centre",
    slug: "bordeaux-centre",
    city: "Bordeaux",
    country: "France",
    address: "14 Rue Sainte-Catherine, 33000 Bordeaux",
    latitude: 44.8416106,
    longitude: -0.5810938,
    badge: "Flagship",
    order: 1,

    // 2. Hero Section
    hero: {
      backgroundImage: "/location_details-hero.jpg",
      locationLabel: "Bordeaux, France",
      heading: "Bordeaux Centre",
      description: "Right In The Heart Of The City. Where It All Started In 2011, And Where The Lines Still Form At Lunch.",
      directionsUrl: "https://maps.google.com/?q=14+Rue+Sainte-Catherine+Bordeaux",
    },

    // 3. Experience Section
    experience: {
      interiorImages: {
        dining: "/locations/dining.jpg",
        barStools: "/locations/bar_stools.jpg",
        counter: "/locations/counter.jpg",
      },
      orderingKioskImage: "/locations/kiosks.jpg",
      signatureDish: {
        badge: "Signature Dish",
        title: "The Original Tender Box.",
        subtitle: "The Recipe That Started The Obsession",
        image: "/fried-chickens.png",
      },
      openingHours: {
        weekday: "Mon–Thu 11:00–23:00",
        weekend: "Fri–Sat 11:00–01:00",
        sunday: "Sun 12:00–22:00",
      },
    },

    // 4. Virtual Tour Section
    virtualTour: {
      backgroundImage: "/cfc_ambience.jpg",
      heading: "Step Inside The Crunch",
      buttonText: "Take A Virtual Tour",
      virtualTourUrl: "https://my.matterport.com/show/?m=sample-bordeaux",
    },

    // Backward-compatibility aliases
    cityTag: "Bordeaux, France",
    coordinates: { lat: 44.8416106, lng: -0.5810938 },
    mapCoords: { top: "14%", left: "48.2%" },
    tagline: {
      prefix: "Bustling & Bold.",
      highlight: "Our Original.",
      description: "Right In The Heart Of The City. \nWhere It All Started In 2011, And Where The Lines Still Form At Lunch.",
    },
    phone: "+33 5 56 00 12 34",
    mapsUrl: "https://maps.google.com/?q=14+Rue+Sainte-Catherine+Bordeaux",
    openingHours: {
      weekday: "Mon–Thu 11:00–23:00",
      weekend: "Fri–Sat 11:00–01:00",
      sunday: "Sun 12:00–22:00",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "The Original Tender Box.",
      subtitle: "The Recipe That Started The Obsession",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    images: {
      storefront: "/location_details-hero.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
    },
    features: ["Digital Kiosks", "Dine-In", "Takeaway", "Late Night", "WiFi"],
    stats: {
      established: "2011",
      capacity: "85 Seats",
      averageWait: "4 Mins",
    },
  },

  // ==========================================================================
  // LOCATION 2: MÉRIGNAC (AIRPORT HUB)
  // ==========================================================================
  {
    // 1. Basic Information
    name: "Mérignac",
    slug: "merignac",
    city: "Mérignac",
    country: "France",
    address: "55 Avenue John Fitzgerald Kennedy, 33700 Mérignac",
    latitude: 51.5072,
    longitude: -0.1276,
    badge: "Airport Hub",
    order: 2,

    // 2. Hero Section
    hero: {
      backgroundImage: "/location_details-hero.jpg",
      locationLabel: "Mérignac, France",
      heading: "Mérignac",
      description: "Moments From The Terminal. Quick Service Counter And Takeaway Station For Travelers In Need Of Real Crunch.",
      directionsUrl: "https://maps.google.com/?q=55+Avenue+John+Fitzgerald+Kennedy+Merignac",
    },

    // 3. Experience Section
    experience: {
      interiorImages: {
        dining: "/locations/dining.jpg",
        barStools: "/locations/bar_stools.jpg",
        counter: "/locations/counter.jpg",
      },
      orderingKioskImage: "/locations/kiosks.jpg",
      signatureDish: {
        badge: "Signature Dish",
        title: "Crispy Drumstick Trio.",
        subtitle: "Triple-Dipped In Bordeaux Herb Batter",
        image: "/fried-chickens.png",
      },
      openingHours: {
        weekday: "Mon–Thu 10:30–23:30",
        weekend: "Fri–Sat 10:30–00:30",
        sunday: "Sun 11:00–22:30",
      },
    },

    // 4. Virtual Tour Section
    virtualTour: {
      backgroundImage: "/cfc_ambience.jpg",
      heading: "Step Inside The Crunch",
      buttonText: "Take A Virtual Tour",
      virtualTourUrl: "https://my.matterport.com/show/?m=sample-merignac",
    },

    // Backward-compatibility aliases
    cityTag: "Mérignac, France",
    coordinates: { lat: 51.5072, lng: -0.1276 },
    mapCoords: { top: "15%", left: "46.2%" },
    tagline: {
      prefix: "Fast & Focused.",
      highlight: "Airport Hub.",
      description: "Moments From The Terminal. Quick Service Counter And Takeaway Station For Travelers In Need Of Real Crunch.",
    },
    phone: "+33 5 56 00 56 78",
    mapsUrl: "https://maps.google.com/?q=55+Avenue+John+Fitzgerald+Kennedy+Merignac",
    openingHours: {
      weekday: "Mon–Thu 10:30–23:30",
      weekend: "Fri–Sat 10:30–00:30",
      sunday: "Sun 11:00–22:30",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "Crispy Drumstick Trio.",
      subtitle: "Triple-Dipped In Bordeaux Herb Batter",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    images: {
      storefront: "/location_details-hero.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
    },
    features: ["Express Counter", "Flight Tracker Screen", "Drive-Thru", "Mobile Ordering"],
    stats: {
      established: "2016",
      capacity: "60 Seats",
      averageWait: "3 Mins",
    },
  },

  // ==========================================================================
  // LOCATION 3: BORDEAUX BASTIDE (RIVERSIDE)
  // ==========================================================================
  {
    // 1. Basic Information
    name: "Bordeaux Bastide",
    slug: "bordeaux-bastide",
    city: "Bordeaux",
    country: "France",
    address: "28 Avenue Thiers, 33100 Bordeaux",
    latitude: 52.5200,
    longitude: 13.4050,
    badge: "Riverside",
    order: 3,

    // 2. Hero Section
    hero: {
      backgroundImage: "/location_details-hero.jpg",
      locationLabel: "Bastide, Bordeaux",
      heading: "Bordeaux Bastide",
      description: "Overlooking The Garonne River. Sunset Views With Serious Crunch, Craft Sauces, And A Relaxed Terrace.",
      directionsUrl: "https://maps.google.com/?q=28+Avenue+Thiers+Bordeaux",
    },

    // 3. Experience Section
    experience: {
      interiorImages: {
        dining: "/locations/dining.jpg",
        barStools: "/locations/bar_stools.jpg",
        counter: "/locations/counter.jpg",
      },
      orderingKioskImage: "/locations/kiosks.jpg",
      signatureDish: {
        badge: "Signature Dish",
        title: "Hot Honey Butter Sandwich.",
        subtitle: "Smothered In Signature Glaze On Toasted Brioche",
        image: "/fried-chickens.png",
      },
      openingHours: {
        weekday: "Mon–Thu 11:30–23:00",
        weekend: "Fri–Sat 11:30–00:30",
        sunday: "Sun 12:00–22:30",
      },
    },

    // 4. Virtual Tour Section
    virtualTour: {
      backgroundImage: "/cfc_ambience.jpg",
      heading: "Step Inside The Crunch",
      buttonText: "Take A Virtual Tour",
      virtualTourUrl: "https://my.matterport.com/show/?m=sample-bastide",
    },

    // Backward-compatibility aliases
    cityTag: "Bastide, Bordeaux",
    coordinates: { lat: 52.5200, lng: 13.4050 },
    mapCoords: { top: "18%", left: "46.2%" },
    tagline: {
      prefix: "Riverside Chill.",
      highlight: "Right Bank Vibe.",
      description: "Overlooking The Garonne River. Sunset Views With Serious Crunch, Craft Sauces, And A Relaxed Terrace.",
    },
    phone: "+33 5 56 00 90 12",
    mapsUrl: "https://maps.google.com/?q=28+Avenue+Thiers+Bordeaux",
    openingHours: {
      weekday: "Mon–Thu 11:30–23:00",
      weekend: "Fri–Sat 11:30–00:30",
      sunday: "Sun 12:00–22:30",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "Hot Honey Butter Sandwich.",
      subtitle: "Smothered In Signature Glaze On Toasted Brioche",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    images: {
      storefront: "/location_details-hero.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
    },
    features: ["Riverside Terrace", "Outdoor Seating", "Cocktail Bar", "Late Night", "Pet Friendly"],
    stats: {
      established: "2019",
      capacity: "110 Seats",
      averageWait: "5 Mins",
    },
  },

  // ==========================================================================
  // LOCATION 4: TALENCE (UNIVERSITY)
  // ==========================================================================
  {
    // 1. Basic Information
    name: "Talence",
    slug: "talence",
    city: "Talence",
    country: "France",
    address: "120 Cours Gambetta, 33400 Talence",
    latitude: 51.9028,
    longitude: 12.4964,
    badge: "University",
    order: 4,

    // 2. Hero Section
    hero: {
      backgroundImage: "/location_details-hero.jpg",
      locationLabel: "Talence, Bordeaux",
      heading: "Talence",
      description: "Steps From The University. Packed With Student Deals, High-Top Charging Bars, And Non-Stop Crispy Vibes.",
      directionsUrl: "https://maps.google.com/?q=120+Cours+Gambetta+Talence",
    },

    // 3. Experience Section
    experience: {
      interiorImages: {
        dining: "/locations/dining.jpg",
        barStools: "/locations/bar_stools.jpg",
        counter: "/locations/counter.jpg",
      },
      orderingKioskImage: "/locations/kiosks.jpg",
      signatureDish: {
        badge: "Signature Dish",
        title: "The Quad Stack Burger.",
        subtitle: "Four Crispy Fillets With Double Pepper Jack",
        image: "/fried-chickens.png",
      },
      openingHours: {
        weekday: "Mon–Thu 11:00–23:00",
        weekend: "Fri–Sat 11:00–02:00",
        sunday: "Sun 12:00–23:00",
      },
    },

    // 4. Virtual Tour Section
    virtualTour: {
      backgroundImage: "/cfc_ambience.jpg",
      heading: "Step Inside The Crunch",
      buttonText: "Take A Virtual Tour",
      virtualTourUrl: "https://my.matterport.com/show/?m=sample-talence",
    },

    // Backward-compatibility aliases
    cityTag: "Talence, Bordeaux",
    coordinates: { lat: 51.9028, lng: 12.4964 },
    mapCoords: { top: "10%", left: "46.2%" },
    tagline: {
      prefix: "Campus Energy.",
      highlight: "Student Hub.",
      description: "Steps From The University. Packed With Student Deals, High-Top Charging Bars, And Non-Stop Crispy Vibes.",
    },
    phone: "+33 5 56 00 34 56",
    mapsUrl: "https://maps.google.com/?q=120+Cours+Gambetta+Talence",
    openingHours: {
      weekday: "Mon–Thu 11:00–23:00",
      weekend: "Fri–Sat 11:00–02:00",
      sunday: "Sun 12:00–23:00",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "The Quad Stack Burger.",
      subtitle: "Four Crispy Fillets With Double Pepper Jack",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    images: {
      storefront: "/location_details-hero.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
    },
    features: ["Charging Stations", "Study Friendly", "Student Discount", "Fast WiFi", "Group Tables"],
    stats: {
      established: "2021",
      capacity: "95 Seats",
      averageWait: "4 Mins",
    },
  },

  // ==========================================================================
  // LOCATION 5: PESSAC (FAMILY HAVEN)
  // ==========================================================================
  {
    // 1. Basic Information
    name: "Pessac",
    slug: "pessac",
    city: "Pessac",
    country: "France",
    address: "42 Avenue Pasteur, 33600 Pessac",
    latitude: 40.4168,
    longitude: -3.7038,
    badge: "Family Haven",
    order: 5,

    // 2. Hero Section
    hero: {
      backgroundImage: "/location_details-hero.jpg",
      locationLabel: "Pessac, France",
      heading: "Pessac",
      description: "A Spacious Gathering Spot For Families And Friends. Easy Parking, Generous Seating, And Fresh Chicken Daily.",
      directionsUrl: "https://maps.google.com/?q=42+Avenue+Pasteur+Pessac",
    },

    // 3. Experience Section
    experience: {
      interiorImages: {
        dining: "/locations/dining.jpg",
        barStools: "/locations/bar_stools.jpg",
        counter: "/locations/counter.jpg",
      },
      orderingKioskImage: "/locations/kiosks.jpg",
      signatureDish: {
        badge: "Signature Dish",
        title: "Family Feast Sharing Platter.",
        subtitle: "30 Tenders, 4 Large Dips, Hand-Cut Fries",
        image: "/fried-chickens.png",
      },
      openingHours: {
        weekday: "Mon–Thu 11:00–22:30",
        weekend: "Fri–Sat 11:00–00:00",
        sunday: "Sun 11:30–22:00",
      },
    },

    // 4. Virtual Tour Section
    virtualTour: {
      backgroundImage: "/cfc_ambience.jpg",
      heading: "Step Inside The Crunch",
      buttonText: "Take A Virtual Tour",
      virtualTourUrl: "https://my.matterport.com/show/?m=sample-pessac",
    },

    // Backward-compatibility aliases
    cityTag: "Pessac, France",
    coordinates: { lat: 40.4168, lng: -3.7038 },
    mapCoords: { top: "20%", left: "46.8%" },
    tagline: {
      prefix: "Suburban Comfort.",
      highlight: "Family Haven.",
      description: "A Spacious Gathering Spot For Families And Friends. Easy Parking, Generous Seating, And Fresh Chicken Daily.",
    },
    phone: "+33 5 56 00 78 90",
    mapsUrl: "https://maps.google.com/?q=42+Avenue+Pasteur+Pessac",
    openingHours: {
      weekday: "Mon–Thu 11:00–22:30",
      weekend: "Fri–Sat 11:00–00:00",
      sunday: "Sun 11:30–22:00",
    },
    signatureDish: {
      badge: "Signature Dish",
      title: "Family Feast Sharing Platter.",
      subtitle: "30 Tenders, 4 Large Dips, Hand-Cut Fries",
    },
    tourTitle: "Step Inside The Crunch",
    tourSubtitle: "Take A Virtual Tour",
    images: {
      storefront: "/location_details-hero.jpg",
      kiosks: "/locations/kiosks.jpg",
      dining: "/locations/dining.jpg",
      barStools: "/locations/bar_stools.jpg",
      counter: "/locations/counter.jpg",
      virtualTour: "/locations/virtual_tour.jpg",
    },
    features: ["Kids Play Area", "Free Parking", "Large Booths", "Disabled Access", "Takeaway"],
    stats: {
      established: "2023",
      capacity: "130 Seats",
      averageWait: "4 Mins",
    },
  },
];

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------

export function getLocationBySlug(slug: string): LocationData | undefined {
  return locationsData.find((loc) => loc.slug === slug);
}
