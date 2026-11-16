import React from 'react';
import Hero from '@/components/location/hero';
import StepInside from '@/components/location/stepinside';
import Reviews from '@/components/location/reviews';
import Reveal from '@/reusable/Reveal';
import { getAllLocations, getLocationReviewsSection } from '@/sanity/lib/locations';

export const revalidate = 60;

const LocationPage = async () => {
  const [locations, reviewsSection] = await Promise.all([
    getAllLocations(),
    getLocationReviewsSection(),
  ]);

  // Overall reviews count from Sanity's separate section or calculated from locations (default 11,897)
  const totalCount =
    reviewsSection?.overallReviewCount ??
    (locations.reduce((sum, loc) => sum + (loc.reviewCount || 0), 0) || 11897);

  // The 6 general customer reviews from Sanity's separate reviews section
  const reviewsList =
    reviewsSection?.reviews && reviewsSection.reviews.length > 0
      ? reviewsSection.reviews.map((rev, i) => ({
          id: rev.id || `rev-${i}`,
          rating: rev.rating || 5,
          quote: rev.quote,
          authorName: rev.authorName,
          avatarColor: rev.avatarColor,
        }))
      : undefined;

  const avgRating =
    locations.length > 0
      ? locations.reduce((sum, loc) => sum + (loc.rating || 4.8), 0) /
        locations.length
      : 4.8;

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal>
        <StepInside locations={locations} />
      </Reveal>
      <Reviews
        reviews={reviewsList}
        reviewCount={totalCount}
        rating={avgRating}
        heading={reviewsSection?.title}
      />
    </main>
  );
};

export default LocationPage;