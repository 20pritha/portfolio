'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import SectionReveal from '@/components/SectionReveal';
import GlitchHeading from '@/components/GlitchHeading';
import skills from '@/data/skills';

export default function Skills() {
  return (
    <section id="skills">
      <SectionReveal label="skills">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-10 flex flex-wrap items-center gap-6">
            <div className="relative h-[100px] w-[100px]">
              <Image
                src="/avatars/avatar-working.png"
                alt="Avatar working beside skills heading"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <div className="min-w-[220px]">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#c07080]">Skills</p>
              <GlitchHeading className="text-3xl font-semibold text-slate-950 dark:text-[#f0f6fc]">
                A focused toolkit for AI engineering delivery.
              </GlitchHeading>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((group) => (
              <div key={group.title} className="card-hover rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-[#8B2635]/30 dark:bg-[#1c2128]/90">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-[#f0f6fc]">{group.title}</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      style={{ transition: 'background-color 150ms,color 150ms,border-color 150ms,transform 150ms' }}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-700 cursor-default select-none hover:bg-[#8B2635] hover:text-white hover:border-[#8B2635] hover:scale-[1.06] dark:border-[#8B2635]/35 dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:bg-[#8B2635] dark:hover:text-white dark:hover:border-[#8B2635] dark:hover:shadow-[0_0_12px_rgba(139,38,53,0.5)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
