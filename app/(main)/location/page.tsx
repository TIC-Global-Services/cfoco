import Hero from '@/components/location/hero'
import StepInside from '@/components/location/stepinside'
import Reviews from '@/components/location/reviews'
import React from 'react'

const page = () => {
  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <Hero/>
      <StepInside/>
      <Reviews/>
    </main>
  )
}

export default page