import { createClient, type QueryParams } from 'next-sanity';
import { apiVersion, dataset, projectId, isSanityConfigured, useCdn, token } from '../env';
import { POSTS_QUERY, POST_QUERY, JOB_POSTS_QUERY } from './queries';
import { Post, JobPost } from './types';

export const client = createClient({
  projectId: projectId || 'placeholder',
  dataset: dataset || 'production',
  apiVersion,
  useCdn: token ? false : useCdn,
  perspective: 'published',
  token,
});

// Fallback sample posts when Sanity project is not yet configured or dataset is empty
export const SAMPLE_POSTS: Post[] = [
  {
    _id: 'sample-1',
    title: 'The Art of Buttermilk Brining: Crafting the Final Crunch',
    slug: 'the-art-of-buttermilk-brining',
    publishedAt: '2025-05-12T10:00:00.000Z',
    excerpt:
      'Discover how 24-hour buttermilk marinades, proprietary spice blends, and pressure frying converge to create our signature crunch.',
    mainImage: {
      asset: {
        _id: 'sample-img-1',
        url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1200&q=80',
      },
      alt: 'Artisan fried chicken preparation at CFOCO',
    },
    categories: [
      { _id: 'cat-1', title: 'Kitchen & Craft', slug: 'kitchen-craft' },
      { _id: 'cat-2', title: 'Secret Recipe', slug: 'secret-recipe' },
    ],
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Crispy fried chicken is far more than fast food; it is an exacting culinary science of moisture retention and texture contrast. Every hour of our 24-hour buttermilk brine works to break down fibers and lock in natural juices before frying.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: '1. The 24-Hour Acid & Herb Infusion' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Buttermilk’s gentle lactic acid tenderizes the chicken without turning the texture soft or mushy. Submerged alongside crushed garlic, sea salt, and smoked paprika, each cut absorbs deep flavor all the way to the bone.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'blockquote',
        children: [
          {
            _type: 'span',
            text: '"Nothing frozen, nothing rushed. Great crunch takes time, patience, and a refusal to compromise on freshness."',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: '2. The Double Dredge Technique' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Our signature craggy crust comes from a precise double-dredging technique in seasoned flour. When dipped and shaken, it forms delicate flakes that crisp into shatteringly light pockets upon hitting the hot oil.',
          },
        ],
      },
    ],
  },
  {
    _id: 'sample-2',
    title: 'Inside CFOCO Architecture: Industrial Warmth & Amber Glow',
    slug: 'inside-cfoco-architecture',
    publishedAt: '2025-05-02T14:30:00.000Z',
    excerpt:
      'An exploration into how our contemporary street architecture, raw materials, and ambient amber lighting cultivate an elevated dining atmosphere across our French kitchens.',
    mainImage: {
      asset: {
        _id: 'sample-img-2',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
      },
      alt: 'Atmospheric interior of CFOCO dining space',
    },
    categories: [
      { _id: 'cat-3', title: 'Design & Spaces', slug: 'design-spaces' },
    ],
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'When you step into a CFOCO restaurant, the hustle of the city shifts into a warm, energetic rhythm. We designed our kitchens with raw steel accents, acoustic wood paneling, and warm amber lighting.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Open Kitchens & Visible Craft' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Rather than hiding food preparation behind closed doors, our kitchens remain openly visible. Guests can watch tenders being hand-breaded and tossed in house sauces in real time.',
          },
        ],
      },
    ],
  },
  {
    _id: 'sample-3',
    title: 'Fresh Never Frozen: Our 100% French Poultry Commitment',
    slug: 'fresh-never-frozen-french-poultry',
    publishedAt: '2025-04-18T09:15:00.000Z',
    excerpt:
      'Tracing our commitment to regionally sourced, fresh French chicken delivered daily to each of our five kitchens in Bordeaux and beyond.',
    mainImage: {
      asset: {
        _id: 'sample-img-3',
        url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80',
      },
      alt: 'Freshly prepared crispy chicken tenders at CFOCO',
    },
    categories: [
      { _id: 'cat-4', title: 'Quality & Origins', slug: 'quality-origins' },
      { _id: 'cat-1', title: 'Kitchen & Craft', slug: 'kitchen-craft' },
    ],
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Our quality promise begins at the farm. We partner exclusively with certified French poultry producers who prioritize animal welfare, zero antibiotic misuse, and non-GMO vegetable feed.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Daily Morning Deliveries' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Every single piece of chicken in our stores is delivered chilled, never frozen. This guarantees that each bite keeps its natural tenderness and clean, honest flavor without artificial additives.',
          },
        ],
      },
    ],
  },
];

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags = [],
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
}): Promise<QueryResponse> {
  return client.fetch<QueryResponse>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === 'development' ? 0 : 30,
      tags,
    },
  });
}

/**
 * Fetch all posts safely.
 * Returns live posts from Sanity if configured; otherwise returns sample mock posts.
 */
export async function getAllPosts(): Promise<{ posts: Post[]; isLive: boolean }> {
  if (!isSanityConfigured) {
    return { posts: SAMPLE_POSTS, isLive: false };
  }

  try {
    const posts = await sanityFetch<Post[]>({
      query: POSTS_QUERY,
      tags: ['post'],
    });

    if (!posts || posts.length === 0) {
      return { posts: SAMPLE_POSTS, isLive: false };
    }

    return { posts, isLive: true };
  } catch (error) {
    console.error('Error fetching posts from Sanity, using mock data:', error);
    return { posts: SAMPLE_POSTS, isLive: false };
  }
}

/**
 * Fetch a single post by slug safely.
 */
export async function getPostBySlug(slug: string): Promise<{ post: Post | null; isLive: boolean }> {
  if (!isSanityConfigured) {
    const post = SAMPLE_POSTS.find((p) => p.slug === slug) || null;
    return { post, isLive: false };
  }

  try {
    const post = await sanityFetch<Post | null>({
      query: POST_QUERY,
      params: { slug },
      tags: [`post:${slug}`],
    });

    if (!post) {
      // Fallback to sample if matched
      const fallback = SAMPLE_POSTS.find((p) => p.slug === slug) || null;
      return { post: fallback, isLive: false };
    }

    return { post, isLive: true };
  } catch (error) {
    console.error(`Error fetching post [${slug}] from Sanity:`, error);
    const fallback = SAMPLE_POSTS.find((p) => p.slug === slug) || null;
    return { post: fallback, isLive: false };
  }
}

/**
 * Fetch all job posts from Sanity.
 * Falls back to an empty array gracefully so the page never crashes.
 */
export async function getJobPosts(): Promise<JobPost[]> {
  if (!isSanityConfigured) return [];

  try {
    const jobs = await sanityFetch<JobPost[]>({
      query: JOB_POSTS_QUERY,
      tags: ['jobPost'],
    });
    return jobs ?? [];
  } catch (error) {
    console.error('Error fetching job posts from Sanity:', error);
    return [];
  }
}
