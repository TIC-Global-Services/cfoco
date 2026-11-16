import { client } from './client';
import { isSanityConfigured } from '../env';
import { LOCATIONS_QUERY, LOCATION_BY_SLUG_QUERY, LOCATION_SLUGS_QUERY, LOCATION_REVIEWS_QUERY } from './queries';
import { locationsData, LocationData } from '@/data/locations';

/**
 * Fetch all locations from Sanity CMS with fallback to static locationsData.
 */
export async function getAllLocations(): Promise<LocationData[]> {
  if (!isSanityConfigured) {
    return locationsData;
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
      return locations;
    }
  } catch (error) {
    console.error('Error fetching locations from Sanity, using fallback data:', error);
  }

  return locationsData;
}

/**
 * Fetch a single location by its slug with fallback.
 */
export async function getLocationBySlug(slug: string): Promise<LocationData | undefined> {
  if (!isSanityConfigured) {
    return locationsData.find((loc) => loc.slug === slug);
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
      return location;
    }
  } catch (error) {
    console.error(`Error fetching location [${slug}] from Sanity, using fallback:`, error);
  }

  return locationsData.find((loc) => loc.slug === slug);
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
  quote: string;
  avatarColor?: string;
}

export interface LocationReviewsSectionData {
  _id?: string;
  overallReviewCount?: string | number;
  title?: string;
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
