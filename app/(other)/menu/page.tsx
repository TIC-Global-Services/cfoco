import React from "react";
import Hero from "@/components/menu/MenuHero";
import MenuSection from "@/components/menu/MenuSection";
import Reveal from "@/reusable/Reveal";
import { getAllMenuItems, getAllMenuCategories } from "@/sanity/lib/menu";

export const revalidate = 60;

export const metadata = {
  title: "Menu | CFOCO - One Menu. Endless Cravings.",
  description:
    "From Signature Favorites To Bold New Flavors, Explore Everything On The CFOCO Menu And Find Your Next Craving.",
};

const MenuPage = async () => {
  const [categories, menuItems] = await Promise.all([
    getAllMenuCategories(),
    getAllMenuItems(),
  ]);

  return (
    <main>
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal delay={0.2}>
        <MenuSection categories={categories} initialItems={menuItems} />
      </Reveal>
    </main>
  );
};

export default MenuPage;