'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Blob = { xBase: number; yBase: number; xAmp: number; yAmp: number; xFreq: number; yFreq: number; xPhase: number; yPhase: number; radius: number };

const NODE_COUNT = 25;
const LINK_DIST  = 110;
const LINK_DIST2 = LINK_DIST * LINK_DIST;
const FPS        = 20;
const FRAME_MS   = 1000 / FPS;

export default function TechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const mouse     = useRef({ x: -9999, y: -9999 });
  const mouseTgt  = useRef({ x: -9999, y: -9999 });
  const rafRef    = useRef(0);
  const nodes     = useRef<Node[]>([]);
  const blobs     = useRef<Blob[]>([]);
  const gridCache = useRef<HTMLCanvasElement | null>(null);
  const blobCache = useRef<HTMLCanvasElement[]>([]);
  const tick      = useRef(0);
  const lastTime  = useRef(0);

  useEffect(() => {
    const cv  = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const dark = theme === 'dark';
    const BG   = dark ? '#0d1117' : '#FAF7F2';
    const peak = dark ? .30 : .20;

    /* ── pre-render grid ── */
    const buildGrid = (w: number, h: number) => {
      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const g = off.getContext('2d')!;
      const gs = 40;
      g.strokeStyle = `rgba(139,38,53,${dark ? .10 : .07})`;
      g.lineWidth = .5;
      for (let x = 0; x <= w; x += gs) { g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }
      for (let y = 0; y <= h; y += gs) { g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
      g.strokeStyle = `rgba(139,38,53,${dark ? .24 : .17})`;
      g.lineWidth = 1.2;
      for (let x = gs; x < w; x += gs) {
        for (let y = gs; y < h; y += gs) {
          const s = 4;
          g.beginPath(); g.moveTo(x-s,y); g.lineTo(x+s,y); g.stroke();
          g.beginPath(); g.moveTo(x,y-s); g.lineTo(x,y+s); g.stroke();
        }
      }
      return off;
    };

    /* ── pre-render blob to offscreen canvas (done once per blob size) ── */
    const buildBlobCanvas = (r: number) => {
      const size = Math.ceil(r * 2);
      const off  = document.createElement('canvas');
      off.width  = size; off.height = size;
      const g    = off.getContext('2d')!;
      const grad = g.createRadialGradient(r, r, 0, r, r, r);
      grad.addColorStop(0,   `rgba(139,38,53,${peak})`);
      grad.addColorStop(.45, `rgba(139,38,53,${peak * .4})`);
      grad.addColorStop(1,   'rgba(139,38,53,0)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(r, r, r, 0, Math.PI * 2); g.fill();
      return off;
    };

    const blobDefs: Blob[] = [
      { xBase:.15, yBase:.22, xAmp:.20, yAmp:.16, xFreq:.00022, yFreq:.00028, xPhase:0,   yPhase:1.2, radius:.38 },
      { xBase:.82, yBase:.18, xAmp:.16, yAmp:.15, xFreq:.00018, yFreq:.00024, xPhase:2.1, yPhase:0.4, radius:.32 },
      { xBase:.50, yBase:.78, xAmp:.15, yAmp:.18, xFreq:.00020, yFreq:.00016, xPhase:4.3, yPhase:3.0, radius:.28 },
    ];

    const init = () => {
      cv.width  = window.innerWidth;
      cv.height = window.innerHeight;
      gridCache.current = buildGrid(cv.width, cv.height);

      const maxDim = Math.max(cv.width, cv.height);
      blobCache.current = blobDefs.map((b) => buildBlobCanvas(b.radius * maxDim));
      blobs.current = blobDefs;

      nodes.current = Array.from({ length: NODE_COUNT }, () => ({
        x:  Math.random() * cv.width,
        y:  Math.random() * cv.height,
        vx: (Math.random() - .5) * .4,
        vy: (Math.random() - .5) * .4,
        r:  1.5 + Math.random() * 1.2,
      }));
    };

    init();
    const onResize = () => init();
    window.addEventListener('resize', onResize);
    const onMove = (e: MouseEvent) => { mouseTgt.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove, { passive: true });

    const glowDot = (x: number, y: number, r: number, a: number) => {
      ctx.fillStyle = 'rgb(139,38,53)';
      ctx.globalAlpha = a * .3;
      ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    };

    const drawBlobs = (t: number) => {
      const maxDim = Math.max(cv.width, cv.height);
      blobs.current.forEach((b, i) => {
        const bx = (b.xBase + Math.sin(t * b.xFreq + b.xPhase) * b.xAmp) * cv.width;
        const by = (b.yBase + Math.cos(t * b.yFreq + b.yPhase) * b.yAmp) * cv.height;
        const r  = b.radius * maxDim;
        const bc = blobCache.current[i];
        if (bc) ctx.drawImage(bc, bx - r, by - r);
      });
    };

    const drawNet = () => {
      const ns  = nodes.current;
      const la  = dark ? .32 : .20;
      const na  = dark ? .52 : .38;

      for (let i = 0; i < ns.length; i++) {
        ns[i].x += ns[i].vx; ns[i].y += ns[i].vy;
        if (ns[i].x < 0 || ns[i].x > cv.width)  ns[i].vx *= -1;
        if (ns[i].y < 0 || ns[i].y > cv.height) ns[i].vy *= -1;
      }

      ctx.strokeStyle = 'rgb(139,38,53)';
      ctx.lineWidth   = .7;
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[i].x - ns[j].x, dy = ns[i].y - ns[j].y;
          const d2 = dx*dx + dy*dy;
          if (d2 < LINK_DIST2) {
            ctx.globalAlpha = (1 - Math.sqrt(d2) / LINK_DIST) * la;
            ctx.beginPath(); ctx.moveTo(ns[i].x, ns[i].y); ctx.lineTo(ns[j].x, ns[j].y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      const { x: mx, y: my } = mouse.current;
      if (mx > -100) {
        ctx.lineWidth = 1;
        for (let i = 0; i < ns.length; i++) {
          const dx = ns[i].x - mx, dy = ns[i].y - my, d2 = dx*dx + dy*dy;
          if (d2 < 160*160) {
            ctx.globalAlpha = (1 - Math.sqrt(d2) / 160) * (dark ? .52 : .36);
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(ns[i].x, ns[i].y); ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }

      for (let i = 0; i < ns.length; i++) glowDot(ns[i].x, ns[i].y, ns[i].r, na);
    };

    const drawHorizon = (t: number) => {
      const y    = cv.height * .58;
      const pulse = .5 + .5 * Math.sin(t * .04); // tick-based, not time-based
      const pk   = dark ? .28 + pulse * .16 : .17 + pulse * .09;
      const g    = ctx.createLinearGradient(0, y-80, 0, y+80);
      g.addColorStop(0, 'rgba(139,38,53,0)');
      g.addColorStop(.5, `rgba(139,38,53,${pk})`);
      g.addColorStop(1, 'rgba(139,38,53,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y-80, cv.width, 160);
    };

    const drawMouse = () => {
      const { x, y } = mouse.current;
      if (x < -100) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 280);
      g.addColorStop(0, `rgba(139,38,53,${dark ? .16 : .11})`);
      g.addColorStop(1, 'rgba(139,38,53,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 280, 0, Math.PI * 2); ctx.fill();
    };

    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      if (now - lastTime.current < FRAME_MS) return;
      lastTime.current = now;

      tick.current++;
      const t = tick.current;
      mouse.current.x += (mouseTgt.current.x - mouse.current.x) * .1;
      mouse.current.y += (mouseTgt.current.y - mouse.current.y) * .1;

      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, cv.width, cv.height);

      if (gridCache.current) ctx.drawImage(gridCache.current, 0, 0);
      drawHorizon(t);
      drawBlobs(t);
      drawNet();
      drawMouse();
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0, willChange: 'transform' }}
      aria-hidden="true"
    />
  );
}
