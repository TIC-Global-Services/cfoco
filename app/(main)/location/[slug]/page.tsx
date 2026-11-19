import React from "react";
import { notFound } from "next/navigation";
import { getLocationBySlug, getAllLocationSlugs } from "@/sanity/lib/locations";
import LocationDetail from "@/components/location/LocationDetail";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cfoco.com";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllLocationSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    return {
      title: "Location Not Found | CFOCO",
    };
  }

  const title = `CFOCO ${location.name} (${location.cityTag}) | Crispy French Chicken`;
  const description = `${location.tagline?.prefix || "CFOCO"} ${location.tagline?.highlight || "Gourmet Chicken"} ${location.tagline?.description || "Fresh never frozen crispy chicken in Bordeaux."} Located at ${location.address}.`;
  const imageUrl = location.images?.storefront || location.cardImage || "/location_details-hero.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: `/location/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/location/${slug}`,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `CFOCO ${location.name} Storefront and Dining Area`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "FastFoodRestaurant",
    name: `CFOCO - ${location.name}`,
    image: location.images?.storefront || location.cardImage || "/location_details-hero.jpg",
    url: `${siteUrl}/location/${slug}`,
    telephone: location.phone || "+33 5 56 00 00 00",
    priceRange: "€€",
    servesCuisine: ["French", "Fast Food", "Fried Chicken", "Burgers"],
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: location.city,
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.coordinates?.lat || location.latitude || 44.8378,
      longitude: location.coordinates?.lng || location.longitude || -0.5792,
    },
    hasMap: location.mapsUrl || "",
    menu: `${siteUrl}/menu`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: location.rating || 4.9,
      reviewCount: location.reviewCount || 150,
      bestRating: 5,
      worstRating: 1,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Locations",
        item: `${siteUrl}/location`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: location.name,
        item: `${siteUrl}/location/${slug}`,
      },
    ],
  };

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <JsonLd data={[restaurantJsonLd, breadcrumbJsonLd]} />
      <LocationDetail location={location} />
    </main>
  );
}
