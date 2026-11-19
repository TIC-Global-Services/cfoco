import { client } from './client';
import { isSanityConfigured } from '../env';
import { MENU_ITEMS_QUERY, MENU_CATEGORIES_QUERY } from './queries';
import fallbackMenuData from '@/public/menu_data.json';
import fallbackMenuDataFr from '@/public/menu_data_fr.json';
import type { LocalizedValue } from './localized';

export interface MenuCategory {
  id: string;
  name: LocalizedValue<string>;
  slug?: string;
  icon?: string;
  order?: number;
  description?: LocalizedValue<string>;
}

export interface MenuItem {
  id: number | string;
  _id?: string;
  title: LocalizedValue<string>;
  slug?: string;
  description: LocalizedValue<string>;
  detailedDescription?: LocalizedValue<string>;
  image: string;
  category: string;
  categoryName: LocalizedValue<string>;
  price?: string;
  badge?: LocalizedValue<string>;
  isBestSeller?: boolean;
  cardData?: {
    detailedDescription?: LocalizedValue<string>;
    includesTitle?: LocalizedValue<string>;
    includes?: Array<{ name: LocalizedValue<string>; quantity?: string; imageUrl?: string; image?: string }>;
    highlights?: Array<{ icon?: string; title: LocalizedValue<string>; subtitle?: LocalizedValue<string> }>;
    gallery?: Array<{ alt?: string; imageUrl?: string; image?: string }>;
  };
  includesTitle?: LocalizedValue<string>;
  includes?: Array<{ name: LocalizedValue<string>; quantity?: string; imageUrl?: string; image?: string }>;
  highlights?: Array<{ icon?: string; title: LocalizedValue<string>; subtitle?: LocalizedValue<string> }>;
  gallery?: Array<{ alt?: string; imageUrl?: string; image?: string }>;
}

const REVALIDATE_SECONDS =
  process.env.NODE_ENV === 'development' ? 0 : 60;

/**
 * Fetch all menu categories from Sanity CMS.
 * Always attempts to fetch live data from Sanity.
 * If Sanity is unavailable, falls back symmetrically to French or English local JSON.
 */
export async function getAllMenuCategories(lang: string = 'en'): Promise<MenuCategory[]> {
  const fallback = (lang === 'fr' ? fallbackMenuDataFr.categories : fallbackMenuData.categories) as unknown as MenuCategory[];

  if (!isSanityConfigured) {
    return fallback || [];
  }

  try {
    const categories = await client.fetch<MenuCategory[]>(
      MENU_CATEGORIES_QUERY,
      {},
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: ['menu-categories'],
        },
      }
    );

    if (!Array.isArray(categories)) {
      throw new Error('Invalid menu categories response from Sanity.');
    }

    return categories.map((category) => ({
      id: category.slug || category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      order: category.order,
      description: category.description,
    }));
  } catch (error) {
    console.error(
      `Failed to fetch menu categories from Sanity. Using ${lang} fallback data:`,
      error
    );

    return fallback || [];
  }
}

/**
 * Fetch all menu items from Sanity CMS.
 * Always attempts to fetch live data from Sanity.
 * If Sanity is unavailable, falls back symmetrically to French or English local JSON.
 */
export async function getAllMenuItems(lang: string = 'en'): Promise<MenuItem[]> {
  const fallback = (lang === 'fr' ? fallbackMenuDataFr.items : fallbackMenuData.items) as unknown as MenuItem[];

  if (!isSanityConfigured) {
    return fallback || [];
  }

  try {
    const items = await client.fetch<MenuItem[]>(
      MENU_ITEMS_QUERY,
      {},
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: ['menu-items'],
        },
      }
    );

    if (!Array.isArray(items)) {
      throw new Error('Invalid menu items response from Sanity.');
    }

    return items.map((item, index) => ({
      ...item,
      id: item._id || item.slug || index + 1,
    }));
  } catch (error) {
    console.error(
      `Failed to fetch menu items from Sanity. Using ${lang} fallback data:`,
      error
    );

    return fallback || [];
  }
}