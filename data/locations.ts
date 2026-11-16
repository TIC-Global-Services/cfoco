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
  subheading?: string;
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
export interface LocationReview {
  id?: string;
  authorName: string;
  rating: number;
  quote: string;
  avatarColor?: string;
}

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
  cardImage?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: LocationReview[];

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
  // LOCATION 1: BORDEAUX LAC
  // ==========================================================================
  {
    // 1. Basic Information
    name: "Bordeauxlac",
    slug: "bordeauxlac",
    city: "Bordeaux",
    country: "France",
    address: "32 Rue Yves Glotin, 33300 Bordeaux, France",
    latitude: 44.8911124,
    longitude: -0.5463199,
    badge: "Bordeaux Lac",
    order: 1,
    rating: 4.7,
    reviewCount: 2183,
    cardImage: "/locations/bordeaux_front.jpg",

    reviews: [
      {
        id: "rev-lac-1",
        authorName: "Yousra Djeddou",
        rating: 5,
        quote: "“Formules interessantes à partager, on a pris la box wings-tenders cétait pas mal dutout et généreux. Service rapide et efficace.”",
        avatarColor: "from-cyan-500 to-blue-600",
      },
      {
        id: "rev-lac-2",
        authorName: "Arm",
        rating: 5,
        quote: "“A very nice, clean restaurant with fast service and a warm welcome. There's an outdoor terrace. The tacos are good and quite generous”",
        avatarColor: "from-amber-400 to-orange-500",
      },
      {
        id: "rev-lac-3",
        authorName: "Med saleck",
        rating: 5,
        quote: "“Beautiful place!! The tacos were delicious, the music was great, and just for the service”",
        avatarColor: "from-emerald-400 to-teal-600",
      },
      {
        id: "rev-lac-4",
        authorName: "Timeo scerri",
        rating: 5,
        quote: "“The staff were very pleasant and smiling, the food was excellent and served quickly, and the music created a great atmosphere. I highly recommend it”",
        avatarColor: "from-rose-400 to-red-500",
      },
    ],

    // 2. Hero Section
    hero: {
      backgroundImage: "/location_details-hero.jpg",
      locationLabel: "Bordeaux Lac, France",
      subheading: "CFC Tasty",
      heading: "Bordeauxlac",
      description: "Located near the lake in Bordeaux. Crispy fried chicken, generous portions, and fast, friendly service for crunch lovers.",
      directionsUrl: "https://www.google.com/maps/place/32+Rue+Yves+Glotin,+33300+Bordeaux,+France/@44.8911124,-0.5463199,17z/data=!3m1!4b1!4m6!3m5!1s0xd55291f32352769:0x5b86a8c7c92e5f40!8m2!3d44.8911124!4d-0.5463199!16s%2Fg%2F11cpfnkhm1?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
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
    cityTag: "Bordeaux Lac, France",
    coordinates: { lat: 44.8911124, lng: -0.5463199 },
    mapCoords: { top: "12%", left: "47%" },
    tagline: {
      prefix: "Lakeside Crunch.",
      highlight: "Bordeaux Lac.",
      description: "Located near the lake in Bordeaux. Crispy fried chicken, generous portions, and fast, friendly service.",
    },
    phone: "+33 5 56 00 12 34",
    mapsUrl: "https://www.google.com/maps/place/32+Rue+Yves+Glotin,+33300+Bordeaux,+France/@44.8911124,-0.5463199,17z/data=!3m1!4b1!4m6!3m5!1s0xd55291f32352769:0x5b86a8c7c92e5f40!8m2!3d44.8911124!4d-0.5463199!16s%2Fg%2F11cpfnkhm1?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
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
      established: "2018",
      capacity: "85 Seats",
      averageWait: "4 Mins",
    },
  },

  // ==========================================================================
  // LOCATION 2: BORDEAUX (CENTRE / COURS DE LA MARNE)
  // ==========================================================================
  {
    // 1. Basic Information
    name: "Bordeaux",
    slug: "bordeaux",
    city: "Bordeaux",
    country: "France",
    address: "69 Cours de la Marne, 33800 Bordeaux, France",
    latitude: 44.8298661,
    longitude: -0.568634,
    badge: "Flagship",
    order: 2,
    rating: 4.8,
    reviewCount: 2183,
    cardImage: "/locations/bordeaux_front.jpg",

    reviews: [
      {
        id: "rev-bordeaux-1",
        authorName: "Yousra Djeddou",
        rating: 5,
        quote: "“Formules interessantes à partager, on a pris la box wings-tenders cétait pas mal dutout et généreux. Service rapide et efficace.”",
        avatarColor: "from-cyan-500 to-blue-600",
      },
      {
        id: "rev-bordeaux-2",
        authorName: "Arm",
        rating: 5,
        quote: "“A very nice, clean restaurant with fast service and a warm welcome. There's an outdoor terrace. The tacos are good and quite generous”",
        avatarColor: "from-amber-400 to-orange-500",
      },
      {
        id: "rev-bordeaux-3",
        authorName: "Med saleck",
        rating: 5,
        quote: "“Beautiful place!! The tacos were delicious, the music was great, and just for the service”",
        avatarColor: "from-emerald-400 to-teal-600",
      },
      {
        id: "rev-bordeaux-4",
        authorName: "Timeo scerri",
        rating: 5,
        quote: "“The staff were very pleasant and smiling, the food was excellent and served quickly, and the music created a great atmosphere. I highly recommend it”",
        avatarColor: "from-rose-400 to-red-500",
      },
    ],

    // 2. Hero Section
    hero: {
      backgroundImage: "/location_details-hero.jpg",
      locationLabel: "Bordeaux Centre, France",
      subheading: "CFC Tasty",
      heading: "Bordeaux",
      description: "Right In The Heart Of Bordeaux. Where It All Started In 2011, And Where The Lines Still Form For The Signature Shatter-Crunch.",
      directionsUrl: "https://www.google.com/maps?q=Cfc,+69+Cr+de+la+Marne,+33800+Bordeaux,+France&ftid=0xd5527b60605d33d:0x14b9f742a04055b7&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,100821555,47071704,94218641,94282134,100835699,94286869,100820247,100822504&g_ep=CAISEjI2LjM5LjAuOTg0OTU2MzcwMBgAINeCAypnLDk0Mjk3Njk5LDk0MjMxMTg4LDk0MjgwNTY4LDEwMDgyMTU1NSw0NzA3MTcwNCw5NDIxODY0MSw5NDI4MjEzNCwxMDA4MzU2OTksOTQyODY4NjksMTAwODIwMjQ3LDEwMDgyMjUwNEICSU4%3D&skid=52b789de-1a58-4ab0-9da0-d3611203d4b1&g_st=iw",
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
    cityTag: "Bordeaux Centre, France",
    coordinates: { lat: 44.8298661, lng: -0.568634 },
    mapCoords: { top: "14%", left: "48.2%" },
    tagline: {
      prefix: "Bustling & Bold.",
      highlight: "Our Original.",
      description: "Right In The Heart Of Bordeaux. Where It All Started In 2011, And Where The Lines Still Form At Lunch.",
    },
    phone: "+33 5 56 00 12 34",
    mapsUrl: "https://www.google.com/maps?q=Cfc,+69+Cr+de+la+Marne,+33800+Bordeaux,+France&ftid=0xd5527b60605d33d:0x14b9f742a04055b7&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,100821555,47071704,94218641,94282134,100835699,94286869,100820247,100822504&g_ep=CAISEjI2LjM5LjAuOTg0OTU2MzcwMBgAINeCAypnLDk0Mjk3Njk5LDk0MjMxMTg4LDk0MjgwNTY4LDEwMDgyMTU1NSw0NzA3MTcwNCw5NDIxODY0MSw5NDI4MjEzNCwxMDA4MzU2OTksOTQyODY4NjksMTAwODIwMjQ3LDEwMDgyMjUwNEICSU4%3D&skid=52b789de-1a58-4ab0-9da0-d3611203d4b1&g_st=iw",
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
  // LOCATION 3: BOUSCAT (LE BOUSCAT)
  // ==========================================================================
  {
    // 1. Basic Information
    name: "Bouscat",
    slug: "bouscat",
    city: "Le Bouscat",
    country: "France",
    address: "13bis Boulevard Pierre 1er, 33110 Le Bouscat, France",
    latitude: 44.854328,
    longitude: -0.593309,
    badge: "Gourmet Hub",
    order: 3,
    rating: 4.6,
    reviewCount: 2289,
    cardImage: "/locations/bordeaux_front.jpg",

    reviews: [
      {
        id: "rev-bouscat-1",
        authorName: "Yousra Djeddou",
        rating: 5,
        quote: "“Formules interessantes à partager, on a pris la box wings-tenders cétait pas mal dutout et généreux. Service rapide et efficace.”",
        avatarColor: "from-cyan-500 to-blue-600",
      },
      {
        id: "rev-bouscat-2",
        authorName: "Arm",
        rating: 5,
        quote: "“A very nice, clean restaurant with fast service and a warm welcome. There's an outdoor terrace. The tacos are good and quite generous”",
        avatarColor: "from-amber-400 to-orange-500",
      },
      {
        id: "rev-bouscat-3",
        authorName: "Med saleck",
        rating: 5,
        quote: "“Beautiful place!! The tacos were delicious, the music was great, and just for the service”",
        avatarColor: "from-emerald-400 to-teal-600",
      },
      {
        id: "rev-bouscat-4",
        authorName: "Timeo scerri",
        rating: 5,
        quote: "“The staff were very pleasant and smiling, the food was excellent and served quickly, and the music created a great atmosphere. I highly recommend it”",
        avatarColor: "from-rose-400 to-red-500",
      },
    ],

    // 2. Hero Section
    hero: {
      backgroundImage: "/location_details-hero.jpg",
      locationLabel: "Le Bouscat, France",
      subheading: "CFC Tasty",
      heading: "Bouscat",
      description: "Nestled In Le Bouscat. Modern Aesthetic, Warm Amber Glow, And Uncompromising Crunch Fresh From The Fryers.",
      directionsUrl: "https://www.google.com/maps?q=CFC,+13bis+Bd+Pierre+1er,+33110+Le+Bouscat,+France&ftid=0xd55295f654ce2cb:0x64afcf131183132b&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,100821555,47071704,94218641,94282134,100835699,94286869,100820247,100822504&g_ep=CAISEjI2LjM5LjAuOTg0OTU2MzcwMBgAINeCAypnLDk0Mjk3Njk5LDk0MjMxMTg4LDk0MjgwNTY4LDEwMDgyMTU1NSw0NzA3MTcwNCw5NDIxODY0MSw5NDI4MjEzNCwxMDA4MzU2OTksOTQyODY4NjksMTAwODIwMjQ3LDEwMDgyMjUwNEICSU4%3D&skid=ae67aa00-28ab-486e-a736-046720f73c95&g_st=iw",
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
      virtualTourUrl: "https://my.matterport.com/show/?m=sample-bouscat",
    },

    // Backward-compatibility aliases
    cityTag: "Le Bouscat, France",
    coordinates: { lat: 44.854328, lng: -0.593309 },
    mapCoords: { top: "18%", left: "46.2%" },
    tagline: {
      prefix: "Gourmet & Chill.",
      highlight: "Avenue Vibe.",
      description: "Nestled In Le Bouscat. Modern Aesthetic, Warm Amber Glow, And Uncompromising Crunch Fresh From The Fryers.",
    },
    phone: "+33 5 56 00 90 12",
    mapsUrl: "https://www.google.com/maps?q=CFC,+13bis+Bd+Pierre+1er,+33110+Le+Bouscat,+France&ftid=0xd55295f654ce2cb:0x64afcf131183132b&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,100821555,47071704,94218641,94282134,100835699,94286869,100820247,100822504&g_ep=CAISEjI2LjM5LjAuOTg0OTU2MzcwMBgAINeCAypnLDk0Mjk3Njk5LDk0MjMxMTg4LDk0MjgwNTY4LDEwMDgyMTU1NSw0NzA3MTcwNCw5NDIxODY0MSw5NDI4MjEzNCwxMDA4MzU2OTksOTQyODY4NjksMTAwODIwMjQ3LDEwMDgyMjUwNEICSU4%3D&skid=ae67aa00-28ab-486e-a736-046720f73c95&g_st=iw",
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
    features: ["Outdoor Terrace", "Dine-In", "Express Kiosks", "Late Night", "WiFi"],
    stats: {
      established: "2019",
      capacity: "90 Seats",
      averageWait: "4 Mins",
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
    address: "120 Cours Gambetta, 33400 Talence, France",
    latitude: 44.8010635,
    longitude: -0.5952759,
    badge: "University",
    order: 4,
    rating: 5,
    reviewCount: 5242,
    cardImage: "/locations/bordeaux_front.jpg",

    reviews: [
      {
        id: "rev-talence-1",
        authorName: "Yousra Djeddou",
        rating: 5,
        quote: "“Formules interessantes à partager, on a pris la box wings-tenders cétait pas mal dutout et généreux. Service rapide et efficace.”",
        avatarColor: "from-cyan-400 to-blue-600",
      },
      {
        id: "rev-talence-2",
        authorName: "Arm",
        rating: 5,
        quote: "“A very nice, clean restaurant with fast service and a warm welcome. There's an outdoor terrace. The tacos are good and quite generous”",
        avatarColor: "from-amber-400 to-orange-500",
      },
      {
        id: "rev-talence-3",
        authorName: "Med saleck",
        rating: 5,
        quote: "“Beautiful place!! The tacos were delicious, the music was great, and just for the service”",
        avatarColor: "from-emerald-400 to-teal-600",
      },
      {
        id: "rev-talence-4",
        authorName: "Timeo scerri",
        rating: 5,
        quote: "“The staff were very pleasant and smiling, the food was excellent and served quickly, and the music created a great atmosphere. I highly recommend it”",
        avatarColor: "from-rose-400 to-red-500",
      },
    ],

    // 2. Hero Section
    hero: {
      backgroundImage: "/location_details-hero.jpg",
      locationLabel: "Talence, France",
      subheading: "CFC Tasty",
      heading: "Talence",
      description: "Steps From The University Campus. Packed With Student Deals, High-Top Charging Bars, And Non-Stop Crispy Vibes.",
      directionsUrl: "https://www.google.com/maps/place/CFC+Talence/@44.801064,-0.595276,17z/data=!4m6!3m5!1s0xd5527fb67c01f6f:0xa701a80dc754c8df!8m2!3d44.8010635!4d-0.5952759!16s%2Fg%2F11j8lz4s7x?hl=fr&entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
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
    cityTag: "Talence, France",
    coordinates: { lat: 44.8010635, lng: -0.5952759 },
    mapCoords: { top: "10%", left: "46.2%" },
    tagline: {
      prefix: "Campus Energy.",
      highlight: "Student Hub.",
      description: "Steps From The University Campus. Packed With Student Deals, High-Top Charging Bars, And Non-Stop Crispy Vibes.",
    },
    phone: "+33 5 56 00 34 56",
    mapsUrl: "https://www.google.com/maps/place/CFC+Talence/@44.801064,-0.595276,17z/data=!4m6!3m5!1s0xd5527fb67c01f6f:0xa701a80dc754c8df!8m2!3d44.8010635!4d-0.5952759!16s%2Fg%2F11j8lz4s7x?hl=fr&entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D",
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
];

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------

export function getLocationBySlug(slug: string): LocationData | undefined {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return locationsData.find(
    (loc) =>
      loc.slug === slug ||
      loc.slug.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
      loc.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
      // legacy slug backwards compatibility
      (slug === "cours-de-la-marne" && loc.slug === "bordeaux") ||
      (slug === "lormont" && loc.slug === "bordeauxlac") ||
      (slug === "le-bouscat" && loc.slug === "bouscat")
  );
}
