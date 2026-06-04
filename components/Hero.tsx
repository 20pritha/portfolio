'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import HeroDotGrid from '@/components/HeroDotGrid';
import HeroName from '@/components/HeroName';
import useKonami from '@/hooks/useKonami';
import site from '@/data/site';
import ChatBot from '@/components/ChatBot';

const typewriterPhrases = [
  'Agentic Pipeline Builder',
  'LLM Orchestration Engineer',
  'RAG Systems Developer',
  'Full-Stack AI Engineer',
];

const moods = ['face', 'celebrating', 'thinking2'] as const;

type Mood = (typeof moods)[number];

const avatarMeta: Record<Mood | 'waving' | 'dancing', { src: string; alt: string }> = {
  face: { src: '/avatars/avatar-face.png', alt: 'Avatar face close-up' },
  celebrating: { src: '/avatars/avatar-celebrating.png', alt: 'Avatar celebrating with fists up' },
  thinking2: { src: '/avatars/avatar-thinking.png', alt: 'Avatar thinking with hand on chin' },
  waving: { src: '/avatars/avatar-waving.png', alt: 'Avatar waving hello' },
  dancing: { src: '/avatars/avatar-dancing.png', alt: 'Avatar dancing in a black leather outfit' },
};

export default function Hero() {
  const [moodIndex, setMoodIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isKonamiActive, setIsKonamiActive] = useState(false);
  const [showStayPopup, setShowStayPopup] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterPhaseIndex, setTypewriterPhaseIndex] = useState(0);
  const [typewriterIsDeleting, setTypewriterIsDeleting] = useState(false);

  const mood = moods[moodIndex];

  useKonami(() => {
    setIsHovering(false);
    setIsKonamiActive(true);
  });

  useEffect(() => {
    if (!isKonamiActive) return;
    const timer = window.setTimeout(() => setIsKonamiActive(false), 1400);
    return () => window.clearTimeout(timer);
  }, [isKonamiActive]);

  useEffect(() => {
    let hideTimer: number | undefined;
    const popupTimer = window.setTimeout(() => {
      setShowStayPopup(true);
      hideTimer = window.setTimeout(() => setShowStayPopup(false), 4000);
    }, 300000);
    return () => {
      window.clearTimeout(popupTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    const phrase = typewriterPhrases[typewriterPhaseIndex];
    let timeout: number;

    if (!typewriterIsDeleting && typewriterText === phrase) {
      timeout = window.setTimeout(() => setTypewriterIsDeleting(true), 2000);
    } else if (typewriterIsDeleting && typewriterText === '') {
      setTypewriterIsDeleting(false);
      setTypewriterPhaseIndex((i) => (i + 1) % typewriterPhrases.length);
    } else {
      const speed = typewriterIsDeleting ? 40 : 65;
      timeout = window.setTimeout(() => {
        setTypewriterText(
          typewriterIsDeleting
            ? phrase.slice(0, typewriterText.length - 1)
            : phrase.slice(0, typewriterText.length + 1),
        );
      }, speed);
    }

    return () => window.clearTimeout(timeout);
  }, [typewriterText, typewriterIsDeleting, typewriterPhaseIndex]);

  const handleAvatarClick = () => {
    if (isKonamiActive) return;
    setMoodIndex((current) => (current + 1) % moods.length);
  };

  const handleMoodHint = (hint: 'face' | 'celebrating' | 'thinking2') => {
    const idx = moods.indexOf(hint);
    if (idx !== -1) setMoodIndex(idx);
  };

  const activeAvatar = isKonamiActive ? 'dancing' : isHovering ? 'waving' : mood;

  return (
    <section id="hero" className="relative overflow-hidden pb-8 pt-10">
      <HeroDotGrid />
      <div className="hero-shape pointer-events-none" />

      {/* Mobile: Centered layout */}
      <div className="lg:hidden flex flex-col items-center text-center gap-6">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.button
            key={activeAvatar}
            type="button"
            onClick={handleAvatarClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative grid h-[110px] w-[110px] place-items-center overflow-hidden rounded-[2rem] bg-transparent p-2 drop-shadow-lg focus:outline-none dark:drop-shadow-[0_0_16px_rgba(139,38,53,0.4)] transition-transform duration-300"
            aria-label="Avatar mood toggle"
            animate={isKonamiActive ? { y: [0, -18, 0] } : undefined}
            transition={isKonamiActive ? { duration: 0.4, repeat: 3, ease: 'easeInOut' } : undefined}
            onAnimationComplete={() => {
              if (isKonamiActive) setIsKonamiActive(false);
            }}
          >
            <div className="relative h-full w-full">
              {(Object.entries(avatarMeta) as [keyof typeof avatarMeta, { src: string; alt: string }][]).map(
                ([key, meta]) => (
                  <Image
                    key={key}
                    src={meta.src}
                    alt={meta.alt}
                    fill
                    sizes="110px"
                    className="object-contain transition-opacity duration-300 ease-in-out"
                    style={{ opacity: key === activeAvatar ? 1 : 0 }}
                  />
                ),
              )}
            </div>
          </motion.button>
        </motion.div>

        {/* Name + subtitle + typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
        >
          <HeroName />
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#8b949e]">
            {site.hero.subtitle}
          </p>
          <p className="mt-3 h-6 font-mono text-sm text-slate-700 dark:text-[#58a6ff]">
            {typewriterText}
            <span className="animate-pulse text-maroon dark:text-[#58a6ff]">|</span>
          </p>
        </motion.div>

        {/* Chat card */}
        <motion.div
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
        >
          <ChatBot defaultOpen hideToggle heroLayout onMoodHint={handleMoodHint} />
        </motion.div>
      </div>

      {/* Desktop: Two-column layout */}
      <div className="hidden lg:grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        {/* Left Column: Name + Description */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="hero-panel flex flex-col justify-start"
        >
          <HeroName />
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#8b949e]">
            {site.hero.subtitle}
          </p>
          <p className="mb-5 h-6 font-mono text-sm text-slate-700 dark:text-[#58a6ff]">
            {typewriterText}
            <span className="animate-pulse text-maroon dark:text-[#58a6ff]">|</span>
          </p>
          <h2 className="mb-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-[#e6edf3] sm:text-5xl">
            {site.hero.title}
          </h2>
          <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-700 dark:text-[#8b949e]">
            {site.hero.description}
          </p>
          <div className="flex flex-wrap gap-3">
            {['GenAI', 'RAG', 'Evaluation', 'Azure'].map((tag) => (
              <motion.span
                key={tag}
                whileHover={{ scale: 1.07 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600 cursor-default select-none transition-colors duration-200 dark:border-[#8B2635] dark:bg-[#21262d] dark:text-[#e6edf3]"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Avatar + ChatBot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative flex flex-col items-center gap-6 pt-2"
        >
          {/* Avatar */}
          <motion.button
            key={activeAvatar}
            type="button"
            onClick={handleAvatarClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative grid h-[220px] w-[220px] place-items-center overflow-hidden rounded-[2rem] bg-transparent p-3 drop-shadow-lg focus:outline-none dark:drop-shadow-[0_0_16px_rgba(139,38,53,0.4)] transition-transform duration-300 hover:scale-105"
            aria-label="Avatar mood toggle"
            animate={isKonamiActive ? { y: [0, -18, 0] } : undefined}
            transition={isKonamiActive ? { duration: 0.4, repeat: 3, ease: 'easeInOut' } : undefined}
            onAnimationComplete={() => {
              if (isKonamiActive) setIsKonamiActive(false);
            }}
          >
            <div className="relative h-full w-full">
              {(Object.entries(avatarMeta) as [keyof typeof avatarMeta, { src: string; alt: string }][]).map(
                ([key, meta]) => (
                  <Image
                    key={key}
                    src={meta.src}
                    alt={meta.alt}
                    fill
                    sizes="220px"
                    className="object-contain transition-opacity duration-300 ease-in-out"
                    style={{ opacity: key === activeAvatar ? 1 : 0 }}
                  />
                ),
              )}
            </div>
          </motion.button>

          {/* ChatBot */}
          <div className="w-full max-w-sm">
            <ChatBot defaultOpen hideToggle onMoodHint={handleMoodHint} />
          </div>
        </motion.div>
      </div>

      {showStayPopup && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 flex max-w-xs items-center gap-3 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-soft dark:border-[#30363d] dark:bg-[#161b22]"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-transparent dark:border-[#30363d]">
            <Image src="/avatars/avatar-waving.png" alt="Avatar waving" fill className="object-contain" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-[#e6edf3]">Still here? I see you 👀</p>
        </motion.div>
      )}
    </section>
  );
}
