'use client';

import Navbar from '@/components/Navbar';
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

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <ProgressBar />
      <CustomCursor />
      <Navbar />
      <div className="mx-auto max-w-[1440px] px-6 pb-24">
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
  );
}
