import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Experience from "@/components/home/Experience";
import Hero from "@/components/about/hero";
import Obsession from "@/components/about/obssesion";
import NothingFrozen from "@/components/about/nothingFrozen";
import WhatWeRefuse from "@/components/about/whatwerefuse";
import Showreel from "@/components/about/showreel";
import Reviews from "@/components/about/reviews";
import GetCrispy from "@/components/about/getcrispy";
import Reveal from "@/reusable/Reveal";
import Simplefrastration from "@/components/about/simplefrastration";
import "./home.css";
import Navbar from "@/reusable/Navbar";
import Footer from "@/reusable/Footer";



export const metadata: Metadata = {
  title: "CFOCO — From Fresh To The Final Crunch",
  description: "Fresh chicken, a blend of flavors, and the future of fast food.",
};

export default function Home() {
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
      <Reviews />
      <Reveal>
        <GetCrispy />
      </Reveal>
      <Footer />
      
    </main>
  );
}
