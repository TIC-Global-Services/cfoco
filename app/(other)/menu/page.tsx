import React from "react";
import type { Metadata } from "next";
import Hero from "@/components/menu/MenuHero";
import MenuSection from "@/components/menu/MenuSection";
import Reveal from "@/reusable/Reveal";
import JsonLd from "@/components/seo/JsonLd";
import { getAllMenuItems, getAllMenuCategories } from "@/sanity/lib/menu";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cfoco.com";

export const metadata: Metadata = {
  title: "Menu | CFOCO — One Menu. Endless Cravings.",
  description:
    "Explore the official CFOCO menu: Crousty Tenders, Dynamic Wings, Quad Stack Brioche Burgers, French Tacos, artisanal dips, and sharing buckets crafted from 100% fresh French poultry.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Menu | CFOCO — One Menu. Endless Cravings.",
    description:
      "From signature crispy chicken tenders to loaded gourmet burgers, discover the full CFOCO menu and satisfy your cravings.",
    url: `${siteUrl}/menu`,
    type: "website",
    images: [
      {
        url: "/cfc_bucket.png",
        width: 1200,
        height: 630,
        alt: "CFOCO Full Menu & Sharing Buckets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu | CFOCO — One Menu. Endless Cravings.",
    description:
      "Handcrafted crispy chicken, signature brioche burgers, craft dips, and sharing buckets.",
    images: ["/cfc_bucket.png"],
  },
};

const MenuPage = async () => {
  const [categories, menuItems] = await Promise.all([
    getAllMenuCategories(),
    getAllMenuItems(),
  ]);

  const menuJsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "CFOCO Restaurant Menu",
    description:
      "Handcrafted crispy chicken, signature brioche burgers, bowls, craft dips, and sharing buckets.",
    url: `${siteUrl}/menu`,
    hasMenuSection: categories.map((cat) => ({
      "@type": "MenuSection",
      name:
        typeof cat.name === "string"
          ? cat.name
          : (cat.name as { en?: string; fr?: string })?.en || "Menu Category",
      description:
        typeof cat.description === "string"
          ? cat.description
          : (cat.description as { en?: string; fr?: string })?.en || "",
    })),
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
        name: "Menu",
        item: `${siteUrl}/menu`,
      },
    ],
  };

  return (
    <main>
      <JsonLd data={[menuJsonLd, breadcrumbJsonLd]} />
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
