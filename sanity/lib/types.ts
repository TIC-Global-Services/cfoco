import type { PortableTextBlock, TypedObject } from '@portabletext/types';
import type { LocalizedValue } from './localized';

export interface JobPost {
  _id: string;
  role: LocalizedValue<string>;
  location: string;
  type?: LocalizedValue<string>;
  youare?: LocalizedValue<string>;
  nicetohave?: LocalizedValue<string>;
  hours?: LocalizedValue<string>;
  pay?: LocalizedValue<string>;
  applyMethod: 'email' | 'link';
  applyEmail?: string;
  applySubject?: string;
  applyLink?: string;
}

export interface Category {
  _id: string;
  title: LocalizedValue<string>;
  slug?: string;
}

export interface Post {
  _id: string;
  title: LocalizedValue<string>;
  slug: string;
  publishedAt: string;
  excerpt?: LocalizedValue<string>;
  mainImage?: {
    asset?: {
      _id: string;
      url: string;
    };
    alt?: string;
  };
  categories?: Category[];
  body?: LocalizedValue<PortableTextBlock[] | TypedObject[]> | null;
}
