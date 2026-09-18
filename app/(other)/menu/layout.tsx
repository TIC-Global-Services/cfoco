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
      <div className="relative min-h-screen w-full text-white flex flex-col pt-24">
      
        <div
          className="fixed inset-0 -z-10 bg-cover bg-bottom bg-no-repeat"
          style={{ backgroundImage: "url('/menu_bgimage-new.png')" }}
          aria-hidden="true"
        />
        <NavbarOther />
        {children}
        <FooterOther />
      </div>
    );
}
