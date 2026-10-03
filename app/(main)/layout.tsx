import React from "react";
import Navbar from "@/reusable/Navbar";
import Footer from "@/reusable/Footer";
import Particles from "@/reusable/Particles";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen w-full overflow-x-clip bg-[#0b0d14] text-white flex flex-col pt-24">

      {/* Background Image */}
      <div
        className="fixed inset-0 z-[-20] bg-cover bg-bottom bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/bg-image-new.png')",
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

      <Navbar />

      <main className="relative flex-1 bg-transparent">
        {children}
      </main>

      <Footer />
    </div>
  );
}