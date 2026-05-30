'use client';

import { useEffect, useRef, useState } from 'react';

const NAME = 'PRITHA MISHRA';
const SCRAMBLE_CHARS = '@#$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function HeroName() {
  const [text, setText] = useState(NAME);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      timeoutRefs.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const scramble = () => {
    setText((current) =>
      current
        .split('')
        .map((char) => {
          if (char === ' ') return ' ';
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join(''),
    );
  };

  const handleMouseEnter = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    intervalRef.current = window.setInterval(scramble, 40);

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
                current
                  .split('')
                  .map((char, idx) => (idx === index ? letter : char))
                  .join(''),
              );

              if (index === NAME.length - 1) {
                timeoutRefs.current.push(
                  window.setTimeout(() => {
                    setIsAnimating(false);
                  }, 80),
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
      className="mb-5 cursor-pointer text-4xl font-semibold tracking-tight text-slate-950 transition-colors duration-300 hover:text-maroon sm:text-5xl"
      onMouseEnter={handleMouseEnter}
      data-text={text}
      aria-label="Pritha Mishra"
    >
      {text}
    </h1>
  );
}
