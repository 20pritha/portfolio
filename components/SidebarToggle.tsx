'use client';

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export default function SidebarToggle({ expanded, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-500 shadow-sm transition hover:border-maroon hover:text-maroon"
    >
      {expanded ? '‹' : '›'}
    </button>
  );
}
