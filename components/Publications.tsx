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
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#c07080]">
            Publications & Certifications
          </p>
          <GlitchHeading className="text-2xl font-semibold text-slate-950 dark:text-[#f0f6fc]">
            Verified research and credentials.
          </GlitchHeading>
        </div>

        <div className="flex flex-col gap-6">
          {/* Publication — full width */}
          {publications.map((item) => (
            <motion.div
              key={item.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#8B2635]/35 dark:bg-[#1c2128]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(139,38,53,0.12)' }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex-1 min-w-0">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8B2635]">
                    📄 Publication
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-[#f0f6fc] leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-[#a0aec0]">{item.journal}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-400">
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="w-full flex-shrink-0 sm:w-60">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="h-40 w-full cursor-pointer rounded-xl border-2 border-[#8B2635]/30 object-cover transition-colors hover:border-[#8B2635]"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setLightbox({ src: item.image, alt: item.title })}
                  />
                  <p className="mt-1.5 text-center text-xs text-slate-400 dark:text-[#a0aec0]">
                    WiFi-Controlled Humanoid Robotic Arm
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Certifications — 3 col grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {certifications.map((cert, i) => (
              <motion.div
                key={cert.title}
                className="group flex cursor-pointer flex-col rounded-2xl border border-gray-100 bg-white p-4 transition-colors dark:border-[#8B2635]/35 dark:bg-[#1c2128] hover:border-[#8B2635]/40 dark:hover:border-[#8B2635]/60"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -3, boxShadow: '0 6px 24px rgba(139,38,53,0.15)' }}
                onClick={() => setLightbox({ src: cert.image, alt: cert.title })}
              >
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="mb-3 h-14 w-20 rounded-md border border-[#8B2635]/20 object-cover transition-colors group-hover:border-[#8B2635]/50"
                />
                <p className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-[#f0f6fc]">
                  {cert.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#a0aec0]">{cert.issuer}</p>
                <p className="mt-auto pt-3 text-xs font-medium text-[#8B2635]">
                  <span className="border-b border-transparent group-hover:border-[#8B2635]">
                    View →
                  </span>
                </p>
              </motion.div>
            ))}
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
