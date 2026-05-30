'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import SectionReveal from '@/components/SectionReveal';
import GlitchHeading from '@/components/GlitchHeading';
import skills from '@/data/skills';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const pillVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Skills</p>
              <GlitchHeading className="text-3xl font-semibold text-slate-950">
                A focused toolkit for AI engineering delivery.
              </GlitchHeading>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((group) => (
              <div key={group.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-slate-950">{group.title}</h3>
                <motion.div
                  className="mt-4 flex flex-wrap gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  {group.items.map((item) => (
                    <motion.span
                      key={item}
                      variants={pillVariants}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-700 transition hover:border-maroon hover:text-maroon"
                    >
                      {item}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
