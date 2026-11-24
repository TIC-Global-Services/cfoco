import React from 'react';
import type { Metadata } from 'next';
import Experience from '@/components/home/Experience';
import { Geist } from 'next/font/google';
import '../home.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '3D Experience | CFOCO',
  robots: {
    index: false,
    follow: false,
  },
};

const page = () => {
  return (
    <main className={`home-root ${geistSans.variable}`}>
      <Experience />
    </main>
  );
};

export default page;
