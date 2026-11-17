import React from 'react';
import Hero from '@/components/location/hero';
import StepInside from '@/components/location/stepinside';
import Reviews from '@/components/location/reviews';
import Reveal from '@/reusable/Reveal';
import { getAllLocations, getReviewsData } from '@/sanity/lib/locations';
import LocationGallery from '@/components/location/LocationGallery';

export const revalidate = 60;

const LocationPage = async () => {
  const [locations, reviewsData] = await Promise.all([
    getAllLocations(),
    getReviewsData(),
  ]);

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal>
        <StepInside locations={locations} />
      </Reveal>
      <LocationGallery/>
      <Reviews
        reviews={reviewsData.reviews}
        reviewCount={reviewsData.reviewCount}
        rating={reviewsData.rating}
        heading={reviewsData.heading}
      />
    </main>
  );
};

export default LocationPage;
