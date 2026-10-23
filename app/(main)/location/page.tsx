import React from 'react';
import Hero from '@/components/location/hero';
import StepInside from '@/components/location/stepinside';
import Reviews from '@/components/location/reviews';
import Reveal from '@/reusable/Reveal';
import { getAllLocations } from '@/sanity/lib/locations';

export const revalidate = 60;

const LocationPage = async () => {
  const locations = await getAllLocations();

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal>
        <StepInside locations={locations} />
      </Reveal>
      <Reviews />
    </main>
  );
};

export default LocationPage;