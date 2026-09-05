import React from "react";
import Navbar from "@/reusable/Navbar";
import Footer from "@/reusable/Footer";
import NavbarOther from "./Navbar-other";
import FooterOther from "./Footer-other";

interface PageLayoutProps {
  children: React.ReactNode;
  bgImage?: string;
  bgPosition?: string;
  className?: string;
}

export default function PageLayout({
  children,
  bgImage = "/bg-image.png",
  bgPosition = "bg-center",
  className = "",
}: PageLayoutProps) {
  return (
    <div
      className={`relative min-h-screen w-full bg-cover ${bgPosition} bg-no-repeat bg-fixed text-white flex flex-col pt-24 ${className}`}
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <NavbarOther />
      <div className="flex-1 flex flex-col">{children}</div>
      <FooterOther />
    </div>
  );
}
