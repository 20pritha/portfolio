'use client';

import { motion } from 'framer-motion';
import SectionReveal from '@/components/SectionReveal';
import GlitchHeading from '@/components/GlitchHeading';
import site from '@/data/site';

export default function About() {
  return (
    <section id="about">
      <SectionReveal label="about">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-soft dark:border-[#30363d] dark:bg-[#161b22]">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#8b949e]">About</p>
            <GlitchHeading className="mt-4 text-3xl font-semibold text-slate-950 dark:text-[#e6edf3]">
              {site.about.heading}
            </GlitchHeading>
            {site.about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-lg leading-8 text-slate-700 dark:text-[#8b949e]">
                {paragraph}
              </p>
            ))}
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                '⚡ 2 live production systems',
                '🤖 3,000+ prospects screened',
                '📊 18% precision improvement',
              ].map((stat) => (
                <span key={stat} className="rounded-full border border-maroon/30 px-4 py-1.5 text-sm font-medium text-maroon dark:border-[#8B2635]/50">
                  {stat}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
