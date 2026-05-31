'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  // Delay (ms) before the project card flips on hover. Increase to slow
  // down the flip reaction when users hover over project tiles.
  const HOVER_DELAY = 500;
  const flipTimerRef = useRef<number | null>(null);

  const cardStyle = useMemo(
    () => ({
      transform: `perspective(1000px) rotateX(${transform.rotateX + (isFlipped ? 180 : 0)}deg) rotateY(${transform.rotateY}deg)`,
      transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
      willChange: 'transform',
    }),
    [isFlipped, transform],
  );

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    const rotateY = ((x / width) * 16) - 8;
    const rotateX = -((y / height) * 16) + 8;
    setTransform({ rotateX, rotateY });
  };

  const resetTransform = () => setTransform({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) {
        window.clearTimeout(flipTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="project-card-outer"
      onMouseEnter={() => {
        if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
        flipTimerRef.current = window.setTimeout(() => setIsFlipped(true), HOVER_DELAY);
      }}
      onMouseLeave={() => {
        if (flipTimerRef.current) {
          window.clearTimeout(flipTimerRef.current);
          flipTimerRef.current = null;
        }
        setIsFlipped(false);
        resetTransform();
      }}
      onMouseMove={handleMove}
    >
      <div className="project-card-inner" style={cardStyle}>
        <div className="project-card-face project-card-front">
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-slate-950">{project.title}</h3>
          <p className="mt-4 text-slate-700">{project.description}</p>
          <p className="mt-5 font-semibold text-slate-900">{project.metric}</p>
        </div>

        <div className="project-card-face project-card-back">
          <div className="flex flex-col justify-between h-full">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Key metric</p>
              <p className="mt-4 text-3xl font-bold text-maroon">{project.metric}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Tech stack</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-maroon px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#732037]"
                  >
                    <GitHubIcon />
                    GitHub
                  </a>
                ) : (
                  <a
                    href={project.detailsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full bg-maroon px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#732037]"
                  >
                    View Details
                  </a>
                )}
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
