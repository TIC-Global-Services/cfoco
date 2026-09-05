"use client";

import React from "react";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowUpRight, ChevronDown } from "lucide-react";

const ContactForm = () => {
  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-[5%] pb-20 pt-10">
      <style>{`
        .neon-line-glow-1 {
          stroke-dasharray: 22 78;
          animation: moveNeonBorder 3.5s linear infinite;
          filter: drop-shadow(0 0 6px #0288FF)
  drop-shadow(0 0 14px rgba(2, 136, 255, 0.9))
  drop-shadow(0 0 22px rgba(2, 136, 255, 0.6));
        }
        .neon-line-core-1 {
          stroke-dasharray: 22 78;
          animation: moveNeonBorder 3.5s linear infinite;
          filter: drop-shadow(0 0 2px #ffffff);
        }
        .neon-line-glow-2 {
          stroke-dasharray: 22 78;
          animation: moveNeonBorder 3.5s linear infinite;
          animation-delay: -1.75s;
          filter: drop-shadow(0 0 6px #0288FF)
  drop-shadow(0 0 14px rgba(2, 136, 255, 0.9))
  drop-shadow(0 0 22px rgba(2, 136, 255, 0.6));
        }
        .neon-line-core-2 {
          stroke-dasharray: 22 78;
          animation: moveNeonBorder 3.5s linear infinite;
          animation-delay: -1.75s;
          filter: drop-shadow(0 0 2px #ffffff);
        }
        @keyframes moveNeonBorder {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .form-glow-input {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px rgba(30, 58, 138, 0.15);
        }
        .form-glow-input:hover {
          border-color: #60a5fa;
          box-shadow: 0 0 16px rgba(96, 165, 250, 0.35), inset 0 0 8px rgba(96, 165, 250, 0.1);
        }
        .form-glow-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 22px rgba(59, 130, 246, 0.55), 0 0 8px rgba(96, 165, 250, 0.3);
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 justify-center items-center">
        {/* Left Side: Contact Information Card with Moving Neon Border */}
        <div className="contact-info-card mb-20 lg:col-span-2 bg-transparent border border-[#1e3a8a]/40 rounded-[20px] p-6 sm:px-10 flex flex-col shadow-[0_0_30px_rgba(2,136,255,0.15)] py-20 relative overflow-hidden transition-shadow duration-300">
          {/* Moving Neon Border SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none rounded-[20px] overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="neon-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0288FF" stopOpacity="0.2" />
                <stop offset="35%" stopColor="#0288FF" stopOpacity="1" />
                <stop offset="65%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#0288FF" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Static Base Track */}
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="20"
              ry="20"
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              vectorEffect="non-scaling-stroke"
            />

            {/* Neon Glow Outer Line 1 */}
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="20"
              ry="20"
              fill="none"
              stroke="url(#neon-border-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              pathLength="100"
              vectorEffect="non-scaling-stroke"
              className="neon-line-glow-1"
            />

            {/* Sharp Core Neon Line 1 */}
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="20"
              ry="20"
              fill="none"
              stroke="url(#neon-border-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength="100"
              vectorEffect="non-scaling-stroke"
              className="neon-line-core-1"
            />

            {/* Neon Glow Outer Line 2 */}
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="20"
              ry="20"
              fill="none"
              stroke="url(#neon-border-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              pathLength="100"
              vectorEffect="non-scaling-stroke"
              className="neon-line-glow-2"
            />

            {/* Sharp Core Neon Line 2 */}
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="20"
              ry="20"
              fill="none"
              stroke="url(#neon-border-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength="100"
              vectorEffect="non-scaling-stroke"
              className="neon-line-core-2"
            />
          </svg>

          <div className="mb-10 relative z-10">
            <Image
              src="/cfc_logo.svg"
              alt="CFC Logo"
              width={140}
              height={735}
              className="w-auto h-8 sm:h-10 object-cover"
            />
          </div>

          <div className="mb-2 relative z-10">
            <h2 className="text-[#CC1518] text-2xl md:text-[1.750rem] font-bold mb-2 leading-none">
              Contact Information
            </h2>
            <p className="text-white text-lg font-medium">
              Say something to start a live chat!
            </p>
          </div>

          <div className="flex flex-col gap-4 flex-1 relative z-10">
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
              <span className="text-white font-light text-base leading-[1.2] tracking-tight">
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
                  className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-2xl px-5 py-3.5 text-white text-sm placeholder-white/50 focus:outline-none"
                />
              </div>

              {/* Mail Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">Mail</label>
                <input
                  type="email"
                  placeholder="john.smith@email.com"
                  className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-2xl px-5 py-3.5 text-white text-sm placeholder-white/50 focus:outline-none"
                />
              </div>

              {/* Phone Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">phone</label>
                <input
                  type="tel"
                  placeholder="+243545353"
                  className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-2xl px-5 py-3.5 text-white text-sm placeholder-white/50 focus:outline-none"
                />
              </div>

              {/* Subject Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">select subject</label>
                <div className="relative w-full">
                  <select
                    defaultValue="general"
                    className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#111113] text-white">General enquiry</option>
                    <option value="general" className="bg-[#111113] text-white">General enquiry</option>
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
                className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-xl p-5 text-white text-sm placeholder-white/50 focus:outline-none resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="group flex items-center gap-3 bg-[#FFFFFF99] hover:bg-[#d4d4d4] text-white pl-7 pr-[4px] py-1 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
              >
                <span className="font-semibold text-base">Submit</span>
                <div className="bg-[#232E45] group-hover:bg-[#232E45] p-2.5 rounded-full flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={1.5} />
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