'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface MagneticWrapperProps {
  children: ReactNode;
  className?: string;
  strength?: number; // how many px to shift at edge, default 12
  radius?: number;   // activation radius in px, default 120
}

export default function MagneticWrapper({
  children,
  className,
  strength = 12,
  radius = 120,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || isCoarse) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      currentXRef.current = lerp(currentXRef.current, targetXRef.current, 0.12);
      currentYRef.current = lerp(currentYRef.current, targetYRef.current, 0.12);

      const dx = Math.abs(currentXRef.current - targetXRef.current);
      const dy = Math.abs(currentYRef.current - targetYRef.current);

      el.style.transform = `translate(${currentXRef.current}px, ${currentYRef.current}px)`;

      if (dx > 0.05 || dy > 0.05) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = 0;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const factor = (1 - dist / radius) * strength;
        targetXRef.current = (dx / dist) * factor;
        targetYRef.current = (dy / dist) * factor;
      } else {
        targetXRef.current = 0;
        targetYRef.current = 0;
      }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const handleMouseLeave = () => {
      targetXRef.current = 0;
      targetYRef.current = 0;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [strength, radius]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
