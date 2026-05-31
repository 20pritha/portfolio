'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'sidebar-expanded';

export function useSidebar() {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const defaultExpanded =
      stored !== null ? stored === 'true' : window.innerWidth >= 768;
    setExpanded(defaultExpanded);
  }, []);

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return { expanded, toggle, mobileOpen, openMobile, closeMobile };
}
