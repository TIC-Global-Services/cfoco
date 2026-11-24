import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { matter } from "@/font/fonts";
import GlobalLoader from "@/components/common/Loader";
import { I18nProvider } from "@/i18n";
import JsonLd from "@/components/seo/JsonLd";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cfoco.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CFOCO | Crispy French Chicken & Gourmet Burgers",
    template: "%s | CFOCO",
  },
  description:
    "Experience gourmet French crispy chicken: 100% fresh French poultry, artisan 24-hour buttermilk brining, proprietary 14-spice seasoning, handcrafted brioche burgers, and house dips.",
  keywords: [
    "CFOCO",
    "Crispy French Chicken",
    "Gourmet Fried Chicken",
    "Poulet Frit Bordeaux",
    "Poulet Frit France",
    "French Brioche Burgers",
    "Artisan Buttermilk Chicken",
    "Tenders Croustillants",
    "Wings Épicées",
    "Fast Food Gourmet Bordeaux",
    "Restaurant Poulet Bordeaux",
    "Halal Chicken France",
    "Street Food Bordeaux",
  ],
  authors: [{ name: "CFOCO Culinary Team", url: siteUrl }],
  creator: "CFOCO",
  publisher: "CFOCO",
  applicationName: "CFOCO",
  category: "food",
  classification: "Restaurant & Food Delivery",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "fr-FR": "/fr",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: "CFOCO — Crispy French Chicken",
    title: "CFOCO | Crispy French Chicken & Gourmet Burgers",
    description:
      "Gourmet French crispy chicken, 100% fresh French poultry, artisan buttermilk brining, 14-spice crunch, and authentic street food culture in Bordeaux.",
    images: [
      {
        url: "/cfc_bucket.png",
        width: 1200,
        height: 630,
        alt: "CFOCO Gourmet Crispy Chicken Sharing Bucket",
      },
      {
        url: "/cfc_ambience.jpg",
        width: 1200,
        height: 630,
        alt: "CFOCO Restaurant Dining Atmosphere",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CFOCO | Crispy French Chicken & Gourmet Burgers",
    description:
      "Gourmet French crispy chicken, 100% fresh French poultry, buttermilk brining, and handcrafted gourmet burgers.",
    images: ["/cfc_bucket.png"],
    creator: "@cfoco",
    site: "@cfoco",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "FastFoodRestaurant",
  name: "CFOCO",
  alternateName: "Crispy French Chicken",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: `${siteUrl}/cfc_bucket.png`,
  description:
    "Gourmet French crispy chicken, 100% fresh French poultry, 24-hour buttermilk brining, 14-spice coating, and handcrafted burgers.",
  telephone: "+33 5 56 00 00 00",
  priceRange: "€€",
  servesCuisine: ["French", "Fast Food", "Fried Chicken", "Burgers"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bordeaux",
    addressRegion: "Nouvelle-Aquitaine",
    addressCountry: "FR",
  },
  sameAs: [
    "https://www.instagram.com/cfoco",
    "https://www.facebook.com/cfoco",
    "https://www.tiktok.com/@cfoco",
  ],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CFOCO",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/blogs?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${matter.variable} min-h-screen bg-[#0b0d14] antialiased`}
    >
      <head>
        <JsonLd data={[organizationSchema, webSiteSchema]} />
        <link
          rel="preload"
          href="/footerlogo9.glb"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[#0b0d14] flex flex-col text-white relative">
        <I18nProvider>
          <GlobalLoader />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
