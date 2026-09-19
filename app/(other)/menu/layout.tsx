import React from "react";
import NavbarOther from "@/reusable/Navbar-other";
import FooterOther from "@/reusable/Footer-other";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen w-full overflow-x-hidden bg-[#0b0d14] text-white flex flex-col pt-24">

      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/menu_bgimage-new.png')",
        }}
        aria-hidden="true"
      />

      <NavbarOther />

      <main className="relative flex-1 bg-transparent">
        {children}
      </main>

      <FooterOther />
    </div>
  );
}