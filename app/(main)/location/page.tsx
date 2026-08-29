import React from 'react'
import Hero from '@/components/location/hero'
import StepInside from '@/components/location/stepinside'
import Reviews from '@/components/location/reviews'
import Reveal from '@/reusable/Reveal'

const page = () => {
  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      <Reveal>
        <Hero/>
      </Reveal>
      <Reveal>
        <StepInside/>
      </Reveal>
      <Reveal>
        <Reviews/>
      </Reveal>
    </main>
  )
}

export default page