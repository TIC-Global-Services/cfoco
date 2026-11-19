import { groq } from 'next-sanity';

export const POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    "title": {
      "en": title,
      "fr": coalesce(titleFr, title)
    },
    "slug": slug.current,
    publishedAt,
    "excerpt": {
      "en": excerpt,
      "fr": coalesce(excerptFr, excerpt)
    },
    mainImage {
      asset->{
        _id,
        url
      },
      alt
    },
    "categories": categories[]->{
      _id,
      "title": {
        "en": title,
        "fr": coalesce(titleFr, title)
      },
      "slug": slug.current
    }
  }
`;

export const POST_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    "title": {
      "en": title,
      "fr": coalesce(titleFr, title)
    },
    "slug": slug.current,
    publishedAt,
    "excerpt": {
      "en": excerpt,
      "fr": coalesce(excerptFr, excerpt)
    },
    mainImage {
      asset->{
        _id,
        url
      },
      alt
    },
    "categories": categories[]->{
      _id,
      "title": {
        "en": title,
        "fr": coalesce(titleFr, title)
      },
      "slug": slug.current
    },
    "body": {
      "en": body,
      "fr": coalesce(bodyFr, body)
    }
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
    "badge": {
      "en": badge,
      "fr": coalesce(badgeFr, badge)
    },
    order,
    rating,
    reviewCount,
    "reviews": reviews[]{
      "id": coalesce(_key, _id),
      authorName,
      rating,
      "quote": {
        "en": quote,
        "fr": coalesce(quoteFr, quote)
      },
      avatarColor
    },
    "cardImage": coalesce(cardImage.asset->url, cardImageUrl, heroBackgroundImage.asset->url, hero.backgroundImage.asset->url, images.storefront.asset->url, "/locations/bordeaux_front.jpg"),
    "hero": {
      "backgroundImage": coalesce(heroBackgroundImage.asset->url, heroBackgroundImageUrl, hero.backgroundImage.asset->url, hero.backgroundImageUrl, images.storefront.asset->url, images.storefrontUrl, "/location_details-hero.jpg"),
      "locationLabel": coalesce(heroLocationLabel, hero.locationLabel, cityTag, name),
      "subheading": {
        "en": coalesce(heroSubheading, hero.subheading, "CFC Tasty"),
        "fr": coalesce(heroSubheadingFr, heroSubheading, hero.subheading, "CFC Savoureux")
      },
      "heading": {
        "en": coalesce(heroHeading, hero.heading, name),
        "fr": coalesce(heroHeadingFr, heroHeading, hero.heading, name)
      },
      "description": {
        "en": coalesce(heroDescription, hero.description, tagline.description, ""),
        "fr": coalesce(heroDescriptionFr, heroDescription, hero.description, tagline.description, "")
      },
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
        "badge": {
          "en": coalesce(signatureDish.badge, experience.signatureDish.badge, "Signature Dish"),
          "fr": coalesce(signatureDish.badgeFr, experience.signatureDish.badgeFr, signatureDish.badge, experience.signatureDish.badge, "Plat Signature")
        },
        "title": {
          "en": coalesce(signatureDish.title, experience.signatureDish.title, ""),
          "fr": coalesce(signatureDish.titleFr, experience.signatureDish.titleFr, signatureDish.title, experience.signatureDish.title, "")
        },
        "subtitle": {
          "en": coalesce(signatureDish.subtitle, experience.signatureDish.subtitle, ""),
          "fr": coalesce(signatureDish.subtitleFr, experience.signatureDish.subtitleFr, signatureDish.subtitle, experience.signatureDish.subtitle, "")
        },
        "image": coalesce(signatureDish.image.asset->url, signatureDish.imageUrl, experience.signatureDish.image.asset->url, experience.signatureDish.imageUrl, "/fried-chickens.png")
      },
      "openingHours": {
        "weekday": {
          "en": coalesce(openingHours.weekday, experience.openingHours.weekday),
          "fr": coalesce(openingHours.weekdayFr, experience.openingHours.weekdayFr, openingHours.weekday, experience.openingHours.weekday)
        },
        "weekend": {
          "en": coalesce(openingHours.weekend, experience.openingHours.weekend),
          "fr": coalesce(openingHours.weekendFr, experience.openingHours.weekendFr, openingHours.weekend, experience.openingHours.weekend)
        },
        "sunday": {
          "en": coalesce(openingHours.sunday, experience.openingHours.sunday),
          "fr": coalesce(openingHours.sundayFr, experience.openingHours.sundayFr, openingHours.sunday, experience.openingHours.sunday)
        }
      }
    },
    "virtualTour": {
      "backgroundImage": coalesce(virtualTourBackgroundImage.asset->url, virtualTourBackgroundImageUrl, virtualTour.backgroundImage.asset->url, virtualTour.backgroundImageUrl, images.virtualTour.asset->url, images.virtualTourUrl, "/cfc_ambience.jpg"),
      "heading": {
        "en": coalesce(virtualTourHeading, virtualTour.heading, tourTitle, "Step Inside The Crunch"),
        "fr": coalesce(virtualTourHeadingFr, virtualTourHeading, virtualTour.heading, tourTitle, "Plongez dans le croustillant")
      },
      "buttonText": {
        "en": coalesce(virtualTourButtonText, virtualTour.buttonText, tourSubtitle, "Take A Virtual Tour"),
        "fr": coalesce(virtualTourButtonTextFr, virtualTourButtonText, virtualTour.buttonText, tourSubtitle, "Faites une visite virtuelle")
      },
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
    "badge": {
      "en": badge,
      "fr": coalesce(badgeFr, badge)
    },
    order,
    rating,
    reviewCount,
    "reviews": reviews[]{
      "id": coalesce(_key, _id),
      authorName,
      rating,
      "quote": {
        "en": quote,
        "fr": coalesce(quoteFr, quote)
      },
      avatarColor
    },
    "cardImage": coalesce(cardImage.asset->url, cardImageUrl, heroBackgroundImage.asset->url, hero.backgroundImage.asset->url, images.storefront.asset->url, "/locations/bordeaux_front.jpg"),
    "hero": {
      "backgroundImage": coalesce(heroBackgroundImage.asset->url, heroBackgroundImageUrl, hero.backgroundImage.asset->url, hero.backgroundImageUrl, images.storefront.asset->url, images.storefrontUrl, "/location_details-hero.jpg"),
      "locationLabel": coalesce(heroLocationLabel, hero.locationLabel, cityTag, name),
      "subheading": {
        "en": coalesce(heroSubheading, hero.subheading, "CFC Tasty"),
        "fr": coalesce(heroSubheadingFr, heroSubheading, hero.subheading, "CFC Savoureux")
      },
      "heading": {
        "en": coalesce(heroHeading, hero.heading, name),
        "fr": coalesce(heroHeadingFr, heroHeading, hero.heading, name)
      },
      "description": {
        "en": coalesce(heroDescription, hero.description, tagline.description, ""),
        "fr": coalesce(heroDescriptionFr, heroDescription, hero.description, tagline.description, "")
      },
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
        "badge": {
          "en": coalesce(signatureDish.badge, experience.signatureDish.badge, "Signature Dish"),
          "fr": coalesce(signatureDish.badgeFr, experience.signatureDish.badgeFr, signatureDish.badge, experience.signatureDish.badge, "Plat Signature")
        },
        "title": {
          "en": coalesce(signatureDish.title, experience.signatureDish.title, ""),
          "fr": coalesce(signatureDish.titleFr, experience.signatureDish.titleFr, signatureDish.title, experience.signatureDish.title, "")
        },
        "subtitle": {
          "en": coalesce(signatureDish.subtitle, experience.signatureDish.subtitle, ""),
          "fr": coalesce(signatureDish.subtitleFr, experience.signatureDish.subtitleFr, signatureDish.subtitle, experience.signatureDish.subtitle, "")
        },
        "image": coalesce(signatureDish.image.asset->url, signatureDish.imageUrl, experience.signatureDish.image.asset->url, experience.signatureDish.imageUrl, "/fried-chickens.png")
      },
      "openingHours": {
        "weekday": {
          "en": coalesce(openingHours.weekday, experience.openingHours.weekday),
          "fr": coalesce(openingHours.weekdayFr, experience.openingHours.weekdayFr, openingHours.weekday, experience.openingHours.weekday)
        },
        "weekend": {
          "en": coalesce(openingHours.weekend, experience.openingHours.weekend),
          "fr": coalesce(openingHours.weekendFr, experience.openingHours.weekendFr, openingHours.weekend, experience.openingHours.weekend)
        },
        "sunday": {
          "en": coalesce(openingHours.sunday, experience.openingHours.sunday),
          "fr": coalesce(openingHours.sundayFr, experience.openingHours.sundayFr, openingHours.sunday, experience.openingHours.sunday)
        }
      }
    },
    "virtualTour": {
      "backgroundImage": coalesce(virtualTourBackgroundImage.asset->url, virtualTourBackgroundImageUrl, virtualTour.backgroundImage.asset->url, virtualTour.backgroundImageUrl, images.virtualTour.asset->url, images.virtualTourUrl, "/cfc_ambience.jpg"),
      "heading": {
        "en": coalesce(virtualTourHeading, virtualTour.heading, tourTitle, "Step Inside The Crunch"),
        "fr": coalesce(virtualTourHeadingFr, virtualTourHeading, virtualTour.heading, tourTitle, "Plongez dans le croustillant")
      },
      "buttonText": {
        "en": coalesce(virtualTourButtonText, virtualTour.buttonText, tourSubtitle, "Take A Virtual Tour"),
        "fr": coalesce(virtualTourButtonTextFr, virtualTourButtonText, virtualTour.buttonText, tourSubtitle, "Faites une visite virtuelle")
      },
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
    "name": {
      "en": name,
      "fr": coalesce(nameFr, name)
    },
    "slug": slug.current,
    "icon": coalesce(icon.asset->url, iconUrl),
    order,
    "description": {
      "en": description,
      "fr": coalesce(descriptionFr, description)
    }
  }
`;

