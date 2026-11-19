import type { Metadata } from "next";
import Hero from "@/components/about/hero";
import Obsession from "@/components/about/obsession";
import NothingFrozen from "@/components/about/nothingFrozen";
import WhatWeRefuse from "@/components/about/whatwerefuse";
import Showreel from "@/components/about/showreel";
import Reviews from "@/components/about/reviews";
import GetCrispy from "@/components/about/getcrispy";
import Reveal from "@/reusable/Reveal";
import JsonLd from "@/components/seo/JsonLd";
import "./home.css";
import Navbar from "@/reusable/Navbar";
import Footer from "@/reusable/Footer";
import { getReviewsData } from "@/sanity/lib/locations";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cfoco.com";

export const metadata: Metadata = {
  title: "CFOCO | From Fresh To The Final Crunch — Gourmet Crispy Chicken",
  description:
    "Welcome to CFOCO: 100% fresh French poultry, 24-hour buttermilk marinades, botanical 14-spice coating, and gourmet toasted brioche burgers across Bordeaux and France.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CFOCO | From Fresh To The Final Crunch — Gourmet Crispy Chicken",
    description:
      "Savor authentic French fried chicken: fresh poultry delivered daily, 24-hour buttermilk brine, secret spices, and gourmet burgers.",
    url: siteUrl,
    type: "website",
    images: [
      {
        url: "/cfc_bucket.png",
        width: 1200,
        height: 630,
        alt: "CFOCO Signature Crispy Fried Chicken Bucket",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CFOCO | Gourmet Crispy Chicken & Brioche Burgers",
    description:
      "Fresh never frozen French poultry, buttermilk brining, and artisanal crunch in Bordeaux.",
    images: ["/cfc_bucket.png"],
  },
};

export default async function Home() {
  const reviewsData = await getReviewsData();

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "FastFoodRestaurant",
    name: "CFOCO",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/cfc_bucket.png`,
    description:
      "Gourmet French crispy chicken, 100% fresh French poultry, 24-hour buttermilk brining, 14-spice coating, and handcrafted burgers.",
    priceRange: "€€",
    servesCuisine: ["French", "Fast Food", "Fried Chicken", "Burgers"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bordeaux",
      addressRegion: "Nouvelle-Aquitaine",
      addressCountry: "FR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviewsData.rating || 4.9,
      reviewCount: 11897,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <JsonLd data={homeJsonLd} />
      <div
        className="fixed inset-0 z-[-20] bg-cover bg-bottom bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/interior_bg.png')",
        }}
        aria-hidden="true"
      />
      <Navbar />
      <Hero />
      <Obsession />
      <Reveal>
        <NothingFrozen />
      </Reveal>
      <WhatWeRefuse />
      <Reveal>
        <Showreel />
      </Reveal>
      <Reviews
        reviews={reviewsData.reviews}
        reviewCount={reviewsData.reviewCount}
        rating={reviewsData.rating}
        heading={reviewsData.heading}
      />
      <Reveal>
        <GetCrispy />
      </Reveal>
      <Footer />
    </main>
  );
}
