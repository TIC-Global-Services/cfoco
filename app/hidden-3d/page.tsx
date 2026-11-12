import Experience from '@/components/home/Experience'
import { Geist } from 'next/font/google';

import React from 'react'
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const page = () => {
    return (
        <main className={`home-root ${geistSans.variable}`}>
            <Experience />
        </main>
    )
}

export default page