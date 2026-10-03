import React from "react";
import NavbarOther from "@/reusable/Navbar-other";
import FooterOther from "@/reusable/Footer-other";
import Particles from "@/reusable/Particles";

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
      
      {/* Particles Layer */}
      <div className="fixed inset-0 pointer-events-none z-[-10]">
        <Particles
          particleColors={["#10214f"]}
          particleCount={900}
          particleSpread={40}
          speed={0.8}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      <NavbarOther />

      <main className="relative flex-1 bg-transparent">
        {children}
      </main>

      <FooterOther />
    </div>
  );
}