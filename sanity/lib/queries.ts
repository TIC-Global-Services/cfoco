import { groq } from 'next-sanity';

export const POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    mainImage {
      asset->{
        _id,
        url
      },
      alt
    },
    "author": author->{
      name,
      role,
      image
    },
    "categories": categories[]->{
      _id,
      title,
      "slug": slug.current
    }
  }
`;

export const POST_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    mainImage {
      asset->{
        _id,
        url
      },
      alt
    },
    "author": author->{
      name,
      role,
      bio,
      image
    },
    "categories": categories[]->{
      _id,
      title,
      "slug": slug.current
    },
    body
  }
`;

export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;
