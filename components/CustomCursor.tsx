'use client';

import { useEffect, useRef, useState } from 'react';

type TrailPoint = {
  id: number;
  x: number;
  y: number;
  created: number;
};

const TRAIL_DURATION = 400;
const MAX_TRAIL_POINTS = 12;

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const frameRef = useRef<number | null>(null);
  const isCoarseRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)');
    isCoarseRef.current = media.matches;
    if (isCoarseRef.current) return undefined;

    const updateTrail = (time: number) => {
      setTrail((current) => current.filter((point) => time - point.created < TRAIL_DURATION));
      frameRef.current = requestAnimationFrame(updateTrail);
    };

    const handleMove = (event: MouseEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      const now = performance.now();
      const lastPos = lastPositionRef.current;

      // Only add point if moved at least 4px
      const distance = Math.sqrt((x - lastPos.x) ** 2 + (y - lastPos.y) ** 2);
      if (distance > 4) {
        lastPositionRef.current = { x, y };
        setTrail((current) => [
          ...current.slice(-MAX_TRAIL_POINTS + 1),
          { id: now, x, y, created: now },
        ]);
      }

      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    frameRef.current = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  if (isCoarseRef.current) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Particle spark trail */}
      <svg className="pointer-events-none fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
        {trail.map((point, index) => {
          const t = index / Math.max(1, trail.length - 1);
          const size = Math.max(10, 24 - t * 14);
          const opacity = Math.max(0.08, 0.85 - t * 0.75);
          const blur = Math.min(3, 1 + t * 2);
          return (
            <text
              key={point.id}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size}
              fill="#8B2635"
              fillOpacity={opacity}
              style={{ filter: `blur(${blur}px)` }}
            >
              ✦
            </text>
          );
        })}
      </svg>

      {/* Main cursor */}
      <span
        className="pointer-events-none absolute text-maroon leading-none"
        style={{
          left: position.x - 16,
          top: position.y - 16,
          fontSize: '32px',
          zIndex: 1,
        }}
      >
        ✦
      </span>
    </div>
  );
}
