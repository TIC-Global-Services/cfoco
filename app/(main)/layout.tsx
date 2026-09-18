import React from "react";
import Navbar from "@/reusable/Navbar";
import Footer from "@/reusable/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-x-clip min-h-screen w-full text-white flex flex-col pt-24">

      <div
        className="fixed inset-0 -z-10 bg-cover bg-bottom bg-no-repeat"
        style={{ backgroundImage: "url('/bg-image-new.png')" }}
        aria-hidden="true"
      />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
