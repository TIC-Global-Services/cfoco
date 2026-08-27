"use client";

import React from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, ArrowUpRight, ChevronDown } from 'lucide-react';

const ContactForm = () => {
  return (
    <section className="relative w-full  px-4 sm:px-6 lg:px-[5%] pb-20 pt-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Left Side: Contact Information Card */}
        <div className="lg:col-span-2 bg-[#111113] border border-[#1e3a8a] rounded-[2rem] p-8 sm:px-10 flex flex-col shadow-2xl h-fit py-16">
          <div className="mb-10">
            <Image
              src="/cfc_logo.svg"
              alt="CFC Logo"
              width={140}
              height={45}
              className="w-auto h-8 sm:h-10 object-contain"
            />
          </div>

          <div className="mb-5">
            <h2 className="text-[#CC1518] text-[1.750rem] font-bold mb-2">
              Contact Information
            </h2>
            <p className="text-white/90 text-lg font-medium">
              Say something to start a live chat!
            </p>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-start gap-5">
              <Phone className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <span className="text-white font-light text-base">
                +1012 3456 789
              </span>
            </div>
            <div className="flex items-start gap-5">
              <Mail className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <span className="text-white font-light text-base">
                demo@gmail.com
              </span>
            </div>
            <div className="flex items-start gap-5">
              <MapPin className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <span className="text-white font-light text-base leading-relaxed">
                132 Dartmouth Street Boston, Massachusetts 02156 United States
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Fields */}
        <div className="lg:col-span-3 flex flex-col py-4 sm:py-6 lg:pl-4">
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">Name</label>
                <input
                  type="text"
                  placeholder="john smith"
                  className="w-full bg-transparent border border-[#1e3a8a] rounded-full px-5 py-3.5 text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Mail Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">Mail</label>
                <input
                  type="email"
                  placeholder="john.smith@email.com"
                  className="w-full bg-transparent border border-[#1e3a8a] rounded-full px-5 py-3.5 text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Phone Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">phone</label>
                <input
                  type="tel"
                  placeholder="+243545353"
                  className="w-full bg-transparent border border-[#1e3a8a] rounded-full px-5 py-3.5 text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Subject Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">select subject</label>
                <div className="relative w-full">
                  <select
                    className="w-full bg-transparent border border-[#1e3a8a] rounded-full px-5 py-3.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#111113] text-white">General enquiry</option>
                    <option value="general" selected className="bg-[#111113] text-white">General enquiry</option>
                    <option value="support" className="bg-[#111113] text-white">Support</option>
                    <option value="partnership" className="bg-[#111113] text-white">Partnership</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-white/70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-white font-medium text-sm ml-2">your message</label>
              <textarea
                placeholder="tell us about your enquiry"
                rows={7}
                className="w-full bg-transparent border border-[#1e3a8a] rounded-[1.5rem] p-5 text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="group flex items-center gap-3 bg-[#a3a3a3] hover:bg-[#d4d4d4] text-white pl-6 pr-2 py-2 rounded-full transition-all duration-300"
              >
                <span className="font-semibold text-sm">Submit</span>
                <div className="bg-[#404040] group-hover:bg-[#171717] p-2.5 rounded-full flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;