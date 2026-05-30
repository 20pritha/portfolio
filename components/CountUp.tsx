'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CountUp({ end, duration = 1300, suffix = '' }: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;

        let start = performance.now();

        const animate = (time: number) => {
          const progress = Math.min(1, (time - start) / duration);
          setValue(end * easeOutCubic(progress));

          if (progress < 1) {
            frameRef.current = requestAnimationFrame(animate);
          }
        };

        frameRef.current = requestAnimationFrame(animate);
        observer.unobserve(entry.target);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [duration, end]);

  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: end % 1 !== 0 ? 2 : 0,
  }).format(value);

  return (
    <div ref={ref} className="font-bold text-maroon">
      {formatted}
      {suffix}
    </div>
  );
}
