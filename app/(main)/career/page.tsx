import React from 'react';
import type { Metadata } from 'next';
import Hero from '@/components/career/hero';
import Reachoutanyway from '@/components/career/reachout';
import OpenPositions from '@/components/career/OpenPositions';
import Reveal from '@/reusable/Reveal';
import BuildYourFuture from '@/components/career/buildyourfuture';
import JsonLd from '@/components/seo/JsonLd';
import { getJobPosts } from '@/sanity/lib/client';
import { getLocalized } from '@/sanity/lib/localized';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cfoco.com';

export const metadata: Metadata = {
  title: 'Careers | Join the CFOCO Team — Restaurant & Kitchen Jobs',
  description:
    'Build your future with CFOCO. Explore rewarding restaurant career paths across our French kitchens, from Store Supervisors and Delivery Coordinators to Kitchen Team Leads.',
  alternates: {
    canonical: '/career',
  },
  openGraph: {
    title: 'Careers | Join the CFOCO Team — Restaurant & Kitchen Jobs',
    description:
      'Join an energetic, passion-driven team redefining fast food in France. Competitive pay, progression paths, and great kitchen culture.',
    url: `${siteUrl}/career`,
    type: 'website',
    images: [
      {
        url: '/cfc_ambience.jpg',
        width: 1200,
        height: 630,
        alt: 'CFOCO Restaurant Career & Kitchen Culture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers | Join the CFOCO Team in France',
    description:
      'Explore restaurant careers, management positions, and competitive compensation at CFOCO.',
    images: ['/cfc_ambience.jpg'],
  },
};

const CareerPage = async () => {
  const jobsFromSanity = await getJobPosts();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Careers',
        item: `${siteUrl}/career`,
      },
    ],
  };

  const jobPostingsJsonLd = jobsFromSanity.map((job) => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: getLocalized(job.role, 'en') || 'Restaurant Team Member',
    description: `${getLocalized(job.youare, 'en')} ${getLocalized(job.nicetohave, 'en')}`,
    datePosted: new Date().toISOString().split('T')[0],
    validThrough: '2027-12-31',
    employmentType: job.type ? String(getLocalized(job.type, 'en')).toUpperCase().replace(/[^A-Z]/g, '_') : 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'CFOCO',
      sameAs: siteUrl,
      logo: `${siteUrl}/logo.png`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: typeof job.location === 'string' ? job.location : 'Bordeaux',
        addressCountry: 'FR',
      },
    },
  }));

  return (
    <div className="relative z-10 w-full flex-1 flex flex-col">
      <JsonLd data={[breadcrumbJsonLd, ...jobPostingsJsonLd]} />
      <Reveal>
        <Hero />
      </Reveal>
      <BuildYourFuture />
      <OpenPositions jobs={jobsFromSanity} />
      <Reveal>
        <Reachoutanyway />
      </Reveal>
    </div>
  );
};

export default CareerPage;
