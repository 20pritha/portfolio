'use client';

import Sidebar from '@/components/Sidebar';
import CustomCursor from '@/components/CustomCursor';
import ProgressBar from '@/components/ProgressBar';
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

export default function HomePage() {
  const { expanded, toggle, mobileOpen, openMobile, closeMobile } = useSidebar();

  return (
    <div className="flex min-h-screen">
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
          <About />
          <Journey />
          <Experience />
          <Projects />
          <Skills />
          <AcademicGrowth />
          <Publications />
          <Contact />
        </div>
        <BackToTop />
      </main>
    </div>
  );
}
