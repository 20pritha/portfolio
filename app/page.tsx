'use client';

import Sidebar from '@/components/Sidebar';
import CustomCursor from '@/components/CustomCursor';
import ProgressBar from '@/components/ProgressBar';
import TechBackground from '@/components/TechBackground';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Journey from '@/components/Journey';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import AcademicGrowth from '@/components/AcademicGrowth';
import Publications from '@/components/Publications';
import Contact from '@/components/Contact';
import BackToTop from '@/components/BackToTop';
import { useSidebar } from '@/hooks/useSidebar';
import { useEffect } from 'react';

function SectionDivider() {
  return (
    <div className="flex justify-center py-2 select-none" aria-hidden="true">
      <span className="text-[#8B2635]/30 text-xs">✦</span>
    </div>
  );
}

export default function HomePage() {
  const { expanded, toggle, mobileOpen, openMobile, closeMobile } = useSidebar();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="flex min-h-screen relative" style={{ zIndex: 1 }}>
      <TechBackground />
      <Sidebar
        expanded={expanded}
        onToggle={toggle}
        mobileOpen={mobileOpen}
        onMobileOpen={openMobile}
        onMobileClose={closeMobile}
      />
      <main
        className={`flex-1 min-w-0 transition-[margin] duration-300 ease-in-out pt-16 md:pt-0 ${
          expanded ? 'md:ml-60' : 'md:ml-16'
        }`}
      >
        <ProgressBar />
        <CustomCursor />
        <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 sm:pb-24">
          <Hero />
          <SectionDivider />
          <About />
          <SectionDivider />
          <Journey />
          <SectionDivider />
          <Experience />
          <SectionDivider />
          <Projects />
          <SectionDivider />
          <Skills />
          <SectionDivider />
          <AcademicGrowth />
          <SectionDivider />
          <Publications />
          <SectionDivider />
          <Contact />
        </div>
        <footer className="py-6 text-center text-xs text-slate-400">
          <span className="text-maroon">✦</span> Pritha Mishra · 2026 · Built with Next.js &amp; Tailwind
        </footer>
        <BackToTop />
      </main>
    </div>
  );
}
