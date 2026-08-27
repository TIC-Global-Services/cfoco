import React from 'react';

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
            <span className="block text-[3.125rem] leading-none">What We Refuse</span>
            <span className="block text-[4.375rem] leading-none">To Compromise</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
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

              {/* BOTTOM BLOCK (Apply Now section) */}
              <div className="w-[45%] bg-[#0a0a0f] border-b border-l border-r border-[#0066FF] rounded-b-[1.3rem] rounded-tr-none p-6 sm:p-8 pt-6 relative z-10">
                
                {/* Hide left half of Top Block's bottom border */}
                <div className="absolute top-[-1px] left-[1px] right-[1px] h-[2px] bg-[#0a0a0f]" />

                <button className="relative z-20 text-white hover:text-[#F6B90B] transition-colors flex items-center gap-2 text-sm sm:text-lg font-medium group">
                  Apply Now 
                  <span className="text-lg transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                </button>
              </div>

              {/* JOB TITLE (In the notch) */}
              <div className="absolute bottom-6 right-6 sm:right-2 flex items-start justify-start w-[50%] z-0 ">
                <span className="text-[#F6B90B] font-bold text-lg sm:text-2xl text-right leading-tight">
                  {job.role}
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>
      
      {/* Marquee Text */}
      <div className="mt-24 w-full overflow-hidden relative z-0">
        <div className="animate-marquee">
          <span className="text-transparent text-[4rem] sm:text-[6rem] md:text-[8rem] font-bold tracking-tight uppercase px-4" 
                style={{ WebkitTextStroke: '2px #F6B90B' }}>
            {marqueetext}
          </span>
          <span className="text-transparent text-[4rem] sm:text-[6rem] md:text-[8rem] font-bold tracking-tight uppercase px-4" 
                style={{ WebkitTextStroke: '2px #F6B90B' }}>
            {marqueetext}
          </span>
          <span className="text-transparent text-[4rem] sm:text-[6rem] md:text-[8rem] font-bold tracking-tight uppercase px-4" 
                style={{ WebkitTextStroke: '2px #F6B90B' }}>
            {marqueetext}
          </span>
          <span className="text-transparent text-[4rem] sm:text-[6rem] md:text-[8rem] font-bold tracking-tight uppercase px-4" 
                style={{ WebkitTextStroke: '2px #F6B90B' }}>
            {marqueetext}
          </span>
        </div>
      </div>
    </section>
  );
};

export default WhatWeRefuse;