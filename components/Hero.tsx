'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const mood = moods[moodIndex];

  useKonami(() => {
    setIsHovering(false);
    setIsKonamiActive(true);
  });

  useEffect(() => {
    if (!isKonamiActive) return;

    const timer = window.setTimeout(() => {
      setIsKonamiActive(false);
    }, 1400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isKonamiActive]);

  useEffect(() => {
    let hideTimer: number | undefined;
    const popupTimer = window.setTimeout(() => {
      setShowStayPopup(true);
      hideTimer = window.setTimeout(() => {
        setShowStayPopup(false);
      }, 4000);
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
        setTypewriterText(typewriterIsDeleting ? phrase.slice(0, typewriterText.length - 1) : phrase.slice(0, typewriterText.length + 1));
      }, speed);
    }

    return () => window.clearTimeout(timeout);
  }, [typewriterText, typewriterIsDeleting, typewriterPhaseIndex]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || coarse) return;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      if (panelRef.current) panelRef.current.style.transform = `translateY(${scrollY * -0.4}px)`;
      if (avatarRef.current) avatarRef.current.style.transform = `translateY(${scrollY * -0.6}px)`;
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateParallax);
      if (panelRef.current) panelRef.current.style.transform = '';
      if (avatarRef.current) avatarRef.current.style.transform = '';
    };
  }, []);

  const handleAvatarClick = () => {
    if (isKonamiActive) return;
    setMoodIndex((current) => (current + 1) % moods.length);
  };

  const activeAvatar = isKonamiActive ? 'dancing' : isHovering ? 'waving' : mood;
  const caption = isKonamiActive
    ? 'Konami mode active'
    : isHovering
    ? 'Waving hello'
    : mood === 'face'
    ? 'Face close-up'
    : mood === 'celebrating'
    ? 'Celebrating'
    : 'Thinking';

  return (
    <section id="hero" className="pt-20 relative overflow-hidden">
      <HeroDotGrid />
      <div className="hero-shape pointer-events-none" />
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div ref={panelRef}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="hero-panel max-w-3xl"
        >
          <div className="mb-6 flex flex-col items-center md:hidden">
            <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full ring-2 ring-[#8B2635]">
              <Image src="/avatars/avatar-face.png" alt="Pritha Mishra" fill className="object-contain" />
            </div>
            <ChatBot />
          </div>
          <HeroName />
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#8b949e]">{site.hero.subtitle}</p>
          <p className="mb-5 h-6 font-mono text-sm text-slate-700 dark:text-[#58a6ff]">
            {typewriterText}
            <span className="animate-pulse text-maroon dark:text-[#58a6ff]">|</span>
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-[#e6edf3] sm:text-5xl">
            {site.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 dark:text-[#8b949e]">{site.hero.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {['GenAI', 'RAG', 'Evaluation', 'Azure'].map((tag) => (
              <motion.span
                key={tag}
                whileHover={{ scale: 1.07 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600 cursor-default select-none transition-colors duration-200 hover:bg-[#8B2635] hover:border-[#8B2635] hover:text-white dark:border-[#8B2635] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:bg-[#8B2635] dark:hover:text-white"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
        </div>

        <div ref={avatarRef}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative hidden md:flex flex-col items-center justify-start gap-4 pt-4"
        >
          <motion.button
            key={activeAvatar}
            type="button"
            onClick={handleAvatarClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`relative grid h-[180px] w-[180px] max-w-full place-items-center overflow-hidden rounded-[2rem] bg-transparent p-3 drop-shadow-lg focus:outline-none sm:h-[200px] sm:w-[200px] dark:drop-shadow-[0_0_20px_rgba(139,38,53,0.3)] ${isHovering ? 'avatar-float' : ''}`}
            aria-label="Avatar mood toggle"
            animate={isKonamiActive ? { y: [0, -18, 0] } : undefined}
            transition={isKonamiActive ? { duration: 0.4, repeat: 3, ease: 'easeInOut' } : undefined}
            onAnimationComplete={() => {
              if (isKonamiActive) {
                setIsKonamiActive(false);
              }
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
                    sizes="200px"
                    className="object-contain transition-opacity duration-300 ease-in-out"
                    style={{ opacity: key === activeAvatar ? 1 : 0 }}
                  />
                ),
              )}
            </div>
          </motion.button>
          <ChatBot defaultOpen hideToggle />
        </motion.div>
        </div>
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
