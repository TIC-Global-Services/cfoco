import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Experience from "@/components/home/Experience";
import "./home.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CFOCO — From Fresh To The Final Crunch",
  description: "Fresh chicken, a blend of flavors, and the future of fast food.",
};

export default function Home() {
  return (
    <main className={`home-root ${geistSans.variable}`}>
      <Experience />
    </main>
  );
}
