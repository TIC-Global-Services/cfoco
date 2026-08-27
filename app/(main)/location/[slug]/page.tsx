import React from "react";
import { notFound } from "next/navigation";
import { getLocationBySlug, getAllLocationSlugs } from "@/data/locations";
import LocationDetail from "@/components/location/LocationDetail";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllLocationSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationBySlug(slug);

  if (!location) {
    return {
      title: "Location Not Found | CFC",
    };
  }

  return {
    title: `CFC ${location.name} - ${location.cityTag} | Crispy French Chicken`,
    description: `${location.tagline.prefix} ${location.tagline.highlight} ${location.tagline.description}`,
    openGraph: {
      title: `CFC ${location.name} - ${location.cityTag}`,
      description: location.tagline.description,
      images: [location.images.storefront],
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <LocationDetail location={location} />
    </main>
  );
}