export const MENU_ITEMS_QUERY = groq`
  *[_type == "menuItem"] | order(order asc, _createdAt asc) {
    _id,
    "title": {
      "en": title,
      "fr": coalesce(titleFr, title)
    },
    "slug": slug.current,
    "category": coalesce(categoryRef->slug.current, category, categoryKey, "poulet"),
    "categoryName": {
      "en": coalesce(categoryRef->name, categoryName, categoryKey, category, "Poulet"),
      "fr": coalesce(categoryRef->nameFr, categoryRef->name, categoryName, categoryKey, category, "Poulet")
    },
    "image": coalesce(image.asset->url, imageUrl, "/cfc_bucket.png"),
    "description": {
      "en": description,
      "fr": coalesce(descriptionFr, description)
    },
    price,
    "badge": {
      "en": badge,
      "fr": coalesce(badgeFr, badge)
    },
    isBestSeller,
    order,
    "cardData": {
      "detailedDescription": {
        "en": coalesce(cardData.detailedDescription, detailedDescription),
        "fr": coalesce(cardData.detailedDescriptionFr, cardData.detailedDescription, detailedDescription)
      },
      "includesTitle": {
        "en": coalesce(cardData.includesTitle, includesTitle),
        "fr": coalesce(cardData.includesTitleFr, cardData.includesTitle, includesTitle)
      },
      "includes": coalesce(cardData.includes, includes)[]{
        "name": {
          "en": name,
          "fr": coalesce(nameFr, name)
        },
        quantity,
        "image": coalesce(image.asset->url, imageUrl),
        "imageUrl": coalesce(imageUrl, image.asset->url)
      },
      "highlights": coalesce(cardData.highlights, highlights)[]{
        icon,
        "title": {
          "en": title,
          "fr": coalesce(titleFr, title)
        },
        "subtitle": {
          "en": subtitle,
          "fr": coalesce(subtitleFr, subtitle)
        }
      },
      "gallery": coalesce(cardData.gallery, gallery)[]{
        alt,
        "image": coalesce(image.asset->url, imageUrl),
        "imageUrl": coalesce(imageUrl, image.asset->url)
      }
    },
    // Backwards-compatible root aliases
    "detailedDescription": {
      "en": coalesce(cardData.detailedDescription, detailedDescription),
      "fr": coalesce(cardData.detailedDescriptionFr, cardData.detailedDescription, detailedDescription)
    },
    "includesTitle": {
      "en": coalesce(cardData.includesTitle, includesTitle),
      "fr": coalesce(cardData.includesTitleFr, cardData.includesTitle, includesTitle)
    },
    "includes": coalesce(cardData.includes, includes)[]{
      "name": {
        "en": name,
        "fr": coalesce(nameFr, name)
      },
      quantity,
      "image": coalesce(image.asset->url, imageUrl),
      "imageUrl": coalesce(imageUrl, image.asset->url)
    },
    "highlights": coalesce(cardData.highlights, highlights)[]{
      icon,
      "title": {
        "en": title,
        "fr": coalesce(titleFr, title)
      },
      "subtitle": {
        "en": subtitle,
        "fr": coalesce(subtitleFr, subtitle)
      }
    },
    "gallery": coalesce(cardData.gallery, gallery)[]{
      alt,
      "image": coalesce(image.asset->url, imageUrl),
      "imageUrl": coalesce(imageUrl, image.asset->url)
    }
  }
`;




