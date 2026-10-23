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

export const LOCATIONS_QUERY = groq`
  *[_type == "location" && defined(slug.current)] | order(order asc, _createdAt asc) {
    _id,
    name,
    "slug": slug.current,
    cityTag,
    badge,
    coordinates {
      lat,
      lng
    },
    mapCoords {
      top,
      left
    },
    tagline {
      prefix,
      highlight,
      description
    },
    address,
    phone,
    mapsUrl,
    "images": {
      "storefront": coalesce(images.storefront.asset->url, images.storefrontUrl, "/location_details-hero.jpg"),
      "kiosks": coalesce(images.kiosks.asset->url, images.kiosksUrl, "/locations/kiosks.jpg"),
      "dining": coalesce(images.dining.asset->url, images.diningUrl, "/locations/dining.jpg"),
      "barStools": coalesce(images.barStools.asset->url, images.barStoolsUrl, "/locations/bar_stools.jpg"),
      "counter": coalesce(images.counter.asset->url, images.counterUrl, "/locations/counter.jpg"),
      "virtualTour": coalesce(images.virtualTour.asset->url, images.virtualTourUrl, "/locations/virtual_tour.jpg")
    },
    signatureDish {
      badge,
      title,
      subtitle
    },
    openingHours {
      weekday,
      weekend,
      sunday
    },
    tourTitle,
    tourSubtitle,
    features,
    stats {
      established,
      capacity,
      averageWait
    }
  }
`;

export const LOCATION_BY_SLUG_QUERY = groq`
  *[_type == "location" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    cityTag,
    badge,
    coordinates {
      lat,
      lng
    },
    mapCoords {
      top,
      left
    },
    tagline {
      prefix,
      highlight,
      description
    },
    address,
    phone,
    mapsUrl,
    "images": {
      "storefront": coalesce(images.storefront.asset->url, images.storefrontUrl, "/location_details-hero.jpg"),
      "kiosks": coalesce(images.kiosks.asset->url, images.kiosksUrl, "/locations/kiosks.jpg"),
      "dining": coalesce(images.dining.asset->url, images.diningUrl, "/locations/dining.jpg"),
      "barStools": coalesce(images.barStools.asset->url, images.barStoolsUrl, "/locations/bar_stools.jpg"),
      "counter": coalesce(images.counter.asset->url, images.counterUrl, "/locations/counter.jpg"),
      "virtualTour": coalesce(images.virtualTour.asset->url, images.virtualTourUrl, "/locations/virtual_tour.jpg")
    },
    signatureDish {
      badge,
      title,
      subtitle
    },
    openingHours {
      weekday,
      weekend,
      sunday
    },
    tourTitle,
    tourSubtitle,
    features,
    stats {
      established,
      capacity,
      averageWait
    }
  }
`;

export const LOCATION_SLUGS_QUERY = groq`
  *[_type == "location" && defined(slug.current)][].slug.current
`;

export const MENU_CATEGORIES_QUERY = groq`
  *[_type == "menuCategory"] | order(order asc, _createdAt asc) {
    _id,
    name,
    "slug": slug.current,
    "icon": coalesce(icon.asset->url, iconUrl),
    order,
    description
  }
`;

export const MENU_ITEMS_QUERY = groq`
  *[_type == "menuItem"] | order(order asc, _createdAt asc) {
    _id,
    title,
    "slug": slug.current,
    "category": coalesce(categoryRef->slug.current, category, categoryKey, "poulet"),
    "categoryName": coalesce(categoryRef->name, categoryName, categoryKey, category, "Poulet"),
    "image": coalesce(image.asset->url, imageUrl, "/cfc_bucket.png"),
    description,
    price,
    badge,
    isBestSeller,
    order,
    "cardData": {
      "detailedDescription": coalesce(cardData.detailedDescription, detailedDescription),
      "includesTitle": coalesce(cardData.includesTitle, includesTitle),
      "includes": coalesce(cardData.includes, includes)[]{
        name,
        quantity,
        "image": coalesce(image.asset->url, imageUrl),
        "imageUrl": coalesce(imageUrl, image.asset->url)
      },
      "highlights": coalesce(cardData.highlights, highlights)[]{
        icon,
        title,
        subtitle
      },
      "gallery": coalesce(cardData.gallery, gallery)[]{
        alt,
        "image": coalesce(image.asset->url, imageUrl),
        "imageUrl": coalesce(imageUrl, image.asset->url)
      }
    },
    // Backwards-compatible root aliases
    "detailedDescription": coalesce(cardData.detailedDescription, detailedDescription),
    "includesTitle": coalesce(cardData.includesTitle, includesTitle),
    "includes": coalesce(cardData.includes, includes)[]{
      name,
      quantity,
      "image": coalesce(image.asset->url, imageUrl),
      "imageUrl": coalesce(imageUrl, image.asset->url)
    },
    "highlights": coalesce(cardData.highlights, highlights)[]{
      icon,
      title,
      subtitle
    },
    "gallery": coalesce(cardData.gallery, gallery)[]{
      alt,
      "image": coalesce(image.asset->url, imageUrl),
      "imageUrl": coalesce(imageUrl, image.asset->url)
    }
  }
`;



