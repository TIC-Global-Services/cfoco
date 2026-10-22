'use client';

import React from 'react';
import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

export function Studio() {
  return <NextStudio config={config} />;
}
