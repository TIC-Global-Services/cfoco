"use client"
import { ArrowUpRight, MoveUpRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const jobs = [
  {
    location: "Bordeaux Centre",
    type: "Full & Part-Time",
    role: "Delivery Coordinator",
    youare: "A Natural Leader, Organized, Not The Office.",
    nicetohave: "Team-Lead Or Supervisory Experience In Food/Retail.",
    hours: "Full-Time, Rotating Shifts.",
    pay: "Competitive Salary + Progression Path To Restaurant Manager."
  },
  {
    location: "Mérignac",
    type: "Full-Time",
    role: "Store Supervisor",
    youare: "A Natural Leader, Organized, Not The Office.",
    nicetohave: "Team-Lead Or Supervisory Experience In Food/Retail.",
    hours: "Full-Time, Rotating Shifts.",
    pay: "Competitive Salary + Progression Path To Restaurant Manager."
  }
];

const marqueetext = "Your Best Job Yet Starts Here";


const WhatWeRefuse = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current) return;

      setActiveSlide((prev) => {
        const nextSlide = (prev + 1) % jobs.length;
        const clientWidth = scrollRef.current!.clientWidth;

        scrollRef.current!.scrollTo({
          left: nextSlide * clientWidth,
          behavior: "smooth",
        });

        return nextSlide;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, clientWidth } = scrollRef.current;

    const newIndex = Math.round(scrollLeft / clientWidth);

    if (newIndex !== activeSlide && newIndex >= 0 && newIndex < jobs.length) {
      setActiveSlide(newIndex);
    }
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;

    const clientWidth = scrollRef.current.clientWidth;

    scrollRef.current.scrollTo({
      left: index * clientWidth,
      behavior: "smooth",
    });

    setActiveSlide(index);
  };
  const clipPath = "polygon(0 0, 100% 0, 100% calc(100% - 75px), 50% calc(100% - 75px), 50% 100%, 0 100%)";

  return (
    <section className="relative w-full py-20 overflow-hidden font-sans">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          display: inline-flex;
          white-space: nowrap;
        }
      `}</style>

      <div className="px-4 sm:px-[5%] relative z-10">

        {/* Title */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-[#F6B90B] font-bold">
            <span className="block text-3xl md:text-[3.125rem] leading-none">What We Refuse</span>
            <span className="block text-3xl md:text-[4.375rem] leading-none">To Compromise</span>
          </h2>
        </div>

        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-4 max-w-6xl mx-auto">
          {jobs.map((job, idx) => (
            <div key={idx} className="relative w-full flex flex-col h-full group">

              {/* TOP BLOCK */}
              <div className="w-full bg-[#0a0a0f] border border-[#0066FF] rounded-t-[1.3rem] rounded-br-[1.3rem] rounded-bl-none p-6 sm:p-8 pb-4 relative z-0">
                <h3 className="text-white text-xl sm:text-2xl font-semibold mb-6">
                  {job.location} · {job.type}
                </h3>

                <div className="text-sm sm:text-base">
                  <p className="text-white/90">
                    <span className="text-[#F6B90B] font-semibold mr-2">You Are:</span>
                    {job.youare}
                  </p>
                  <p className="text-white/90">
                    <span className="text-[#F6B90B] font-semibold mr-2">Nice To Have:</span>
                    {job.nicetohave}
                  </p>
                  <p className="text-white/90">
                    <span className="text-[#F6B90B] font-semibold mr-2">Hours:</span>
                    {job.hours}
                  </p>
                  <p className="text-white/90 leading-snug">
                    <span className="text-[#F6B90B] font-semibold mr-2">Pay:</span>
                    {job.pay}
                  </p>
                </div>
              </div>

              {/* BOTTOM BLOCK (Apply Now section with inverted curve) */}
              <div className="w-[45%] sm:w-[42%] bg-[#0a0a0f] border-b border-l border-r border-[#0066FF] rounded-b-[1.3rem] p-6 sm:p-6 pt-6 relative z-10">

                {/* Seamless top connection to hide top card's bottom border under tab */}
                <div className="absolute -top-[2px] -left-[1px] -right-[1px] h-[4px] bg-[#0a0a0f]" />

                {/* Inverted Concave Corner Curve */}
                <svg
                  className="absolute -top-[1px] left-full w-[24px] h-[24px] pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  {/* Dark background fill to cover corner space */}
                  <path d="M 0 0 L 0 24 A 24 24 0 0 1 24 0 Z" fill="#0a0a0f" />
                  {/* Continuous blue border along the concave curve */}
                  <path
                    d="M 0 24 A 24 24 0 0 1 24 0"
                    fill="none"
                    stroke="#0066FF"
                    strokeWidth="1.5"
                  />
                </svg>

                <button className="relative z-20 text-white hover:text-[#F6B90B] transition-colors flex items-center gap-2 text-sm sm:text-lg font-medium group">
                  Apply Now
                  <ArrowUpRight size={15} />
                </button>
              </div>

              {/* JOB TITLE (In the notch) */}
              <div className="absolute bottom-6 right-2 sm:right-4 flex items-start justify-start w-[50%] z-0 pointer-events-none">
                <span className="text-[#F6B90B] font-bold text-lg sm:text-2xl text-right leading-tight">
                  {job.role}
                </span>
              </div>

            </div>
          ))}
        </div>
        <div className="md:hidden w-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 touch-pan-x"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {jobs.map((job, idx) => (
              <div
                key={idx}
                className="w-full shrink-0 snap-center"
              >
                <div className="relative w-full flex flex-col">

                  {/* TOP BLOCK */}
                  <div className="w-full bg-[#0a0a0f] border border-[#0066FF] rounded-t-[1.3rem] rounded-br-[1.3rem] rounded-bl-none p-6 pb-4">

                    <h3 className="text-white text-xl font-semibold mb-6">
                      {job.location} · {job.type}
                    </h3>

                    <div className="text-sm">
                      <p className="text-white/90">
                        <span className="text-[#F6B90B] font-semibold mr-2">
                          You Are:
                        </span>
                        {job.youare}
                      </p>

                      <p className="text-white/90">
                        <span className="text-[#F6B90B] font-semibold mr-2">
                          Nice To Have:
                        </span>
                        {job.nicetohave}
                      </p>

                      <p className="text-white/90">
                        <span className="text-[#F6B90B] font-semibold mr-2">
                          Hours:
                        </span>
                        {job.hours}
                      </p>

                      <p className="text-white/90 leading-snug">
                        <span className="text-[#F6B90B] font-semibold mr-2">
                          Pay:
                        </span>
                        {job.pay}
                      </p>
                    </div>
                  </div>

                  {/* APPLY BLOCK */}
                  <div className="w-[48%] bg-[#0a0a0f] border-b border-l border-r border-[#0066FF] rounded-b-[1.3rem] p-5 relative z-10">

                    <div className="absolute -top-[2px] -left-[1px] -right-[1px] h-[4px] bg-[#0a0a0f]" />

                    <svg
                      className="absolute -top-[1px] left-full w-[24px] h-[24px] pointer-events-none"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M 0 0 L 0 24 A 24 24 0 0 1 24 0 Z"
                        fill="#0a0a0f"
                      />

                      <path
                        d="M 0 24 A 24 24 0 0 1 24 0"
                        fill="none"
                        stroke="#0066FF"
                        strokeWidth="1.5"
                      />
                    </svg>

                    <button className="relative z-20 text-white flex items-center gap-2 text-sm font-medium">
                      Apply Now
                      <ArrowUpRight size={15} />
                    </button>
                  </div>

                  {/* JOB TITLE */}
                  <div className="absolute bottom-5 right-2 flex items-start justify-end w-[70%] md:w-[50%] pointer-events-none">
                    <span className="text-[#F6B90B] font-bold text-xl text-right leading-tight">
                      {job.role}
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* SLIDER INDICATORS */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {jobs.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${activeSlide === index
                  ? "w-7 bg-[#CC1518]"
                  : "w-2 bg-[#CC1518]/40 hover:bg-white/50"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Marquee Text */}
      <div className="mt-24 w-full overflow-hidden relative z-0">
        <div className="animate-marquee">
          <span className="text-transparent text-[4rem] sm:text-[6rem] md:text-[8rem] font-bold tracking-tight uppercase px-4"
            style={{ WebkitTextStroke: '1px #F6B90B' }}>
            {marqueetext}
          </span>
          <span className="text-transparent text-[4rem] sm:text-[6rem] md:text-[8rem] font-bold tracking-tight uppercase px-4"
            style={{ WebkitTextStroke: '1px #F6B90B' }}>
            {marqueetext}
          </span>
          <span className="text-transparent text-[4rem] sm:text-[6rem] md:text-[8rem] font-bold tracking-tight uppercase px-4"
            style={{ WebkitTextStroke: '1px #F6B90B' }}>
            {marqueetext}
          </span>
          <span className="text-transparent text-[4rem] sm:text-[6rem] md:text-[8rem] font-bold tracking-tight uppercase px-4"
            style={{ WebkitTextStroke: '1px #F6B90B' }}>
            {marqueetext}
          </span>
        </div>
      </div>
    </section>
  );
};

export default WhatWeRefuse;