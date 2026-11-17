import type { Metadata } from "next";
import Hero from "@/components/about/hero";
import Obsession from "@/components/about/obssesion";
import NothingFrozen from "@/components/about/nothingFrozen";
import WhatWeRefuse from "@/components/about/whatwerefuse";
import Showreel from "@/components/about/showreel";
import Reviews from "@/components/about/reviews";
import GetCrispy from "@/components/about/getcrispy";
import Reveal from "@/reusable/Reveal";
import "./home.css";
import Navbar from "@/reusable/Navbar";
import Footer from "@/reusable/Footer";
import { getReviewsData } from "@/sanity/lib/locations";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "CFOCO — From Fresh To The Final Crunch",
  description: "Fresh chicken, a blend of flavors, and the future of fast food.",
};

export default async function Home() {
  const reviewsData = await getReviewsData();

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
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
