export interface Author {
  name: string;
  role?: string;
  bio?: string;
  image?: any;
}

export interface Category {
  _id: string;
  title: string;
  slug?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  mainImage?: {
    asset?: {
      _id: string;
      url: string;
    };
    alt?: string;
  };
  author?: Author;
  categories?: Category[];
  body?: any;
}
