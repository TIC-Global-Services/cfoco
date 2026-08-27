import React from "react";
import Hero from "@/components/about/hero";
import Obsession from "@/components/about/obssesion";
import NothingFrozen from "@/components/about/nothingFrozen";
import WhatWeRefuse from "@/components/about/whatwerefuse";
import Showreel from "@/components/about/showreel";
import Reviews from "@/components/about/reviews";
import GetCrispy from "@/components/about/getcrispy";

const page = () => {
  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <Hero />
      <Obsession />
      <NothingFrozen />
      <WhatWeRefuse />
      <Showreel />
      <Reviews />
      <GetCrispy />
    </main>
  );
};

export default page;