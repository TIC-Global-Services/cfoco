import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { matter } from "@/font/fonts";
import GlobalLoader from "@/components/common/Loader";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CFOCO - Crispy Since 2011",
  description: "CFOCO is a crispy chicken kitchen that has been serving delicious fried chicken since 2011. Our secret recipe and commitment to quality have made us a favorite among chicken lovers.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d14",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${matter.variable} min-h-screen bg-[#0b0d14] antialiased`}
    >
      <body className="min-h-screen bg-[#0b0d14] flex flex-col text-white">
        <GlobalLoader />
        {children}
      </body>
    </html>
  );
}
