import React from "react";
import Hero from "@/components/menu/MenuHero";
import MenuSection from "@/components/menu/MenuSection";
import Reveal from "@/reusable/Reveal";

export const metadata = {
  title: "Menu | CFOCO - One Menu. Endless Cravings.",
  description:
    "From Signature Favorites To Bold New Flavors, Explore Everything On The CFOCO Menu And Find Your Next Craving.",
};

const MenuPage = () => {
  return (
    <main>
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal delay={0.2}>
        <MenuSection />
      </Reveal>
    </main>
  );
};

export default MenuPage;