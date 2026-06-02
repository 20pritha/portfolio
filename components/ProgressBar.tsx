'use client';

import { useEffect, useRef } from 'react';

export default function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const update = () => {
      rafRef.current = null;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollHeight > 0 ? Math.min(100, (window.scrollY / scrollHeight) * 100) : 0;
      bar.style.width = `${pct}%`;
    };

    const onScroll = () => {
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] h-1 bg-slate-200/70">
      <div ref={barRef} className="h-full bg-maroon" style={{ width: '0%' }} />
    </div>
  );
}
