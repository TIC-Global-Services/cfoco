'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Reveal from '@/reusable/Reveal';

export default function BlogHeader() {
  const { t } = useTranslation('blog');

  return (
    <Reveal>
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e9b949]/30 bg-[#e9b949]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#e9b949] mb-6">
          <span>{t('header.badge', 'CFOCO Chronicles')}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
          {t('header.title', 'Stories from the')}{' '}
          <span className="bg-gradient-to-r from-white via-[#ffd67a] to-[#e9b949] bg-clip-text text-transparent">
            {t('header.titleHighlight', 'Heart of CFOCO')}
          </span>
        </h1>
        <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed">
          {t(
            'header.subtitle',
            'Explore our latest journeys through high-altitude origins, artisan roasting refinements, sensory cafe spaces, and culinary culture.'
          )}
        </p>
      </div>
    </Reveal>
  );
}
