'use client';

import { useEffect, useRef } from 'react';

// Trail constants (commented out - trail feature disabled)
// const MAX_TRAIL    = 12;
// const TRAIL_MS     = 600;
// const MIN_MOVE_SQ  = 16;

export default function CustomCursor() {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const dotRef   = useRef<HTMLSpanElement>(null);
  const svgRef   = useRef<SVGSVGElement>(null);
  const posRef   = useRef({ x: 0, y: 0 });
  // const trailRef = useRef<{ x: number; y: number; t: number }[]>([]);
  // const lastRef  = useRef({ x: 0, y: 0 });
  const interRef = useRef(false);
  const rafRef   = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const wrap = wrapRef.current;
    const dot  = dotRef.current;
    const svg  = svgRef.current;
    if (!wrap || !dot || !svg) return;

    wrap.style.display = 'block';

    // Trail pool pre-allocation (disabled)
    // const pool: SVGTextElement[] = [];
    // for (let i = 0; i < MAX_TRAIL; i++) {
    //   const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    //   el.textContent = '✶';
    //   el.setAttribute('text-anchor', 'middle');
    //   el.setAttribute('dominant-baseline', 'central');
    //   el.setAttribute('fill', '#8B2635');
    //   el.style.opacity = '0';
    //   el.style.fontSize = '20px';
    //   svg.appendChild(el);
    //   pool.push(el);
    // }

    const onMove = (e: MouseEvent) => {
      const x = e.clientX, y = e.clientY;
      posRef.current = { x, y };
      // Trail tracking (disabled)
      // const dx = x - lastRef.current.x, dy = y - lastRef.current.y;
      // if (dx * dx + dy * dy > MIN_MOVE_SQ) {
      //   lastRef.current = { x, y };
      //   trailRef.current.push({ x, y, t: performance.now() });
      //   if (trailRef.current.length > MAX_TRAIL) trailRef.current.shift();
      // }
      const target = e.target as Element;
      interRef.current = !!target.closest('a,button,[role="button"],input,textarea,select,label');
    };

    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);

      // Direct DOM mutation – no React setState, no re-render
      const { x, y } = posRef.current;
      const size = interRef.current ? 52 : 40;
      dot.style.left     = `${x - size / 2}px`;
      dot.style.top      = `${y - size / 2}px`;
      dot.style.width    = `${size}px`;
      dot.style.height   = `${size}px`;
      dot.style.fontSize = interRef.current ? '52px' : '40px';

      // Trail rendering (disabled)
      // const cutoff = now - TRAIL_MS;
      // let s = 0;
      // const trail = trailRef.current;
      // while (s < trail.length && trail[s].t < cutoff) s++;
      // if (s > 0) trailRef.current = trail.slice(s);
      // const alive = trailRef.current;
      // const n = alive.length;
      //
      // // Update pre-allocated pool elements
      // for (let i = 0; i < MAX_TRAIL; i++) {
      //   const el = pool[i];
      //   if (i >= n) { el.style.opacity = '0'; continue; }
      //   const t  = i / Math.max(1, n - 1);
      //   const sz = Math.max(8, 28 - t * 18);
      //   const op = Math.max(0.04, 0.70 - t * 0.66);
      //   const bl = Math.min(2.5, (1 - t) * 2);
      //   el.setAttribute('x', String(alive[i].x));
      //   el.setAttribute('y', String(alive[i].y));
      //   el.setAttribute('font-size', String(sz));
      //   el.setAttribute('fill-opacity', String(op));
      //   el.style.filter  = bl > 0.1 ? `blur(${bl.toFixed(1)}px)` : '';
      //   el.style.opacity = '1';
      // }
    };

    window.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
      // pool.forEach((el) => el.remove());
    };
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" style={{ display: 'none' }}>
      <svg ref={svgRef} className="pointer-events-none fixed inset-0 w-full h-full" />
      <span ref={dotRef} className="pointer-events-none absolute leading-none text-maroon" style={{ zIndex: 1 }}>
        ✶
      </span>
    </div>
  );
}
