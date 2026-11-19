import { client } from './client';
import { isSanityConfigured } from '../env';
import { LOCATIONS_QUERY, LOCATION_BY_SLUG_QUERY, LOCATION_SLUGS_QUERY, LOCATION_REVIEWS_QUERY } from './queries';
import { locationsData, LocationData } from '@/data/locations';
import { locationsDataFr, getLocationBySlugFr } from '@/data/locations_fr';
import type { LocalizedValue } from './localized';
import { getLocalized } from './localized';

export const AVATAR_GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-rose-400 to-red-500",
  "from-purple-500 to-pink-500",
];

/**
 * Fetch all locations from Sanity CMS with fallback to static locationsData.
 * Always fetches live data from Sanity.
 * If Sanity is unavailable, falls back symmetrically to French or English dataset.
 */
export async function getAllLocations(lang: string = "en"): Promise<LocationData[]> {
  const fallback = lang === "fr" ? locationsDataFr : locationsData;

  if (!isSanityConfigured) {
    return fallback;
  }

  try {
    const locations = await client.fetch<LocationData[]>(
      LOCATIONS_QUERY,
      {},
      {
        next: {
          revalidate: process.env.NODE_ENV === 'development' ? 0 : 60,
          tags: ['locations'],
        },
      }
    );

    if (Array.isArray(locations) && locations.length > 0) {
      return locations.map((loc) => ({
        ...loc,
        reviews: loc.reviews?.map((rev, i) => ({
          ...rev,
          avatarColor: rev.avatarColor || AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
        })),
      }));
    }
  } catch (error) {
    console.error(`Error fetching locations from Sanity, using ${lang} fallback:`, error);
  }

  return fallback;
}

/**
 * Fetch a single location by its slug with fallback.
 * Always fetches live data from Sanity.
 * If Sanity is unavailable, falls back symmetrically to French or English dataset.
 */
export async function getLocationBySlug(slug: string, lang: string = "en"): Promise<LocationData | undefined> {
  const fallback = lang === "fr" ? getLocationBySlugFr(slug) : locationsData.find((loc) => loc.slug === slug);

  if (!isSanityConfigured) {
    return fallback;
  }

  try {
    const location = await client.fetch<LocationData | null>(
      LOCATION_BY_SLUG_QUERY,
      { slug },
      {
        next: {
          revalidate: process.env.NODE_ENV === 'development' ? 0 : 60,
          tags: [`location-${slug}`, 'locations'],
        },
      }
    );

    if (location && location.slug) {
      return {
        ...location,
        reviews: location.reviews?.map((rev, i) => ({
          ...rev,
          avatarColor: rev.avatarColor || AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
        })),
      };
    }
  } catch (error) {
    console.error(`Error fetching location [${slug}] from Sanity, using ${lang} fallback:`, error);
  }

  return fallback;
}

/**
 * Fetch all location slugs for static generation or sitemaps.
 */
export async function getAllLocationSlugs(): Promise<string[]> {
  if (!isSanityConfigured) {
    return locationsData.map((loc) => loc.slug);
  }

  try {
    const slugs = await client.fetch<string[]>(
      LOCATION_SLUGS_QUERY,
      {},
      {
        next: {
          revalidate: process.env.NODE_ENV === 'development' ? 0 : 300,
        },
      }
    );

    if (Array.isArray(slugs) && slugs.length > 0) {
      return slugs;
    }
  } catch (error) {
    console.error('Error fetching location slugs from Sanity, using fallback:', error);
  }

  return locationsData.map((loc) => loc.slug);
}

export interface LocationReviewCard {
  id?: string;
  authorName: string;
  rating: number;
  quote: LocalizedValue<string>;
  avatarColor?: string;
}

export interface LocationReviewsSectionData {
  _id?: string;
  overallReviewCount?: string | number;
  title?: LocalizedValue<string>;
  reviews?: LocationReviewCard[];
}

/**
 * Fetch the separate Location Reviews section (overall reviews count + 6 general cards) from Sanity.
 */
export async function getLocationReviewsSection(): Promise<LocationReviewsSectionData | null> {
  if (!isSanityConfigured) {
    return null;
  }

  try {
    const data = await client.fetch<LocationReviewsSectionData | null>(
      LOCATION_REVIEWS_QUERY,
      {},
      {
        next: {
          revalidate: process.env.NODE_ENV === 'development' ? 0 : 60,
          tags: ['locationReviews', 'locations'],
        },
      }
    );

    if (data && (data.overallReviewCount || (Array.isArray(data.reviews) && data.reviews.length > 0))) {
      return data;
    }
  } catch (error) {
    console.error('Error fetching location reviews section from Sanity, using fallback:', error);
  }

  return null;
}

export interface ReviewCardItem {
  id: string;
  rating: number;
  quote: LocalizedValue<string>;
  authorName: string;
  avatarColor?: string;
}

export interface ReviewsResponseData {
  reviewCount: string | number;
  rating: number;
  heading: LocalizedValue<string>;
  reviews: ReviewCardItem[];
}

