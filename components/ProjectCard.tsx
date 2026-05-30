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
              <a
                href={project.detailsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex rounded-full bg-maroon px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#732037]"
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
