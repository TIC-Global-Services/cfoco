'use client';

import React from 'react';
import { PortableText as PortableTextComponent, PortableTextComponents } from '@portabletext/react';
import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/image';

function getImageDimensions(value: any) {
  const ref = value?.asset?._ref || value?.asset?._id;
  if (ref) {
    const match = ref.match(/-(\d+)x(\d+)-/);
    if (match) {
      return {
        width: parseInt(match[1], 10),
        height: parseInt(match[2], 10),
      };
    }
  }
  if (value?.asset?.metadata?.dimensions) {
    return value.asset.metadata.dimensions;
  }
  return { width: 1200, height: 800 };
}

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: any) => {
      const imageUrl = value?.asset?.url || (urlForImage(value)?.url() ?? null);
      if (!imageUrl) return null;

      const dimensions = getImageDimensions(value);

      return (
        <figure className="my-10 flex flex-col items-center">
          <div className="overflow-hidden max-w-full">
            <Image
              src={imageUrl}
              alt={value.alt || 'CFOCO Blog Image'}
              width={dimensions.width}
              height={dimensions.height}
              className="w-auto h-auto max-w-full max-h-[650px] object-contain rounded-2xl mx-auto"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-3 text-center text-xs tracking-wider uppercase text-neutral-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      const target = !value.href.startsWith('/') ? '_blank' : undefined;
      return (
        <a
          href={value.href}
          rel={rel}
          target={target}
          className="text-[#e9b949] underline decoration-[#e9b949]/40 underline-offset-4 transition-colors hover:text-[#ffd67a] hover:decoration-[#ffd67a]"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    code: ({ children }) => (
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-[#e9b949]">
        {children}
      </code>
    ),
  },
  block: {
    h1: ({ children }) => (
      <h1 className="mt-12 mb-6 text-3xl sm:text-4xl font-bold tracking-tight text-white">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 text-2xl sm:text-3xl font-semibold tracking-tight text-white border-b border-white/10 pb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 text-xl sm:text-2xl font-medium tracking-tight text-neutral-100">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-6 mb-2 text-lg font-medium text-neutral-200">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="mb-6 leading-relaxed text-neutral-300 text-base sm:text-lg font-light">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-[#e9b949] pl-6 italic text-neutral-200 bg-white/[0.02] py-4 rounded-r-xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 ml-6 list-disc space-y-2 text-neutral-300">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 ml-6 list-decimal space-y-2 text-neutral-300">
        {children}
      </ol>
    ),
  },
};

interface PortableTextProps {
  value: any;
}

export default function PortableText({ value }: PortableTextProps) {
  if (!value) return null;
  return (
    <div className="prose prose-invert max-w-none">
      <PortableTextComponent value={value} components={portableTextComponents} />
    </div>
  );
}
