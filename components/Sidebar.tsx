'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import SidebarToggle from '@/components/SidebarToggle';
import site from '@/data/site';
import { useTheme } from '@/hooks/useTheme';

const sections = [
  { id: 'hero',         label: 'Home',           icon: '✦' },
  { id: 'about',        label: 'About',          icon: '◎' },
  { id: 'journey',      label: 'Journey',        icon: '⟳' },
  { id: 'experience',   label: 'Experience',     icon: '◈' },
  { id: 'projects',     label: 'Projects',       icon: '◇' },
  { id: 'skills',       label: 'Skills',         icon: '∷' },
  { id: 'academic',     label: 'Academic Growth',icon: '↗' },
  { id: 'publications', label: 'Publications',   icon: '≡' },
  { id: 'contact',      label: 'Contact',        icon: '⊕' },
];

const allSectionIds = ['hero', ...sections.map((s) => s.id)];

interface Props {
  expanded: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
}

export default function Sidebar({
  expanded,
  onToggle,
  mobileOpen,
  onMobileOpen,
  onMobileClose,
}: Props) {
  const [active, setActive] = useState('hero');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let raf = 0;

    const updateActive = () => {
      const centerY = window.innerHeight / 2;
      let closestId = 'hero';
      let closestDist = Infinity;

      allSectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - centerY);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = id;
        }
      });

      setActive(closestId);
    };

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5">
        <a href="#hero" onClick={onMobileClose} className="shrink-0">
          <Image
            src="/avatars/avatar-face.png"
            alt="Pritha Mishra"
            width={expanded ? 48 : 32}
            height={expanded ? 48 : 32}
            className="rounded-full object-contain transition-all duration-300"
          />
        </a>
        <div
          className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ${
            expanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 hidden'
          }`}
        >
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-[#e6edf3]">Pritha Mishra</p>
          <p className="truncate text-xs text-slate-500 dark:text-[#8b949e]">AI Engineer</p>
        </div>
      </div>

      {/* Status badge */}
      <div
        className={`mx-4 mb-4 overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-600 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]">
          <span className="inline-flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
          <span>building in Bengaluru 🇮🇳</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {sections.map(({ id, label, icon }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={onMobileClose}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-maroon/10 font-semibold text-maroon dark:bg-[#8B2635]/20 dark:text-[#e6edf3] dark:shadow-[inset_3px_0_0_#8B2635]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#8b949e] dark:hover:bg-white/5 dark:hover:text-[#e6edf3]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-maroon" />
              )}
              <span className="shrink-0 text-base leading-none">{icon}</span>
              <span
                className={`truncate transition-all duration-300 ${
                  expanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 overflow-hidden'
                }`}
              >
                {label}
              </span>
              {!expanded && (
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-full bg-cream px-3 py-1 text-xs font-medium text-maroon shadow-soft opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-50 dark:bg-[#161b22] dark:text-[#e6edf3]">
                  {label}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="px-2 pb-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#8B2635] hover:bg-[#8B2635]/10 w-full dark:text-[#e6edf3] dark:hover:bg-white/5"
        >
          <span className="shrink-0">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className={`truncate transition-all duration-300 ${expanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 overflow-hidden'}`}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </button>
      </div>

      {/* Visitor counter */}
      <div
        className={`px-4 pb-2 transition-all duration-300 ${
          expanded ? 'block' : 'hidden'
        }`}
      >
        <p className="text-[10px] text-slate-400 dark:text-[#8b949e]">
          <span className="text-maroon">👁</span> Visited by 1,247 builders
        </p>
      </div>

      {/* Bottom social links */}
      <div
        className={`flex items-center border-t border-slate-200/60 px-4 py-4 transition-all duration-300 dark:border-[#30363d] ${
          expanded ? 'gap-3' : 'flex-col gap-2 justify-center'
        }`}
      >
        <a
          href={site.contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-maroon hover:text-maroon dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:border-[#8B2635] dark:hover:text-[#e6edf3]"
        >
          <LinkedInIcon />
        </a>
        <a
          href={`mailto:${site.contact.email}`}
          title="Email"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-maroon hover:text-maroon dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:border-[#8B2635] dark:hover:text-[#e6edf3]"
        >
          <EmailIcon />
        </a>
        <span
          className={`truncate text-xs text-slate-400 dark:text-[#8b949e] transition-all duration-300 ${
            expanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 overflow-hidden'
          }`}
        >
          {site.contact.email}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-maroon/10 bg-cream transition-[width] duration-300 ease-in-out md:flex dark:bg-[#0d1117] dark:border-[#30363d] ${
          expanded ? 'w-60' : 'w-16'
        }`}
      >
        {navContent}
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-500 shadow-sm transition hover:border-maroon hover:text-maroon dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:border-[#8B2635] dark:hover:text-[#e6edf3]"
        >
          {expanded ? '‹' : '›'}
        </button>
      </aside>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMobileOpen}
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 shadow-md transition hover:border-maroon hover:text-maroon md:hidden dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3]"
      >
        ☰
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#8B2635]/10 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-60 flex-col border-r border-maroon/10 bg-cream transition-transform duration-[250ms] ease-in-out md:hidden dark:bg-[#0d1117] dark:border-[#30363d] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close navigation"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-500 shadow-sm transition hover:border-maroon hover:text-maroon dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:border-[#8B2635] dark:hover:text-[#e6edf3]"
        >
          ✕
        </button>
        {navContent}
      </aside>
    </>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}