export const DEFAULT_REVIEWS: ReviewCardItem[] = [
  {
    id: "rev-1",
    rating: 5,
    quote: {
      en: "“Great meal deals to share, we had the wings & tenders box, super generous and really tasty. Fast and efficient service.”",
      fr: "“Formules intéressantes à partager, on a pris la box wings-tenders c'était pas mal du tout et généreux. Service rapide et efficace.”",
    },
    authorName: "Yousra Djeddou",
    avatarColor: "from-cyan-500 to-blue-600",
  },
  {
    id: "rev-2",
    rating: 5,
    quote: {
      en: "“A very nice, clean restaurant with fast service and a warm welcome. There's an outdoor terrace. The tacos are good and quite generous.”",
      fr: "“Un restaurant très agréable et propre, avec un service rapide et un accueil chaleureux. Belle terrasse extérieure. Les tacos sont très bons et généreux.”",
    },
    authorName: "Arm",
    avatarColor: "from-amber-400 to-orange-500",
  },
  {
    id: "rev-3",
    rating: 5,
    quote: {
      en: "“Crispy buttermilk tenders, house sauces that make all the difference. Top-notch welcome!”",
      fr: "“Des tenders croustillants marinés au babeurre, des sauces maison qui font toute la différence. Accueil au top !”",
    },
    authorName: "Camille Roussel",
    avatarColor: "from-emerald-400 to-teal-600",
  },
  {
    id: "rev-4",
    rating: 5,
    quote: {
      en: "“Beautiful place!! The tacos were delicious, the music was great, and just for the service!”",
      fr: "“Un endroit magnifique ! Les tacos étaient délicieux, la musique au top, et que dire du service !”",
    },
    authorName: "Med saleck",
    avatarColor: "from-blue-500 to-indigo-600",
  },
  {
    id: "rev-5",
    rating: 5,
    quote: {
      en: "“The staff were very pleasant and smiling, the food was excellent and served quickly, and the music created a great atmosphere. I highly recommend it.”",
      fr: "“Un personnel très agréable et souriant, une cuisine excellente servie rapidement et une musique qui met une super ambiance. Je recommande vivement.”",
    },
    authorName: "Timeo scerri",
    avatarColor: "from-rose-400 to-red-500",
  },
  {
    id: "rev-6",
    rating: 5,
    quote: {
      en: "“A real treat every single visit. The sharing bucket and crispy fries are simply must-haves.”",
      fr: "“Un vrai régal à chaque passage. Le bucket à partager et les frites croustillantes sont tout simplement incontournables.”",
    },
    authorName: "Thomas Dubois",
    avatarColor: "from-purple-500 to-pink-500",
  },
];

function formatSingleQuote(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.startsWith("“") || trimmed.startsWith('"')) {
    return trimmed;
  }
  return `“${trimmed}”`;
}

function formatQuote(text: LocalizedValue<string>): LocalizedValue<string> {
  if (typeof text === 'string') {
    return formatSingleQuote(text);
  }
  if (text && typeof text === 'object') {
    return {
      en: text.en ? formatSingleQuote(text.en) : '',
      fr: text.fr ? formatSingleQuote(text.fr) : (text.en ? formatSingleQuote(text.en) : ''),
    };
  }
  return "";
}

/**
 * Fetch unified reviews data from Sanity:
 * 1. Checks dedicated locationReviews section first
 * 2. If reviews are empty, checks restaurant location reviews
 * 3. Dynamically calculates total review count across Sanity locations if overall count isn't specified
 * 4. Falls back gracefully to curated reviews & metrics
 */
export async function getReviewsData(lang: string = "en"): Promise<ReviewsResponseData> {
  const [locations, reviewsSection] = await Promise.all([
    getAllLocations(lang),
    getLocationReviewsSection(),
  ]);

  const sumLocationReviewCounts = locations.reduce(
    (acc, loc) => acc + (typeof loc.reviewCount === 'number' ? loc.reviewCount : 0),
    0
  );

  const reviewCount =
    reviewsSection?.overallReviewCount ||
    (sumLocationReviewCounts > 0 ? sumLocationReviewCounts.toLocaleString() : "11,897");

  let reviews: ReviewCardItem[] = [];

  if (reviewsSection?.reviews && reviewsSection.reviews.length > 0) {
    reviews = reviewsSection.reviews.map((rev, i) => ({
      id: rev.id || `sanity-rev-${i}`,
      rating: rev.rating || 5,
      quote: formatQuote(rev.quote),
      authorName: rev.authorName,
      avatarColor: rev.avatarColor || AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
    }));
  } else {
    const locReviews = locations.flatMap((loc) => loc.reviews || []);
    if (locReviews.length > 0) {
      reviews = locReviews.map((rev, i) => ({
        id: rev.id || `loc-rev-${i}`,
        rating: rev.rating || 5,
        quote: formatQuote(rev.quote),
        authorName: rev.authorName,
        avatarColor: rev.avatarColor || AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
      }));
    }
  }

  if (reviews.length === 0) {
    reviews = DEFAULT_REVIEWS;
  }

  const heading: LocalizedValue<string> = reviewsSection?.title || {
    en: "Reviews Can't Be Wrong",
    fr: "Les avis ne se trompent pas",
  };

  const avgRating =
    locations.length > 0
      ? locations.reduce((sum, loc) => sum + (loc.rating || 4.8), 0) / locations.length
      : 4.8;

  return {
    reviewCount,
    rating: Number(avgRating.toFixed(1)),
    heading,
    reviews,
  };
}
