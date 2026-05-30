import Image from 'next/image';
import Link from 'next/link';
import GlitchHeading from '@/components/GlitchHeading';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream text-slate-950 flex items-center justify-center px-6 py-16">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-12 rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-center shadow-soft">
        <div className="relative flex h-[260px] w-[260px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-lg">
          <Image
            src="/avatars/avatar-confused.png"
            alt="Confused avatar"
            width={260}
            height={260}
            className="object-contain"
          />
        </div>

        <GlitchHeading className="text-[4.5rem] font-black text-maroon">404</GlitchHeading>

        <p className="max-w-md text-lg text-slate-700">This page doesn't exist... yet.</p>

        <Link
          href="/"
          className="inline-flex rounded-full border border-maroon px-7 py-3 text-sm font-semibold text-maroon transition hover:bg-maroon/10"
        >
          Take me home →
        </Link>
      </div>
    </main>
  );
}
