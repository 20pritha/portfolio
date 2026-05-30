'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'journey', label: 'Journey' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'academic', label: 'Academics' },
  { id: 'publications', label: 'Publications' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const [active, setActive] = useState('hero');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Use a scroll-based center-of-viewport approach to reliably pick the
    // section nearest the viewport center. This is more deterministic when
    // sections are short or overlap during fast scrolling.
    let raf = 0;

    const updateActiveByCenter = () => {
      const centerY = window.innerHeight / 2;
      let closestId = active;
      let closestDist = Infinity;

      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - centerY);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = section.id;
        }
      });

      if (closestId !== active) setActive(closestId);
    };

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActiveByCenter);
    };

    // Initial run and event listeners
    updateActiveByCenter();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-cream/95 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 text-sm text-slate-700">
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-maroon"
          >
            <Image
              src="/avatars/avatar-face.png"
              alt="Avatar face"
              width={48}
              height={48}
              className="rounded-full object-contain"
            />
            <span className="flex items-center gap-1">✦ PM</span>
          </button>
          <div className="hidden gap-6 md:flex">
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`transition-colors duration-200 ${
                  active === item.id
                    ? 'text-maroon border-b-2 border-maroon pb-1 font-semibold'
                    : 'text-slate-700 hover:text-maroon'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
          <StatusBadge />
        </nav>
      </header>

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">About Me</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Pritha Mishra</h2>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 text-slate-700">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Role</p>
                <p className="mt-2 text-base font-semibold text-slate-950">AI Engineer</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Education</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">B.Tech in Electronics &amp; Instrumentation Engineering</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Focus</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">GenAI · RAG · Production AI</p>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Available for</p>
                <p className="mt-2 text-base font-semibold text-slate-950">Work opportunities · Collaboration · AI projects</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Contact</p>
                  <p className="mt-2 text-base font-semibold text-slate-950 break-words whitespace-normal">pritha.mishra2003@gmail.com</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">LinkedIn</p>
                  <p className="mt-2 text-base font-semibold text-slate-950 break-words whitespace-normal">linkedin.com/in/pritha-mishra</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
