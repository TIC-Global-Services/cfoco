import { client } from './client';
import { isSanityConfigured } from '../env';
import { MENU_ITEMS_QUERY, MENU_CATEGORIES_QUERY } from './queries';
import fallbackMenuData from '@/public/menu_data.json';

export interface MenuCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  order?: number;
  description?: string;
}

export interface MenuItem {
  id: number | string;
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  detailedDescription?: string;
  image: string;
  category: string;
  categoryName: string;
  price?: string;
  badge?: string;
  isBestSeller?: boolean;
  cardData?: {
    detailedDescription?: string;
    includesTitle?: string;
    includes?: Array<{ name: string; quantity?: string; imageUrl?: string; image?: string }>;
    highlights?: Array<{ icon?: string; title: string; subtitle?: string }>;
    gallery?: Array<{ alt?: string; imageUrl?: string; image?: string }>;
  };
  includesTitle?: string;
  includes?: Array<{ name: string; quantity?: string; imageUrl?: string; image?: string }>;
  highlights?: Array<{ icon?: string; title: string; subtitle?: string }>;
  gallery?: Array<{ alt?: string; imageUrl?: string; image?: string }>;
}

const REVALIDATE_SECONDS =
  process.env.NODE_ENV === 'development' ? 0 : 60;

/**
 * Fetch all menu categories from Sanity CMS.
 * Falls back to local JSON if Sanity is unavailable.
 */
export async function getAllMenuCategories(): Promise<MenuCategory[]> {
  if (!isSanityConfigured) {
    return (fallbackMenuData.categories as MenuCategory[]) || [];
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
      'Failed to fetch menu categories from Sanity. Using fallback data:',
      error
    );

    return (fallbackMenuData.categories as MenuCategory[]) || [];
  }
}

/**
 * Fetch all menu items from Sanity CMS.
 * Falls back to local JSON if Sanity is unavailable.
 */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  if (!isSanityConfigured) {
    return (fallbackMenuData.items as MenuItem[]) || [];
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
      'Failed to fetch menu items from Sanity. Using fallback data:',
      error
    );

    return (fallbackMenuData.items as MenuItem[]) || [];
  }
}