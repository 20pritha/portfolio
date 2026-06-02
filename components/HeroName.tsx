'use client';

import { useEffect, useRef, useState } from 'react';

const NAME = 'PRITHA MISHRA';
const SCRAMBLE_CHARS = '@#$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function HeroName() {
  const [text, setText] = useState(() => NAME.split('').map(() => '·').join(''));
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);

  useEffect(() => {
    setMounted(true);
    // Reveal each character with stagger on mount
    NAME.split('').forEach((char, i) => {
      const maxScrambles = 3 + Math.floor(Math.random() * 3);
      const outer = window.setTimeout(() => {
        let s = 0;
        const si = window.setInterval(() => {
          s += 1;
          setText((cur) => {
            const arr = cur.split('');
            arr[i] = char === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            return arr.join('');
          });
          if (s >= maxScrambles) {
            window.clearInterval(si);
            setText((cur) => {
              const arr = cur.split('');
              arr[i] = char;
              return arr.join('');
            });
          }
        }, 40);
        timeoutRefs.current.push(si);
      }, i * 55);
      timeoutRefs.current.push(outer);
    });

    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      timeoutRefs.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handleMouseEnter = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    intervalRef.current = window.setInterval(() => {
      setText((current) =>
        current.split('').map((char) => {
          if (char === ' ') return ' ';
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join(''),
      );
    }, 40);

    timeoutRefs.current.push(
      window.setTimeout(() => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        NAME.split('').forEach((letter, index) => {
          timeoutRefs.current.push(
            window.setTimeout(() => {
              setText((current) =>
                current.split('').map((char, idx) => (idx === index ? letter : char)).join(''),
              );
              if (index === NAME.length - 1) {
                timeoutRefs.current.push(
                  window.setTimeout(() => setIsAnimating(false), 80),
                );
              }
            }, 35 * index),
          );
        });
      }, 600),
    );
  };

  return (
    <h1
      className="mb-5 cursor-pointer text-4xl font-semibold tracking-tight text-slate-950 transition-colors duration-300 hover:text-maroon sm:text-5xl dark:text-[#e6edf3] dark:hover:text-maroon"
      onMouseEnter={handleMouseEnter}
      data-text={text}
      aria-label="Pritha Mishra"
      style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.2s' }}
    >
      {text}
    </h1>
  );
}
