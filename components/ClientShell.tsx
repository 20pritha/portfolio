'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ClientShellProps {
  children: React.ReactNode;
}

export default function ClientShell({ children }: ClientShellProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShowSplash(false), 800);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('page-loaded', !showSplash);
  }, [showSplash]);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex min-h-screen items-center justify-center"
        >
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 px-10 py-8 text-center shadow-soft">
            <span className="text-5xl font-black tracking-[0.35em] text-maroon">✦ PM</span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
