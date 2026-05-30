'use client';

import { motion } from 'framer-motion';
import SectionReveal from '@/components/SectionReveal';
import GlitchHeading from '@/components/GlitchHeading';
import publications from '@/data/publications';

export default function Publications() {
  return (
    <section id="publications">
      <SectionReveal label="publications">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-10 flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Publications & Certifications</p>
            <GlitchHeading className="text-3xl font-semibold text-slate-950">
              Verified research and credentials.
            </GlitchHeading>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
              <p className="text-lg font-semibold text-slate-950">Publications</p>
              <ul className="mt-6 space-y-4 text-slate-700">
                {publications.publications.map((item) => (
                  <li key={item.title}>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.source}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
              <p className="text-lg font-semibold text-slate-950">Certifications</p>
              <ul className="mt-6 space-y-4 text-slate-700">
                {publications.certifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
