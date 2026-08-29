import React from 'react'
import ContactForm from '@/components/contact/contactForm'
import Hero from '@/components/contact/hero'
import Reveal from '@/reusable/Reveal'

const page = () => {
  return (
    <div className="relative z-10 w-full flex-1 flex flex-col">
      <Reveal>
        <Hero/>
      </Reveal>
      <Reveal>
        <ContactForm/>
      </Reveal>
    </div>
  )
}

export default page