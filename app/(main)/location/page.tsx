import React from 'react';
import type { Metadata } from 'next';
import Hero from '@/components/location/hero';
import StepInside from '@/components/location/stepinside';
import Reviews from '@/components/location/reviews';
import Reveal from '@/reusable/Reveal';
import JsonLd from '@/components/seo/JsonLd';
import { getAllLocations, getReviewsData } from '@/sanity/lib/locations';
import LocationGallery from '@/components/location/LocationGallery';

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cfoco.com';

export const metadata: Metadata = {
  title: 'Our Locations | CFOCO Restaurants & Dine-in Kitchens',
  description:
    'Find a CFOCO restaurant near you across Bordeaux Centre, Mérignac, Pessac, Talence, and Bègles. Explore opening hours, street addresses, dining spaces, and directions.',
  alternates: {
    canonical: '/location',
  },
  openGraph: {
    title: 'Our Locations | CFOCO Restaurants & Dine-in Kitchens',
    description:
      'Find a CFOCO restaurant near you across Bordeaux and beyond. Check dine-in hours, addresses, ratings, and directions.',
    url: `${siteUrl}/location`,
    type: 'website',
    images: [
      {
        url: '/cfc_ambience.jpg',
        width: 1200,
        height: 630,
        alt: 'CFOCO Restaurant Atmosphere & Dining Spaces',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Locations | CFOCO Restaurants in France',
    description:
      'Discover CFOCO restaurants, opening hours, and street food dining spaces.',
    images: ['/cfc_ambience.jpg'],
  },
};

const LocationPage = async () => {
  const [locations, reviewsData] = await Promise.all([
    getAllLocations(),
    getReviewsData(),
  ]);

  const locationsListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CFOCO Restaurant Locations',
    description: 'All CFOCO restaurant locations across France.',
    itemListElement: locations.map((loc, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'FastFoodRestaurant',
        name: `CFOCO - ${loc.name}`,
        url: `${siteUrl}/location/${loc.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: loc.address,
          addressLocality: loc.city,
          addressCountry: 'FR',
        },
        telephone: loc.phone,
        image: loc.cardImage,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Locations',
        item: `${siteUrl}/location`,
      },
    ],
  };

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <JsonLd data={[locationsListJsonLd, breadcrumbJsonLd]} />
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal>
        <StepInside locations={locations} />
      </Reveal>
      <LocationGallery />
      <Reviews
        reviews={reviewsData.reviews}
        reviewCount={reviewsData.reviewCount}
        rating={reviewsData.rating}
        heading={reviewsData.heading}
      />
    </main>
  );
};

export default LocationPage;
