import React from "react";
import Navbar from "@/reusable/Navbar";
import Footer from "@/reusable/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-white flex flex-col pt-24"
      style={{ backgroundImage: "url('/bg-image.png')" }}
    >
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
