'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Line,
  LineChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import GlitchHeading from '@/components/GlitchHeading';
import SectionReveal from '@/components/SectionReveal';
import { useTheme } from '@/hooks/useTheme';
import cgpaData from '@/data/cgpa';

const renderCustomDot = ({ cx, cy, payload }: any) => {
  if (payload.sem === 'Sem 8') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={14} fill="rgba(139, 38, 53, 0.08)">
          <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r={6} fill="#8B2635" />
      </g>
    );
  }

  return <circle cx={cx} cy={cy} r={4} fill="#8B2635" />;
};

export default function AcademicGrowth() {
  const [showAvatar, setShowAvatar] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#8b949e]">Academic Growth</p>
            <GlitchHeading className="text-3xl font-semibold text-slate-950 dark:text-[#e6edf3]">
              CGPA progression with a clear upward trajectory.
            </GlitchHeading>
          </div>

          <div className={`grid gap-8 rounded-3xl border p-8 shadow-soft lg:grid-cols-[1.3fr_0.7fr] ${isDark ? 'border-[#30363d]/70 bg-[#161b22]/90' : 'border-slate-200 bg-white'}`}>
            <div className="relative h-[250px] md:h-[420px]">
              {showAvatar && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute right-4 top-4 z-[1] h-[120px] w-[120px] pointer-events-none hidden md:block"
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
                <AreaChart data={activeData} margin={{ top: 24, right: 24, bottom: 40, left: 16 }}>
                  <defs>
                    <linearGradient id="cgpaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B2635" stopOpacity={isDark ? 0.15 : 0.10} />
                      <stop offset="95%" stopColor="#8B2635" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={isDark ? '#21262d' : '#F1F5F9'} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="sem"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fill: isDark ? '#8b949e' : '#475569', fontSize: 10, textAnchor: 'middle' }}
                    angle={0}
                    dy={10}
                  />
                  <YAxis domain={[6, 10]} ticks={[6, 7, 8, 9, 10]} tickLine={false} axisLine={false} tick={{ fill: isDark ? '#8b949e' : '#475569' }} width={32} dx={-4} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, borderColor: isDark ? '#30363d' : '#E2E8F0', backgroundColor: isDark ? '#161b22' : '#fff' }}
                    labelStyle={{ color: isDark ? '#e6edf3' : '#0F172A' }}
                    itemStyle={{ color: isDark ? '#8b949e' : undefined }}
                    wrapperStyle={{ zIndex: 20 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8B2635"
                    strokeWidth={3}
                    fill="url(#cgpaGradient)"
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
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center gap-6">
              <div>
                <p className="text-base uppercase tracking-[0.35em] text-slate-500 dark:text-[#8b949e]">Degree</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-[#e6edf3]">B.Tech, Electronics &amp; Instrumentation Engineering</p>
                <p className="mt-3 text-slate-700 dark:text-[#8b949e]">SRM Institute of Science and Technology (2022–2026)</p>
              </div>
              <div className="rounded-3xl bg-white/50 p-5 text-slate-700 shadow-sm dark:bg-[#0d1117]/60 dark:text-[#8b949e]">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-[#8b949e]">Trajectory</p>
                <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-[#e6edf3]">Consistent upward trajectory  6.95 → 10.0 across 8 semesters.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
