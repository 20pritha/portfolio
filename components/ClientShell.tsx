'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ClientShellProps {
  children: React.ReactNode;
}

export default function ClientShell({ children }: ClientShellProps) {
  const [phase, setPhase] = useState<'monogram' | 'content' | 'done'>('monogram');

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const t1 = window.setTimeout(() => setPhase('content'), 300);
    const t2 = window.setTimeout(() => {
      setPhase('done');
      document.body.classList.add('page-loaded');
    }, 600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {phase === 'monogram' ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex min-h-screen items-center justify-center"
        >
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 px-10 py-8 text-center shadow-soft dark:border-[#8B2635]/35 dark:bg-[#1c2128]">
            <span className="text-5xl font-black tracking-[0.35em] text-maroon">✦ PM</span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
