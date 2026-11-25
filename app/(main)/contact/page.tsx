import React from 'react';
import type { Metadata } from 'next';
import ContactForm from '@/components/contact/ContactForm';
import Hero from '@/components/contact/hero';
import Reveal from '@/reusable/Reveal';
import JsonLd from '@/components/seo/JsonLd';
import ContactHero from '@/components/contact/ContactHero';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cfoco.com';

export const metadata: Metadata = {
  title: 'Contact Us | CFOCO Customer Support & Inquiries',
  description:
    'Have a question, feedback, catering inquiry, or franchise interest? Reach out to the CFOCO team today. We are always ready to assist you.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | CFOCO Customer Support & Inquiries',
    description:
      'Have questions or feedback? Connect with the CFOCO team today. We look forward to hearing from you.',
    url: `${siteUrl}/contact`,
    type: 'website',
    images: [
      {
        url: '/interior_bg.png',
        width: 1200,
        height: 630,
        alt: 'CFOCO Restaurant Dining Space & Guest Support',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | CFOCO Customer Support',
    description:
      'Get in touch with CFOCO for feedback, inquiries, or catering support.',
    images: ['/interior_bg.png'],
  },
};

const ContactPage = () => {
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact CFOCO',
    description: 'Get in touch with the CFOCO team for customer service, feedback, and general inquiries.',
    url: `${siteUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'CFOCO',
      telephone: '+33 5 56 00 00 00',
      email: 'contact@cfoco.fr',
      url: siteUrl,
    },
  };

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
        name: 'Contact',
        item: `${siteUrl}/contact`,
      },
    ],
  };

  return (
    <div className="relative z-10 w-full flex-1 flex flex-col">
      <JsonLd data={[contactJsonLd, breadcrumbJsonLd]} />
      <Reveal>
        <ContactHero  />
      </Reveal>
      <Reveal>
        <ContactForm />
      </Reveal>
    </div>
  );
};

export default ContactPage;
