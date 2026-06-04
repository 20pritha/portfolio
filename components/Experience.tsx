'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import SectionReveal from '@/components/SectionReveal';
import GlitchHeading from '@/components/GlitchHeading';
import CountUp from '@/components/CountUp';
import experience from '@/data/experience';

const experienceAvatars: Record<string, { src: string; alt: string }> = {
  'QUANTUM CAPITAL GROUP': {
    src: '/avatars/avatar-pointing.png',
    alt: 'Avatar pointing toward QUANTUM CAPITAL GROUP content',
  },
  'National University of Singapore': {
    src: '/avatars/avatar-working.png',
    alt: 'Avatar working beside NUS content',
  },
};

export default function Experience() {
  return (
    <section id="experience">
      <SectionReveal label="experience">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-10 flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#c07080]">Experience</p>
            <GlitchHeading className="text-3xl font-semibold text-slate-950 dark:text-[#f0f6fc]">
              Professional roles with production-grade AI delivery.
            </GlitchHeading>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {experience.map((item) => {
              const avatar = experienceAvatars[item.company];

              return (
                <div key={item.company} className="card-hover rounded-3xl border border-slate-200 bg-white p-7 shadow-soft dark:border-[#8B2635]/30 dark:bg-[#1c2128]/90">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    {avatar ? (
                      <div className="flex-shrink-0">
                        <Image
                          src={avatar.src}
                          alt={avatar.alt}
                          width={120}
                          height={120}
                          className="object-contain"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xl font-semibold text-slate-950 dark:text-[#f0f6fc]">{item.company}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-[#a0aec0]">{item.role}</p>
                        </div>
                        <span className="rounded-full bg-maroon/10 px-3 py-1 text-sm font-semibold text-maroon dark:bg-[#8B2635]/20 dark:text-[#f0f6fc]">{item.timeframe}</span>
                      </div>
                      <ul className="mt-6 space-y-4 text-slate-700 dark:text-[#a0aec0]">
                        {item.highlights.map((highlight) => (
                          <li key={highlight} className="leading-7">• {highlight}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
