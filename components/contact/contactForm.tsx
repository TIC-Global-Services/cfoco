"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, ArrowUpRight, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';

const DEFAULT_GLOW_COLOR = '204, 21, 24';
const DEFAULT_PARTICLE_COUNT = 12;

const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.8), 0 0 12px rgba(${color}, 0.4);
    pointer-events: none;
    z-index: 5;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const ContactForm = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: DEFAULT_PARTICLE_COUNT }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, DEFAULT_GLOW_COLOR)
    );
    particlesInitialized.current = true;
  }, []);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      gsap.to(element, {
        rotateX: 5,
        rotateY: 5,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      element.style.setProperty('--glow-intensity', '0');

      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const relativeX = (x / rect.width) * 100;
      const relativeY = (y / rect.height) * 100;

      element.style.setProperty('--glow-x', `${relativeX}%`);
      element.style.setProperty('--glow-y', `${relativeY}%`);
      element.style.setProperty('--glow-intensity', '1');

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: 'power2.out',
        transformPerspective: 1000,
      });

      const magnetX = (x - centerX) * 0.04;
      const magnetY = (y - centerY) * 0.04;

      magnetismAnimationRef.current = gsap.to(element, {
        x: magnetX,
        y: magnetY,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${DEFAULT_GLOW_COLOR}, 0.35) 0%, rgba(${DEFAULT_GLOW_COLOR}, 0.15) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 20;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles]);

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-[5%] pb-20 pt-10">
      <style>{`
        .contact-info-card {
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 250px;
          --glow-color: ${DEFAULT_GLOW_COLOR};
        }
        .contact-info-card::after {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: radial-gradient(
            var(--glow-radius) circle at var(--glow-x) var(--glow-y),
            rgba(var(--glow-color), calc(var(--glow-intensity) * 0.8)) 0%,
            rgba(var(--glow-color), calc(var(--glow-intensity) * 0.3)) 30%,
            transparent 65%
          );
          border-radius: inherit;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
          opacity: 1;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .contact-info-card:hover {
          box-shadow: 0 8px 30px rgba(204, 21, 24, 0.2), 0 0 35px rgba(204, 21, 24, 0.1);
        }
        .particle::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: rgba(${DEFAULT_GLOW_COLOR}, 0.25);
          border-radius: 50%;
          z-index: -1;
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Left Side: Contact Information Card */}
        <div
          ref={cardRef}
          className="contact-info-card lg:col-span-2 bg-[#111113] border border-[#1e3a8a] rounded-[2rem] p-8 sm:px-10 flex flex-col shadow-2xl h-fit py-16 relative overflow-hidden transition-[box-shadow,border-color] duration-300 will-change-transform"
        >
          <div className="mb-10 relative z-10">
            <Image
              src="/cfc_logo.svg"
              alt="CFC Logo"
              width={140}
              height={45}
              className="w-auto h-8 sm:h-10 object-contain"
            />
          </div>

          <div className="mb-5 relative z-10">
            <h2 className="text-[#CC1518] text-[1.750rem] font-bold mb-2">
              Contact Information
            </h2>
            <p className="text-white/90 text-lg font-medium">
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
                  className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-full px-5 py-3.5 text-white text-sm placeholder-white/50 focus:outline-none"
                />
              </div>

              {/* Mail Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">Mail</label>
                <input
                  type="email"
                  placeholder="john.smith@email.com"
                  className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-full px-5 py-3.5 text-white text-sm placeholder-white/50 focus:outline-none"
                />
              </div>

              {/* Phone Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">phone</label>
                <input
                  type="tel"
                  placeholder="+243545353"
                  className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-full px-5 py-3.5 text-white text-sm placeholder-white/50 focus:outline-none"
                />
              </div>

              {/* Subject Field */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-medium text-sm ml-2">select subject</label>
                <div className="relative w-full">
                  <select
                    className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-full px-5 py-3.5 text-white text-sm focus:outline-none appearance-none cursor-pointer"
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
                className="form-glow-input w-full bg-transparent border border-[#1e3a8a] rounded-[1.5rem] p-5 text-white text-sm placeholder-white/50 focus:outline-none resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="group flex items-center gap-3 bg-[#a3a3a3] hover:bg-[#d4d4d4] text-white pl-6 pr-2 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
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