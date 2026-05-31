'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface SectionRevealProps {
  label: string;
  children: ReactNode;
}

export default function SectionReveal({ label, children }: SectionRevealProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            setTimeout(() => setVisible(false), 800);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef}>
      <div className={`mb-2 min-h-[1.4rem] text-sm font-mono text-maroon transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {`> loading ${label}...`}
      </div>
      {children}
    </div>
  );
}
