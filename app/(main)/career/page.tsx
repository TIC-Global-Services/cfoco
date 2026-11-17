import React from 'react'
import Hero from '@/components/career/hero'
import Reachoutanyway from '@/components/career/reachout'
import OpenPositions from '@/components/career/OpenPositions'
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
      <OpenPositions jobs={jobsFromSanity}/>
      <Reveal>
        <Reachoutanyway/>
      </Reveal>
    </div>
  )
}

export default page
