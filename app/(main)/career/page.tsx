import React from 'react'
import Hero from '@/components/career/hero'
import Reachoutanyway from '@/components/career/reachout'
import WhatWeRefuse from '@/components/career/whatwerefuse'
import Reveal from '@/reusable/Reveal'

const page = () => {
  return (
    <div className="relative z-10 w-full flex-1 flex flex-col">
      <Reveal>
        <Hero/>
      </Reveal>
      <Reveal>
        <WhatWeRefuse/>
      </Reveal>
      <Reveal>
        <Reachoutanyway/>
      </Reveal>
    </div>
  )
}

export default page