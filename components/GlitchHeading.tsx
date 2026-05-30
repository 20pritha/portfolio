'use client';

import { useEffect, useRef, useState } from 'react';

interface GlitchHeadingProps {
  children: string;
  className?: string;
}

export default function GlitchHeading({ children, className = '' }: GlitchHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const element = headingRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsGlitching(true);
          window.setTimeout(() => setIsGlitching(false), 300);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <h2
      ref={headingRef}
      data-text={children}
      className={`glitch-heading ${className} ${isGlitching ? 'glitch-active' : ''}`}
    >
      {children}
    </h2>
  );
}
