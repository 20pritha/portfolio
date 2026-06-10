'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import journey from '@/data/journey';
import SectionReveal from '@/components/SectionReveal';
import GlitchHeading from '@/components/GlitchHeading';

const journeyAvatars = [
  {
    match: (item: typeof journey[number]) => item.year === '2022' && item.event.includes('SRM'),
    src: '/avatars/avatar-standing.png',
    alt: 'Standing avatar for SRM node',
  },
  {
    match: (item: typeof journey[number]) => item.year === '2022–2024' && item.event.includes('Crew 616'),
    src: '/avatars/avatar-dancing.png',
    alt: 'Dancing avatar for Crew 616 node',
  },
  {
    match: (item: typeof journey[number]) => item.year === '2023' && item.event.includes('WiFi'),
    src: '/avatars/avatar-thinking.png',
    alt: 'Thinking avatar for WiFi robot pivot node',
  },
  {
    match: (item: typeof journey[number]) => item.year === '2024' && item.event.includes('TECHnoxian'),
    src: '/avatars/avatar-pointing.png',
    alt: 'Pointing avatar for TECHnoxian node',
  },
  {
    match: (item: typeof journey[number]) => item.year === '2024' && item.event.includes('IIT Bombay Techfest'),
    src: '/avatars/avatar-celebrating.png',
    alt: 'Celebrating avatar for IIT Bombay Techfest node',
  },
  {
    match: (item: typeof journey[number]) => item.year === '2025' && item.event.includes('National University of Singapore'),
    src: '/avatars/avatar-waving.png',
    alt: 'Waving avatar for NUS node',
  },
  {
    match: (item: typeof journey[number]) => item.year === '2025' && item.event.includes('NUS Certifications'),
    src: '/avatars/avatar-face.png',
    alt: 'Face avatar for NUS certification node',
  },
  {
    match: (item: typeof journey[number]) => item.year === '2026' && item.event.includes('QUANTUM CAPITAL GROUP'),
    src: '/avatars/avatar-working.png',
    alt: 'Working avatar for QUANTUM CAPITAL GROUP node',
  },
];

const getAvatar = (item: typeof journey[number]) => journeyAvatars.find((entry) => entry.match(item));

export default function Journey() {
  return (
    <section id="journey">
      <SectionReveal label="journey">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-10 flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#c07080]">Journey</p>
            <GlitchHeading className="text-3xl font-semibold text-slate-950 dark:text-[#f0f6fc]">
              Growth milestones from campus to AI production.
            </GlitchHeading>
            <p className="max-w-3xl text-slate-700 dark:text-[#a0aec0]">
              A timeline of the moments, teams, and events that shaped my trajectory in AI engineering, robotics, and research.
            </p>
          </div>

          <div className="relative mx-auto w-full">
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-200 dark:bg-[#8B2635]/25" />
            <div className="space-y-16">
              {journey.map((item, index) => {
                const avatar = getAvatar(item);
                const alignLeft = index % 2 === 0;

                return (
                  <div key={`${item.year}-${item.event}`} className="relative">
                    <div className="grid gap-6 lg:grid-cols-[1fr_80px_1fr] lg:items-start">
                      <div className={alignLeft ? 'lg:col-start-1 lg:col-end-2 lg:text-right' : 'hidden lg:block lg:col-start-1 lg:col-end-2'}>
                        {alignLeft && (
                          <div className="card-hover rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-[#8B2635]/30 dark:bg-[#1c2128]/90">
                            {avatar && (
                              <div className="mb-4 items-center gap-3 hidden md:flex lg:hidden">
                                <Image src={avatar.src} alt={avatar.alt} width={44} height={44} className="object-contain" />
                              </div>
                            )}
                            <div className="text-sm text-slate-500 dark:text-[#a0aec0]">
                              <span className="font-semibold text-slate-900 dark:text-[#f0f6fc]">{item.year}</span>
                              <span className="ml-3 rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600 dark:bg-[#21262d] dark:text-[#a0aec0]">
                                {item.location}
                              </span>
                            </div>
                            <p className="mt-4 text-lg font-semibold text-slate-950 dark:text-[#f0f6fc]">{item.event}</p>
                            <div className="mt-4 opacity-100">
                              <p className="text-slate-700 dark:text-[#a0aec0]">{item.description}</p>
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1 text-xs text-[#8B2635] underline underline-offset-2 hover:opacity-75"
                                >
                                  {item.linkLabel ?? 'Watch →'}
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative hidden lg:flex justify-center">
                        <div className="flex h-[140px] w-[140px] items-center justify-center rounded-full border border-slate-200 bg-transparent shadow-sm dark:border-[#8B2635]/35">
                          {avatar && (
                            <Image
                              src={avatar.src}
                              alt={avatar.alt}
                              width={140}
                              height={140}
                              className="object-contain"
                            />
                          )}
                        </div>
                      </div>

                      <div className={!alignLeft ? 'lg:col-start-3 lg:col-end-4 lg:text-left' : 'hidden lg:block lg:col-start-3 lg:col-end-4'}>
                        {!alignLeft && (
                          <div className="card-hover rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-[#8B2635]/30 dark:bg-[#1c2128]/90">
                            {avatar && (
                              <div className="mb-4 items-center gap-3 hidden md:flex lg:hidden">
                                <Image src={avatar.src} alt={avatar.alt} width={44} height={44} className="object-contain" />
                              </div>
                            )}
                            <div className="text-sm text-slate-500 dark:text-[#a0aec0]">
                              <span className="font-semibold text-slate-900 dark:text-[#f0f6fc]">{item.year}</span>
                              <span className="ml-3 rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600 dark:bg-[#21262d] dark:text-[#a0aec0]">
                                {item.location}
                              </span>
                            </div>
                            <p className="mt-4 text-lg font-semibold text-slate-950 dark:text-[#f0f6fc]">{item.event}</p>
                            <div className="mt-4 opacity-100">
                              <p className="text-slate-700 dark:text-[#a0aec0]">{item.description}</p>
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1 text-xs text-[#8B2635] underline underline-offset-2 hover:opacity-75"
                                >
                                  {item.linkLabel ?? 'Watch →'}
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
