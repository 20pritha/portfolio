'use client';

import { motion } from 'framer-motion';
import SectionReveal from '@/components/SectionReveal';
import GlitchHeading from '@/components/GlitchHeading';
import CountUp from '@/components/CountUp';
import site from '@/data/site';

const stats = [
  { icon: '⚡', value: 2,    suffix: '',   label: 'production systems shipped', exact: true },
  { icon: '🤖', value: 3000, suffix: '+',  label: 'prospects screened',         exact: false },
  { icon: '📊', value: 18,   suffix: '%',  label: 'precision improvement',      exact: true },
];

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
          <div className="card-hover rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-[#8B2635]/30 dark:bg-[#1c2128]/90">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#c07080]">About</p>
            <GlitchHeading className="mt-4 text-3xl font-semibold text-slate-950 dark:text-[#f0f6fc]">
              {site.about.heading}
            </GlitchHeading>
            {site.about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-lg leading-8 text-slate-700 dark:text-[#a0aec0]">
                {paragraph}
              </p>
            ))}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {stats.map(({ icon, value, suffix, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center rounded-2xl border border-maroon/20 bg-maroon/5 px-5 py-4 text-center dark:border-[#8B2635]/30 dark:bg-[#8B2635]/10"
                >
                  <div className="flex items-baseline gap-0.5 text-2xl font-bold text-maroon">
                    <span>{icon} </span>
                    <CountUp end={value} duration={1400} suffix={suffix} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#a0aec0]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
