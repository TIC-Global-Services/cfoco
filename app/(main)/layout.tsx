import React from "react";
import Navbar from "@/reusable/Navbar";
import Footer from "@/reusable/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen w-full overflow-x-clip bg-[#0b0d14] text-white flex flex-col pt-24">

      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-bottom bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/bg-image-new.png')",
        }}
        aria-hidden="true"
      />

      <Navbar />

      <main className="relative flex-1 bg-transparent">
        {children}
      </main>

      <Footer />
    </div>
  );
}