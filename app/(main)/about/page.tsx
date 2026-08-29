import React from "react";
import Hero from "@/components/about/hero";
import Obsession from "@/components/about/obssesion";
import NothingFrozen from "@/components/about/nothingFrozen";
import WhatWeRefuse from "@/components/about/whatwerefuse";
import Showreel from "@/components/about/showreel";
import Reviews from "@/components/about/reviews";
import GetCrispy from "@/components/about/getcrispy";
import Reveal from "@/reusable/Reveal";

const page = () => {
  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal>
        <Obsession />
      </Reveal>
      <Reveal>
        <NothingFrozen />
      </Reveal>
      <Reveal>
        <WhatWeRefuse />
      </Reveal>
      <Reveal>
        <Showreel />
      </Reveal>
      <Reveal>
        <Reviews />
      </Reveal>
      <Reveal>
        <GetCrispy />
      </Reveal>
    </main>
  );
};

export default page;