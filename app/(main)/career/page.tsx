import React from 'react'
import Hero from '@/components/career/hero'
import Reachoutanyway from '@/components/career/reachout'
import WhatWeRefuse from '@/components/career/whatwerefuse'
import Reveal from '@/reusable/Reveal'
import BuildYourFuture from '@/components/career/buildyourfuture'
import { getJobPosts } from '@/sanity/lib/client'

const page = async () => {
  const jobsFromSanity = await getJobPosts()

  return (
    <div className="relative z-10 w-full flex-1 flex flex-col">
      <Reveal>
        <Hero/>
      </Reveal>
      <BuildYourFuture/>
      <WhatWeRefuse jobs={jobsFromSanity}/>
      <Reveal>
        <Reachoutanyway/>
      </Reveal>
    </div>
  )
}

export default page
