'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import GlitchHeading from '@/components/GlitchHeading';
import SectionReveal from '@/components/SectionReveal';
import cgpaData from '@/data/cgpa';

const renderCustomDot = ({ cx, cy, payload }: any) => {
  if (payload.sem === 'Sem 8') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill="rgba(139, 38, 53, 0.16)" />
        <circle cx={cx} cy={cy} r={6} fill="#8B2635" />
      </g>
    );
  }

  return <circle cx={cx} cy={cy} r={4} fill="#8B2635" />;
};

export default function AcademicGrowth() {
  const [showAvatar, setShowAvatar] = useState(false);

  const activeData = useMemo(
    () => cgpaData.map((point) => ({ ...point, label: point.sem })),
    [],
  );

  return (
    <section id="academic">
      <SectionReveal label="academic growth">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-10 flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Academic Growth</p>
            <GlitchHeading className="text-3xl font-semibold text-slate-950">
              CGPA progression with a clear upward trajectory.
            </GlitchHeading>
          </div>

          <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-soft lg:grid-cols-[1.3fr_0.7fr]">
            <div className="relative h-[320px]">
              {showAvatar && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute right-4 top-4 z-10 h-[120px] w-[120px] pointer-events-none"
                >
                  <Image
                    src="/avatars/avatar-celebrating.png"
                    alt="Avatar celebrating academic growth"
                    fill
                    className="object-contain pointer-events-none"
                  />
                </motion.div>
              )}

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="4 4" />
                  <XAxis dataKey="sem" tickLine={false} axisLine={false} tick={{ fill: '#475569' }} />
                  <YAxis domain={[6.5, 10.5]} tickLine={false} axisLine={false} tick={{ fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, borderColor: '#E2E8F0' }}
                    labelStyle={{ color: '#0F172A' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8B2635"
                    strokeWidth={3}
                    dot={renderCustomDot}
                    activeDot={{ r: 6, fill: '#8B2635' }}
                    animationBegin={300}
                    animationDuration={2000}
                    onAnimationEnd={() => setShowAvatar(true)}
                  />
                  <ReferenceDot
                    x="Sem 4"
                    y={8.28}
                    r={4}
                    fill="#8B2635"
                    stroke="#8B2635"
                    label={{ position: 'top', value: '↑ Pivot', fill: '#8B2635', fontSize: 12 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center gap-6">
              <div>
                <p className="text-base uppercase tracking-[0.35em] text-slate-500">Degree</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">B.Tech, Electronics &amp; Instrumentation Engineering</p>
                <p className="mt-3 text-slate-700">SRM Institute of Science and Technology (2022–2026)</p>
              </div>
              <div className="rounded-3xl bg-cream p-5 text-slate-700 shadow-sm">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Trajectory</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">Consistent upward trajectory — 6.95 → 10.0 across 8 semesters.</p>
                <p className="mt-4 text-sm leading-7">
                  The chart highlights a pivotal shift in Semester 4 that accelerated academic momentum through the remaining semesters.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
