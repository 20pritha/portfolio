'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface SectionRevealProps {
  label: string;
  children: ReactNode;
}

export default function SectionReveal({ label, children }: SectionRevealProps) {
  const [typed, setTyped] = useState('');
  const [showContent, setShowContent] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fullText = `> loading ${label}...`;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            setTyped('');
            setShowContent(false);

            let i = 0;
            const interval = setInterval(() => {
              i += 1;
              setTyped(fullText.slice(0, i));
              if (i >= fullText.length) {
                clearInterval(interval);
                setTimeout(() => setShowContent(true), 100);
                setTimeout(() => setTyped(''), 900);
              }
            }, 60);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText]);

  return (
    <div ref={containerRef}>
      <div className="mb-2 min-h-[1.4rem] font-mono text-sm text-maroon dark:text-[#58a6ff]">
        {typed}
        {typed.length > 0 && typed.length < fullText.length && (
          <span className="animate-pulse">▋</span>
        )}
      </div>
      <div
        className="transition-opacity duration-500"
        style={{ opacity: showContent ? 1 : 0, transform: showContent ? 'none' : 'translateY(8px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      >
        {children}
      </div>
    </div>
  );
}