export const JOB_POSTS_QUERY = groq`
  *[_type == "jobPost"] | order(_createdAt desc) {
    _id,
    "role": {
      "en": role,
      "fr": coalesce(roleFr, role)
    },
    location,
    "type": {
      "en": type,
      "fr": coalesce(typeFr, type)
    },
    "youare": {
      "en": youare,
      "fr": coalesce(youareFr, youare)
    },
    "nicetohave": {
      "en": nicetohave,
      "fr": coalesce(nicetohaveFr, nicetohave)
    },
    "hours": {
      "en": hours,
      "fr": coalesce(hoursFr, hours)
    },
    "pay": {
      "en": pay,
      "fr": coalesce(payFr, pay)
    },
    applyMethod,
    applyEmail,
    applySubject,
    applyLink
  }
`;

export const LOCATION_REVIEWS_QUERY = groq`
  *[_type == "locationReviews" || _id in ["locationReviews", "drafts.locationReviews"]] | order(_updatedAt desc)[0] {
    _id,
    overallReviewCount,
    "title": {
      "en": title,
      "fr": coalesce(titleFr, title)
    },
    "reviews": reviews[]{
      "id": coalesce(_key, _id),
      authorName,
      rating,
      "quote": {
        "en": quote,
        "fr": coalesce(quoteFr, quote)
      },
      avatarColor
    }
  }
`;
