// components/Reveal.tsx
'use client';

import { motion } from 'framer-motion';
import { CSSProperties, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function Reveal({ children, delay = 0, className = "", style, onMouseEnter, onMouseLeave }: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // 1. Initial hidden state
      initial={{ opacity: 0, y: 50 }}
      
      // 2. Animate to this state when in view
      whileInView={{ opacity: 1, y: 0 }}
      
      // 3. Viewport settings (once: true ensures it only happens once)
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      
      // 4. Custom transition matching that premium cubic-bezier feel
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Framer Motion takes an array for cubic-bezier
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}