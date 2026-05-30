'use client';

import { useEffect, useRef } from 'react';

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export default function useKonami(onActivate: () => void) {
  const sequenceIndex = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const expected = KONAMI_SEQUENCE[sequenceIndex.current];

      if (key.toLowerCase() === expected.toLowerCase()) {
        sequenceIndex.current += 1;

        if (sequenceIndex.current === KONAMI_SEQUENCE.length) {
          onActivate();
          sequenceIndex.current = 0;
        }
      } else {
        sequenceIndex.current = key.toLowerCase() === KONAMI_SEQUENCE[0].toLowerCase() ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onActivate]);
}
