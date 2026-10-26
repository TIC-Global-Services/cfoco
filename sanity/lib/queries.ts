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
    city,
    country,
    address,
    latitude,
    longitude,
    badge,
    order,
    "hero": {
      "backgroundImage": coalesce(heroBackgroundImage.asset->url, heroBackgroundImageUrl, hero.backgroundImage.asset->url, hero.backgroundImageUrl, images.storefront.asset->url, images.storefrontUrl, "/location_details-hero.jpg"),
      "locationLabel": coalesce(heroLocationLabel, hero.locationLabel, cityTag, name),
      "heading": coalesce(heroHeading, hero.heading, name),
      "description": coalesce(heroDescription, hero.description, tagline.description, ""),
      "directionsUrl": coalesce(heroDirectionsUrl, hero.directionsUrl, mapsUrl, "")
    },
    "experience": {
      "interiorImages": {
        "dining": coalesce(interiorImages.dining.asset->url, interiorImages.diningUrl, experience.interiorImages.dining.asset->url, experience.interiorImages.diningUrl, images.dining.asset->url, images.diningUrl, "/locations/dining.jpg"),
        "barStools": coalesce(interiorImages.barStools.asset->url, interiorImages.barStoolsUrl, experience.interiorImages.barStools.asset->url, experience.interiorImages.barStoolsUrl, images.barStools.asset->url, images.barStoolsUrl, "/locations/bar_stools.jpg"),
        "counter": coalesce(interiorImages.counter.asset->url, interiorImages.counterUrl, experience.interiorImages.counter.asset->url, experience.interiorImages.counterUrl, images.counter.asset->url, images.counterUrl, "/locations/counter.jpg")
      },
      "orderingKioskImage": coalesce(orderingKioskImage.asset->url, orderingKioskImageUrl, experience.orderingKioskImage.asset->url, experience.orderingKioskImageUrl, images.kiosks.asset->url, images.kiosksUrl, "/locations/kiosks.jpg"),
      "signatureDish": {
        "badge": coalesce(signatureDish.badge, experience.signatureDish.badge, "Signature Dish"),
        "title": coalesce(signatureDish.title, experience.signatureDish.title, ""),
        "subtitle": coalesce(signatureDish.subtitle, experience.signatureDish.subtitle, ""),
        "image": coalesce(signatureDish.image.asset->url, signatureDish.imageUrl, experience.signatureDish.image.asset->url, experience.signatureDish.imageUrl, "/fried-chickens.png")
      },
      "openingHours": coalesce(openingHours, experience.openingHours)
    },
    "virtualTour": {
      "backgroundImage": coalesce(virtualTourBackgroundImage.asset->url, virtualTourBackgroundImageUrl, virtualTour.backgroundImage.asset->url, virtualTour.backgroundImageUrl, images.virtualTour.asset->url, images.virtualTourUrl, "/cfc_ambience.jpg"),
      "heading": coalesce(virtualTourHeading, virtualTour.heading, tourTitle, "Step Inside The Crunch"),
      "buttonText": coalesce(virtualTourButtonText, virtualTour.buttonText, tourSubtitle, "Take A Virtual Tour"),
      "virtualTourUrl": coalesce(virtualTourUrl, virtualTour.virtualTourUrl, "")
    },
    // Backwards-compatible aliases
    "cityTag": coalesce(cityTag, city, name),
    "coordinates": {
      "lat": coalesce(latitude, coordinates.lat, 0),
      "lng": coalesce(longitude, coordinates.lng, 0)
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
    phone,
    "mapsUrl": coalesce(heroDirectionsUrl, hero.directionsUrl, mapsUrl, ""),
    "images": {
      "storefront": coalesce(heroBackgroundImage.asset->url, heroBackgroundImageUrl, hero.backgroundImage.asset->url, hero.backgroundImageUrl, images.storefront.asset->url, images.storefrontUrl, "/location_details-hero.jpg"),
      "kiosks": coalesce(orderingKioskImage.asset->url, orderingKioskImageUrl, experience.orderingKioskImage.asset->url, experience.orderingKioskImageUrl, images.kiosks.asset->url, images.kiosksUrl, "/locations/kiosks.jpg"),
      "dining": coalesce(interiorImages.dining.asset->url, interiorImages.diningUrl, experience.interiorImages.dining.asset->url, experience.interiorImages.diningUrl, images.dining.asset->url, images.diningUrl, "/locations/dining.jpg"),
      "barStools": coalesce(interiorImages.barStools.asset->url, interiorImages.barStoolsUrl, experience.interiorImages.barStools.asset->url, experience.interiorImages.barStoolsUrl, images.barStools.asset->url, images.barStoolsUrl, "/locations/bar_stools.jpg"),
      "counter": coalesce(interiorImages.counter.asset->url, interiorImages.counterUrl, experience.interiorImages.counter.asset->url, experience.interiorImages.counterUrl, images.counter.asset->url, images.counterUrl, "/locations/counter.jpg"),
      "virtualTour": coalesce(virtualTourBackgroundImage.asset->url, virtualTourBackgroundImageUrl, virtualTour.backgroundImage.asset->url, virtualTour.backgroundImageUrl, images.virtualTour.asset->url, images.virtualTourUrl, "/locations/virtual_tour.jpg")
    },
    "signatureDish": coalesce(signatureDish, experience.signatureDish),
    "openingHours": coalesce(openingHours, experience.openingHours),
    "tourTitle": coalesce(virtualTourHeading, virtualTour.heading, tourTitle, "Step Inside The Crunch"),
    "tourSubtitle": coalesce(virtualTourButtonText, virtualTour.buttonText, tourSubtitle, "Take A Virtual Tour"),
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
    city,
    country,
    address,
    latitude,
    longitude,
    badge,
    order,
    "hero": {
      "backgroundImage": coalesce(heroBackgroundImage.asset->url, heroBackgroundImageUrl, hero.backgroundImage.asset->url, hero.backgroundImageUrl, images.storefront.asset->url, images.storefrontUrl, "/location_details-hero.jpg"),
      "locationLabel": coalesce(heroLocationLabel, hero.locationLabel, cityTag, name),
      "heading": coalesce(heroHeading, hero.heading, name),
      "description": coalesce(heroDescription, hero.description, tagline.description, ""),
      "directionsUrl": coalesce(heroDirectionsUrl, hero.directionsUrl, mapsUrl, "")
    },
    "experience": {
      "interiorImages": {
        "dining": coalesce(interiorImages.dining.asset->url, interiorImages.diningUrl, experience.interiorImages.dining.asset->url, experience.interiorImages.diningUrl, images.dining.asset->url, images.diningUrl, "/locations/dining.jpg"),
        "barStools": coalesce(interiorImages.barStools.asset->url, interiorImages.barStoolsUrl, experience.interiorImages.barStools.asset->url, experience.interiorImages.barStoolsUrl, images.barStools.asset->url, images.barStoolsUrl, "/locations/bar_stools.jpg"),
        "counter": coalesce(interiorImages.counter.asset->url, interiorImages.counterUrl, experience.interiorImages.counter.asset->url, experience.interiorImages.counterUrl, images.counter.asset->url, images.counterUrl, "/locations/counter.jpg")
      },
      "orderingKioskImage": coalesce(orderingKioskImage.asset->url, orderingKioskImageUrl, experience.orderingKioskImage.asset->url, experience.orderingKioskImageUrl, images.kiosks.asset->url, images.kiosksUrl, "/locations/kiosks.jpg"),
      "signatureDish": {
        "badge": coalesce(signatureDish.badge, experience.signatureDish.badge, "Signature Dish"),
        "title": coalesce(signatureDish.title, experience.signatureDish.title, ""),
        "subtitle": coalesce(signatureDish.subtitle, experience.signatureDish.subtitle, ""),
        "image": coalesce(signatureDish.image.asset->url, signatureDish.imageUrl, experience.signatureDish.image.asset->url, experience.signatureDish.imageUrl, "/fried-chickens.png")
      },
      "openingHours": coalesce(openingHours, experience.openingHours)
    },
    "virtualTour": {
      "backgroundImage": coalesce(virtualTourBackgroundImage.asset->url, virtualTourBackgroundImageUrl, virtualTour.backgroundImage.asset->url, virtualTour.backgroundImageUrl, images.virtualTour.asset->url, images.virtualTourUrl, "/cfc_ambience.jpg"),
      "heading": coalesce(virtualTourHeading, virtualTour.heading, tourTitle, "Step Inside The Crunch"),
      "buttonText": coalesce(virtualTourButtonText, virtualTour.buttonText, tourSubtitle, "Take A Virtual Tour"),
      "virtualTourUrl": coalesce(virtualTourUrl, virtualTour.virtualTourUrl, "")
    },
    // Backwards-compatible aliases
    "cityTag": coalesce(cityTag, city, name),
    "coordinates": {
      "lat": coalesce(latitude, coordinates.lat, 0),
      "lng": coalesce(longitude, coordinates.lng, 0)
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
    phone,
    "mapsUrl": coalesce(heroDirectionsUrl, hero.directionsUrl, mapsUrl, ""),
    "images": {
      "storefront": coalesce(heroBackgroundImage.asset->url, heroBackgroundImageUrl, hero.backgroundImage.asset->url, hero.backgroundImageUrl, images.storefront.asset->url, images.storefrontUrl, "/location_details-hero.jpg"),
      "kiosks": coalesce(orderingKioskImage.asset->url, orderingKioskImageUrl, experience.orderingKioskImage.asset->url, experience.orderingKioskImageUrl, images.kiosks.asset->url, images.kiosksUrl, "/locations/kiosks.jpg"),
      "dining": coalesce(interiorImages.dining.asset->url, interiorImages.diningUrl, experience.interiorImages.dining.asset->url, experience.interiorImages.diningUrl, images.dining.asset->url, images.diningUrl, "/locations/dining.jpg"),
      "barStools": coalesce(interiorImages.barStools.asset->url, interiorImages.barStoolsUrl, experience.interiorImages.barStools.asset->url, experience.interiorImages.barStoolsUrl, images.barStools.asset->url, images.barStoolsUrl, "/locations/bar_stools.jpg"),
      "counter": coalesce(interiorImages.counter.asset->url, interiorImages.counterUrl, experience.interiorImages.counter.asset->url, experience.interiorImages.counterUrl, images.counter.asset->url, images.counterUrl, "/locations/counter.jpg"),
      "virtualTour": coalesce(virtualTourBackgroundImage.asset->url, virtualTourBackgroundImageUrl, virtualTour.backgroundImage.asset->url, virtualTour.backgroundImageUrl, images.virtualTour.asset->url, images.virtualTourUrl, "/locations/virtual_tour.jpg")
    },
    "signatureDish": coalesce(signatureDish, experience.signatureDish),
    "openingHours": coalesce(openingHours, experience.openingHours),
    "tourTitle": coalesce(virtualTourHeading, virtualTour.heading, tourTitle, "Step Inside The Crunch"),
    "tourSubtitle": coalesce(virtualTourButtonText, virtualTour.buttonText, tourSubtitle, "Take A Virtual Tour"),
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



