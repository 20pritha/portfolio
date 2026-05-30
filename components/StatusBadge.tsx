'use client';

export default function StatusBadge() {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-600 shadow-sm md:flex">
      <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
      <span>currently building in Bengaluru 🇮🇳</span>
    </div>
  );
}
