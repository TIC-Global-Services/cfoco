export interface JobPost {
  _id: string;
  role: string;
  location: string;
  type?: string;
  youare?: string;
  nicetohave?: string;
  hours?: string;
  pay?: string;
  applyMethod: 'email' | 'link';
  applyEmail?: string;
  applySubject?: string;
  applyLink?: string;
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
  categories?: Category[];
  body?: any;
}
