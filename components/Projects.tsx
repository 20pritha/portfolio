'use client';

import { motion } from 'framer-motion';
import ProjectCard from '@/components/ProjectCard';
import SectionReveal from '@/components/SectionReveal';
import GlitchHeading from '@/components/GlitchHeading';
import projects from '@/data/projects';

export default function Projects() {
  return (
    <section id="projects">
      <SectionReveal label="projects">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-10 flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Projects</p>
            <GlitchHeading className="text-3xl font-semibold text-slate-950">
              Selected work that bridges AI and production.
            </GlitchHeading>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
