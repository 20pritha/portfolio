'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import confetti from 'canvas-confetti';
import emailjs from 'emailjs-com';
import { motion } from 'framer-motion';
import GlitchHeading from '@/components/GlitchHeading';
import SectionReveal from '@/components/SectionReveal';
import site from '@/data/site';

const initialForm = { name: '', designation: '', email: '', message: '' };
const placeholderText = {
  name: 'e.g. Elon Musk',
  designation: 'e.g. Engineering Manager, Google',
  email: 'e.g. samaltman@openai.com',
  message: "e.g. Let's connect...",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [placeholders, setPlaceholders] = useState({ name: '', designation: '', email: '', message: '' });
  const [avatarMood, setAvatarMood] = useState<'waving' | 'celebrating'>('waving');
  const [bounceAvatar, setBounceAvatar] = useState(false);
  const celebrateTimer = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPlaceholders(placeholderText);
      return;
    }

    const timers: number[] = [];
    const sequence = [
      { key: 'name', text: placeholderText.name, delay: 0 },
      { key: 'designation', text: placeholderText.designation, delay: 900 },
      { key: 'email', text: placeholderText.email, delay: 2000 },
      { key: 'message', text: placeholderText.message, delay: 3200 },
    ] as const;

    sequence.forEach(({ key, text, delay }) => {
      for (let i = 0; i <= text.length; i += 1) {
        timers.push(
          window.setTimeout(() => {
            setPlaceholders((current) => ({ ...current, [key]: text.slice(0, i) }));
          }, delay + i * 40),
        );
      }
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    return () => {
      if (celebrateTimer.current) {
        window.clearTimeout(celebrateTimer.current);
      }
    };
  }, []);

  const isValid = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      form.designation.trim().length > 1 &&
      form.email.includes('@') &&
      form.message.trim().length > 10
    );
  }, [form]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setSuccess(false);
      setStatus('Please complete all fields with a valid email and a meaningful message.');
      return;
    }

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? '',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? '',
        {
          from_name: form.name,
          from_designation: form.designation,
          from_email: form.email,
          message: form.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_USER_ID ?? '',
      );

      setSuccess(true);
      setStatus('> message sent successfully ✦');
      setForm(initialForm);
      setAvatarMood('celebrating');
      setBounceAvatar(true);
      if (celebrateTimer.current) {
        window.clearTimeout(celebrateTimer.current);
      }
      celebrateTimer.current = window.setTimeout(() => {
        setAvatarMood('waving');
        setBounceAvatar(false);
      }, 1500);

      confetti({
        particleCount: 80,
        spread: 58,
        origin: { y: 0.65 },
        colors: ['#8B2635', '#FAF7F2'],
        scalar: 1.1,
      });
    } catch (error) {
      console.error(error);
      setSuccess(false);
      setStatus('Unable to send the message right now. Please email directly or try again later.');
      setAvatarMood('waving');
      setBounceAvatar(false);
    }
  };

  return (
    <section id="contact">
      <SectionReveal label="contact">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-10 flex flex-wrap items-center gap-6">
            <div className="min-w-[220px]">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Contact</p>
              <GlitchHeading className="text-3xl font-semibold text-slate-950">
                {site.contact.heading}
              </GlitchHeading>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="h-[160px] w-[160px] sm:h-[224px] sm:w-[224px]"
            >
              <motion.div
                animate={bounceAvatar ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="relative h-full w-full"
              >
                <Image
                  src={avatarMood === 'celebrating' ? '/avatars/avatar-celebrating.png' : '/avatars/avatar-waving.png'}
                  alt={avatarMood === 'celebrating' ? 'Contact celebrating avatar' : 'Contact waving avatar'}
                  fill
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
              <p className="text-lg font-semibold text-slate-950">Email</p>
              <p className="mt-4 break-words whitespace-normal text-slate-700">{site.contact.email}</p>
              <p className="mt-8 text-lg font-semibold text-slate-950">LinkedIn</p>
              <a
                href={site.contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block break-words whitespace-normal text-maroon underline"
              >
                {site.contact.linkedInLabel}
              </a>
              <p className="mt-8 text-lg font-semibold text-slate-950">GitHub</p>
              <a
                href={site.contact.github}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block break-words whitespace-normal text-maroon underline"
              >
                {site.contact.githubLabel}
              </a>
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
              <div className="space-y-5">
                <label className="group block text-sm font-medium text-slate-800">
                  Name
                  <div className="mt-2 relative">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={placeholders.name}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-transparent focus:ring-0"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-maroon transition-transform duration-300 group-focus-within:scale-x-100" />
                  </div>
                </label>

                <label className="group block text-sm font-medium text-slate-800">
                  Designation
                  <div className="mt-2 relative">
                    <input
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      placeholder={placeholders.designation}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-transparent focus:ring-0"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-maroon transition-transform duration-300 group-focus-within:scale-x-100" />
                  </div>
                </label>

                <label className="group block text-sm font-medium text-slate-800">
                  Email
                  <div className="mt-2 relative">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={placeholders.email}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-transparent focus:ring-0"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-maroon transition-transform duration-300 group-focus-within:scale-x-100" />
                  </div>
                </label>

                <label className="group block text-sm font-medium text-slate-800">
                  Message
                  <div className="mt-2 relative">
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      placeholder={placeholders.message}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-transparent focus:ring-0"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-maroon transition-transform duration-300 group-focus-within:scale-x-100" />
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={!isValid}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#8B2635] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#6B1D2A] hover:scale-[1.02] active:bg-[#6B1D2A] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send Message
              </button>
              {status ? (
                <p className={`mt-4 text-sm ${success ? 'font-mono text-maroon' : 'text-slate-600'}`}>{status}</p>
              ) : null}
            </form>
          </div>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
