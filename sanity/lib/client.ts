import { createClient, type QueryParams } from 'next-sanity';
import { apiVersion, dataset, projectId, isSanityConfigured, useCdn, token } from '../env';
import { POSTS_QUERY, POST_QUERY } from './queries';
import { Post } from './types';

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
    title: 'The Art of Coffee Extraction: Crafting the Perfect Espresso Profile',
    slug: 'the-art-of-coffee-extraction',
    publishedAt: '2025-05-12T10:00:00.000Z',
    excerpt:
      'Discover how water temperature, pressure profiling, and grind geometry converge to reveal the hidden terroir in single-origin beans.',
    mainImage: {
      asset: {
        _id: 'sample-img-1',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      },
      alt: 'Artisan espresso extraction at CFOCO',
    },
    author: {
      name: 'Alex Rivera',
      role: 'Master Roaster',
      bio: 'Over a decade dedicated to the science of specialty coffee roasting and extraction profiling.',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        },
      },
    },
    categories: [
      { _id: 'cat-1', title: 'Brewing & Craft', slug: 'brewing-craft' },
      { _id: 'cat-2', title: 'Specialty Coffee', slug: 'specialty-coffee' },
    ],
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Espresso is more than just concentrated coffee; it is a rapid alchemy of physics and sensory balance. Every fraction of a second during pre-infusion alters the solubility of delicate aromatic lipids and bright organic acids.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: '1. The Crucial Role of Pressure Profiling' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'By beginning extraction at a gentle 3-bar pre-infusion before ramping up to 9 bars, we prevent channel formation and ensure an impeccably uniform saturation across the puck.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'blockquote',
        children: [
          {
            _type: 'span',
            text: '"Precision is not an obsession—it is the only respect we can pay to the farmers who nurtured the bean."',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: '2. Dialing in Temperature Stability' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Fluctuations as small as 0.5°C can shift a shot from vibrant stone-fruit brightness to astringent bitterness. Our dual-boiler configurations ensure PID-governed thermal stability down to the tenth of a degree.',
          },
        ],
      },
    ],
  },
  {
    _id: 'sample-2',
    title: 'Inside CFOCO Architecture: Minimalist Sanctuary & Amber Light',
    slug: 'inside-cfoco-architecture',
    publishedAt: '2025-05-02T14:30:00.000Z',
    excerpt:
      'An exploration into how our brutalist raw textures and warm ambient lighting cultivate an elevated sensory sanctuary for community connection.',
    mainImage: {
      asset: {
        _id: 'sample-img-2',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
      },
      alt: 'Atmospheric interior of CFOCO space',
    },
    author: {
      name: 'Elena Vance',
      role: 'Creative Director',
      bio: 'Architectural designer specializing in sensory hospitality spaces and tactile minimalism.',
      image: {
        asset: {
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        },
      },
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
            text: 'When you step through our glass portal, the noise of the metropolis recedes. We designed our space with acoustic dampening clay-washed walls and low-frequency amber backlighting.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Sculpting Shadows' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Rather than flooding spaces with uniform lumens, our illumination embraces shadow. Each table has its own intimate pocket of light, focusing attention on conversations, notebooks, and the warmth of your cup.',
          },
        ],
      },
    ],
  },
  {
    _id: 'sample-3',
    title: 'Sustainable Sourcing: Direct Trade Across High-Altitude Slopes',
    slug: 'sustainable-sourcing-direct-trade',
    publishedAt: '2025-04-18T09:15:00.000Z',
    excerpt:
      'Tracing our direct-trade coffee journey across the volcanic slopes of Antigua to empower regenerative farming and micro-lot biodiversity.',
    mainImage: {
      asset: {
        _id: 'sample-img-3',
        url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
      },
      alt: 'Freshly harvested coffee cherries on high altitude slope',
    },
    author: {
      name: 'Marcus Chen',
      role: 'Green Coffee Buyer',
      bio: 'Agronomist and Q-grader working directly with smallholder coffee cooperatives worldwide.',
      image: {
        asset: {
          url: '  ',
        },
      },
    },
    categories: [
      { _id: 'cat-4', title: 'Sustainability', slug: 'sustainability' },
      { _id: 'cat-2', title: 'Specialty Coffee', slug: 'specialty-coffee' },
    ],
    body: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Our commitment to excellence begins at origin. We bypass traditional broker syndicates to work directly with farmer families cultivating heirloom Arabica varieties beneath native shade canopy.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Regenerative Agriculture' }],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'By investing in organic composting and natural water filtration on farm sites, we help protect local watersheds while cultivating extraordinary clarity in cup profile.',
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
