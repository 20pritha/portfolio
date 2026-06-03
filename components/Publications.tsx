'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionReveal from '@/components/SectionReveal';
import GlitchHeading from '@/components/GlitchHeading';
import Lightbox from '@/components/Lightbox';
import { publications, certifications } from '@/data/publications';

export default function Publications() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <section id="publications">
      <SectionReveal label="publications">
        <div className="mb-10 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#8b949e]">
            Publications & Certifications
          </p>
          <GlitchHeading className="text-3xl font-semibold text-slate-950 dark:text-[#e6edf3]">
            Verified research and credentials.
          </GlitchHeading>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Publications */}
          <motion.div
            className="card-hover rounded-3xl border border-slate-200 bg-white p-7 shadow-soft dark:border-[#30363d]/70 dark:bg-[#161b22]/90"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            whileHover={{ y: -3 }}
          >
            <p className="text-lg font-semibold text-slate-950 dark:text-[#e6edf3]">Publications</p>
            <ul className="mt-6 space-y-4">
              {publications.map((item) => (
                <li key={item.title}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-[#e6edf3]">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-[#8b949e]">{item.journal}</p>
                      <span className="mt-2 inline-block rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-400">
                        {item.status}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      <motion.img
                        src={item.image}
                        alt={item.title}
                        className="h-40 w-60 cursor-pointer rounded-xl border-2 border-[#8B2635]/30 object-cover transition-colors hover:border-[#8B2635]"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setLightbox({ src: item.image, alt: item.title })}
                      />
                      <p className="mt-1.5 text-center text-xs text-slate-500 dark:text-[#8b949e]">
                        WiFi-Controlled Humanoid Robotic Arm
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Certifications */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft dark:border-[#30363d]/70 dark:bg-[#161b22]/90">
            <p className="text-lg font-semibold text-slate-950 dark:text-[#e6edf3]">Certifications</p>
            <ul className="mt-6 space-y-4">
              {certifications.map((cert, i) => (
                <motion.li
                  key={cert.title}
                  className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-[#8B2635]/40 hover:shadow-md dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-[#8B2635]/60 dark:hover:shadow-[0_4px_20px_rgba(139,38,53,0.2)]"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -2 }}
                  onClick={() => setLightbox({ src: cert.image, alt: cert.title })}
                >
                  <motion.img
                    src={cert.image}
                    alt={cert.title}
                    className="h-[60px] w-[80px] flex-shrink-0 rounded-md border-2 border-[#8B2635]/20 object-cover transition-all group-hover:border-[#8B2635]/40 group-hover:shadow-[0_0_8px_rgba(139,38,53,0.25)]"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-[#e6edf3]">{cert.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-[#8b949e]">{cert.issuer}</p>
                    <p className="mt-1.5 text-xs font-medium text-[#8B2635] transition-all">
                      <span className="inline-block border-b border-transparent group-hover:border-[#8B2635]">
                        View Certificate →
                      </span>
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </SectionReveal>

      <Lightbox
        src={lightbox?.src ?? ''}
        alt={lightbox?.alt ?? ''}
        isOpen={lightbox !== null}
        onClose={() => setLightbox(null)}
      />
    </section>
  );
}
