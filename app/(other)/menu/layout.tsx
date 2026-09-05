import React from "react";
import PageLayout from "@/reusable/PageLayout";
import NavbarOther from "@/reusable/Navbar-other";
import FooterOther from "@/reusable/Footer-other";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div
      className="relative min-h-screen w-full bg-cover bg-bottom bg-no-repeat bg-fixed text-white flex flex-col pt-24"
      style={{ backgroundImage: "url('/menu_bgimage.png')" }}
    >
      <NavbarOther />
      {children}
      <FooterOther />
    </div>
  );
}
