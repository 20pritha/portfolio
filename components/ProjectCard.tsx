'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isFlipped, setIsFlipped]   = useState(false);
  const [transform, setTransform]   = useState({ rotateX: 0, rotateY: 0 });
  const [isMobile, setIsMobile]     = useState(false);
  const HOVER_DELAY                 = 500;
  const flipTimerRef                = useRef<number | null>(null);

  useEffect(() => {
    const mql   = window.matchMedia('(max-width: 767px)');
    const check = () => setIsMobile(mql.matches);
    check();
    mql.addEventListener('change', check);
    return () => mql.removeEventListener('change', check);
  }, []);

  useEffect(() => () => { if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current); }, []);

  const cardStyle = useMemo(() => ({
    transform: `perspective(1000px) rotateX(${transform.rotateX + (isFlipped ? 180 : 0)}deg) rotateY(${transform.rotateY}deg)`,
    transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
    willChange: 'transform',
  }), [isFlipped, transform]);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const rotateY = ((event.clientX - left) / width  * 16) - 8;
    const rotateX = -((event.clientY - top)  / height * 16) + 8;
    setTransform({ rotateX, rotateY });
  };

  const actionButton = project.githubUrl ? (
    <a
      href={project.githubUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#732037] hover:scale-[1.03] hover:shadow-[0_0_16px_rgba(139,38,53,0.5)] active:scale-[0.97] transition"
    >
      <GitHubIcon />
      GitHub
    </a>
  ) : (
    <a
      href={project.detailsUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#732037] hover:scale-[1.03] hover:shadow-[0_0_16px_rgba(139,38,53,0.5)] active:scale-[0.97] transition"
    >
      View Details
    </a>
  );

  // ── Mobile: flat card — all info visible, no flip ──
  if (isMobile) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-[#8B2635]/30 dark:bg-[#1c2128]/90">
        <div className="flex items-start justify-between gap-3">
          {actionButton}
          <div className="flex flex-wrap justify-end gap-2">
            {project.stack.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600 dark:bg-[#21262d] dark:text-[#f0f6fc]">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-[#f0f6fc]">{project.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-[#a0aec0]">{project.description}</p>
        <p className="mt-4 text-lg font-bold text-maroon dark:drop-shadow-[0_0_8px_rgba(139,38,53,0.8)]">{project.metric}</p>
      </div>
    );
  }

  // ── Desktop: 3D flip card ──
  return (
    <div
      className="project-card-outer"
      onMouseEnter={(e) => {
        if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
        flipTimerRef.current = window.setTimeout(() => setIsFlipped(true), HOVER_DELAY);
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(139,38,53,0.18), 0 0 0 1px rgba(139,38,53,0.2)';
        (e.currentTarget as HTMLDivElement).style.transition = 'box-shadow 250ms ease';
      }}
      onMouseLeave={(e) => {
        if (flipTimerRef.current) { window.clearTimeout(flipTimerRef.current); flipTimerRef.current = null; }
        setIsFlipped(false);
        setTransform({ rotateX: 0, rotateY: 0 });
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
      onMouseMove={handleMove}
    >
      <div className="project-card-inner" style={cardStyle}>
        <div className="project-card-face project-card-front">
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600 dark:bg-[#21262d] dark:text-[#f0f6fc]">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-slate-950 dark:text-[#f0f6fc] break-words">{project.title}</h3>
          <p className="mt-4 text-slate-700 dark:text-[#a0aec0] break-words">{project.description}</p>
          <p className="mt-5 font-semibold text-slate-900 dark:text-[#f0f6fc] break-words">{project.metric}</p>
          <p className="mt-4 text-xs font-medium text-[#8B2635]/60 dark:text-[#8B2635]/80">Hover to see details →</p>
        </div>

        <div className="project-card-face project-card-back">
          <div className="flex flex-col h-full">
            <div className="mb-5">{actionButton}</div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#c07080]">Key metric</p>
              <p className="mt-4 text-3xl font-bold text-maroon dark:drop-shadow-[0_0_8px_rgba(139,38,53,0.8)]">{project.metric}</p>
            </div>
            <div className="mt-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#c07080]">Tech stack</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600 dark:bg-[#21262d] dark:text-[#f0f6fc]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
