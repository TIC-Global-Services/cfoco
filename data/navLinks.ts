export interface NavLink {
  label: string;
  href: string;
}

/** main navigation, shared by the site navbar and the 3D home navbar */
export const NAV_ITEMS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Our Story", href: "/our-story" },
  { label: "Location", href: "/location" },
  { label: "Menu", href: "/menu" },
  { label: "Career", href: "/career" },
  { label: "Blogs", href: "/blogs" },
];

export const NAV_CTA: NavLink = { label: "Contact Us", href: "/contact" };

/** footer navigation, shared by the site footer and the 3D home footer */
export const FOOTER_LINKS: NavLink[] = [
  { label: "Menu", href: "/menu" },
  { label: "Our Story", href: "/our-story" },
  { label: "Franchise", href: "/franchise" },
  { label: "Policies", href: "/policies" },
  { label: "Contact Us", href: "/contact" },
  { label: "Blogs", href: "/blogs" },
];
