'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  defaultOpen?: boolean;
  hideToggle?: boolean;
  heroLayout?: boolean;
  floating?: boolean;  // renders as fixed bottom-right bubble overlay
  onMoodHint?: (mood: 'face' | 'celebrating' | 'thinking2') => void;
}

const SUGGESTIONS = [
  { emoji: '', label: 'Who are you?' },
  { emoji: '', label: 'What have you built?' },
  { emoji: '', label: 'Why should I hire you?' },
  { emoji: '', label: "What's your story?" },
  { emoji: '', label: "What's your proudest project?" },
  { emoji: '', label: 'Open to opportunities?' },
];

const SESSION_KEY = 'chatbot_msg_count';
const MSG_LIMIT = 10;

function detectMood(text: string): 'face' | 'celebrating' | 'thinking2' {
  const t = text.toLowerCase();
  if (/achiev|award|win|key achiev|champion|robot|dance|club|finalist|competition|techfest|milan|jhalak/.test(t)) return 'celebrating';
  if (/build|project|ai|ml|rag|llm|stack|tech|code|engineer|intern|pipeline|eval|model|skill|azure|gemini|python|flask|explain|tell|journey|focus|impact|expert/.test(t)) return 'thinking2';
  return 'face';
}

export default function ChatBot({ defaultOpen = false, hideToggle = false, heroLayout = false, floating = false, onMoodHint }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const msgCount = () => parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10);
  const bumpCount = () => sessionStorage.setItem(SESSION_KEY, String(msgCount() + 1));
  const isLimited = messages.filter(m => m.role === 'user').length > 0 && msgCount() >= MSG_LIMIT;

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function send(text: string) {
    if (!text.trim() || isLoading || msgCount() >= MSG_LIMIT) return;

    onMoodHint?.(detectMood(text));

    const userMsg: Message = { role: 'user', content: text.trim() };
    const historyForApi = [...messages, userMsg];
    setMessages(historyForApi);
    setInput('');
    setIsLoading(true);
    setError(false);
    bumpCount();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message);

      if (data.message === '__warming_up__') {
        // HF model cold-starting — show status, don't add a message bubble
        setIsWarmingUp(true);
        setTimeout(() => setIsWarmingUp(false), 25000);
      } else {
        setIsWarmingUp(false);
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const showDots = isLoading;

  const cardMotion = heroLayout
    ? { initial: false as const, animate: undefined, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : hideToggle
    ? {
        initial: { opacity: 0, x: 60 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 60 },
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.45 },
      }
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto' as const },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.3, ease: 'easeInOut' as const },
      };

  // Floating mode: fixed bottom-right bubble.
  // Add <ChatBot floating /> to your root layout to get the persistent overlay.
  if (floating) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="float-panel"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-[340px] overflow-hidden rounded-2xl border border-[#8B2635]/30 bg-white shadow-2xl dark:bg-[#1c2128]"
            >
              {/* Floating panel header */}
              <div className="flex items-center justify-between border-b border-[#8B2635]/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8B2635] text-xs font-bold text-white">
                    PM
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-[#f0f6fc]">Virtual Pritha</span>
                    <span className="block text-xs text-slate-400 dark:text-[#a0aec0]">🤖 AI version of me</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:text-[#a0aec0] dark:hover:text-[#f0f6fc]"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div ref={messagesRef} className="flex max-h-[360px] min-h-[200px] flex-col gap-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                    <p className="text-center text-xs text-slate-500 dark:text-[#a0aec0]">To know more— Ask my Avatar 🤖</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Who are you?",
                        "What have you built?",
                        "Why should I hire you?",
                        "What's your story?",
                      ].map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:border-[#8B2635] hover:bg-[#8B2635]/5 dark:border-[#8B2635]/35 dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:border-[#8B2635]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B2635] text-[9px] font-bold text-white">
                        PM
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#8B2635] text-white' : 'bg-slate-100 text-slate-800 dark:bg-[#21262d] dark:text-[#f0f6fc]'}`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {showDots && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B2635] text-[9px] font-bold text-white">PM</div>
                    <div className="flex gap-1 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-[#21262d]">
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-[#a0aec0]" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {isWarmingUp && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center">
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
                      Model warming up (~20s) — try again shortly!
                    </p>
                  </motion.div>
                )}

                {error && <p className="text-center text-xs text-slate-400">Oops — try again!</p>}
                {isLimited && (
                  <p className="text-center text-xs text-slate-500 dark:text-[#a0aec0]">
                    Session limit reached —{' '}
                    <a href="mailto:pritha.mishra2003@gmail.com" className="text-[#8B2635] underline">reach out directly</a>!
                  </p>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#8B2635]/35 dark:bg-[#0d1117]">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLimited ? 'Session limit reached' : 'Ask me anything...'}
                  disabled={isLoading || isLimited}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-[#8B2635] disabled:opacity-50 dark:border-[#8B2635]/35 dark:bg-[#1c2128] dark:text-[#f0f6fc] dark:placeholder-[#a0aec0] dark:focus:border-[#8B2635]"
                />
                <button type="submit" disabled={!input.trim() || isLoading || isLimited} className="rounded-xl bg-[#8B2635] px-3 py-2 text-sm text-white transition-opacity disabled:opacity-40 hover:opacity-90">↑</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating trigger bubble */}
        <motion.button
          onClick={() => { setIsOpen((v) => !v); }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8B2635] shadow-lg"
          aria-label="Open chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="text-xl text-white">✕</motion.span>
            ) : (
              <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="text-xl text-white">💬</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    );
  }

  return (
    <div className={heroLayout ? 'w-full' : 'mt-4 flex w-full flex-col items-center'}>
      {/* Toggle pill — hidden in heroLayout or when hideToggle */}
      {!hideToggle && !heroLayout && (
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-[#8B2635] px-4 py-2 text-sm font-medium text-[#8B2635] transition-colors duration-200 hover:bg-[#8B2635] hover:text-white dark:border-[#8B2635] dark:text-[#f0f6fc] dark:hover:bg-[#8B2635] dark:hover:text-white"
          aria-expanded={isOpen}
        >
          💬 Ask me anything
        </button>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            {...cardMotion}
            className={`overflow-hidden border border-[#8B2635] bg-white dark:bg-[#1c2128] ${
              heroLayout
                ? 'w-full rounded-3xl shadow-xl'
                : `${!hideToggle ? 'mt-3' : ''} w-full max-w-[420px] rounded-2xl shadow-lg`
            }`}
          >
            {/* Header — only in non-heroLayout */}
            {!heroLayout && (
              <div className="flex items-center justify-between border-b border-[#8B2635]/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="relative h-6 w-6 overflow-hidden rounded-full">
                    <Image src="/avatars/avatar-face.png" alt="Pritha" fill className="object-contain" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-[#f0f6fc]">Virtual Pritha/span>
                    <span className="block text-xs text-slate-400 dark:text-[#a0aec0]">🤖 AI version of me</span>
                  </div>
                </div>
                {!hideToggle && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:text-[#a0aec0] dark:hover:text-[#f0f6fc]"
                    aria-label="Close chat"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Messages */}
            <div
              ref={messagesRef}
              className={`flex flex-col gap-3 overflow-y-auto ${
                heroLayout
                  ? 'min-h-[260px] max-h-[400px] p-6'
                  : 'min-h-[180px] max-h-[320px] sm:max-h-[360px] p-4'
              }`}
            >
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex flex-col gap-4 ${heroLayout ? 'my-auto items-center' : ''}`}
                >
                  <p className={`text-center text-slate-500 dark:text-[#a0aec0] ${heroLayout ? 'text-sm' : 'text-xs'}`}>
                    TO KNOW MORE - ASK MY AVATAR
                  </p>

                  {heroLayout ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => send(s.label)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition-colors hover:border-[#8B2635] hover:bg-[#8B2635]/5 dark:border-[#8B2635]/35 dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:border-[#8B2635]"
                        >
                          {s.emoji} {s.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => send(s.label)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:border-[#8B2635] hover:bg-[#8B2635]/5 dark:border-[#8B2635]/35 dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:border-[#8B2635]"
                        >
                          {s.emoji} {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full">
                      <Image src="/avatars/avatar-face.png" alt="Pritha" fill className="object-contain" />
                    </div>
                  )}
                  {msg.content && (
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#8B2635] text-white'
                          : 'bg-slate-100 text-slate-800 dark:bg-[#21262d] dark:text-[#f0f6fc]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                </motion.div>
              ))}

              {showDots && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full">
                    <Image src="/avatars/avatar-face.png" alt="Pritha" fill className="object-contain" />
                  </div>
                  <div className="flex gap-1 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-[#21262d]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-[#a0aec0]"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {isWarmingUp && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center"
                >
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
                    Model warming up (~20s) — try again in a moment!
                  </p>
                </motion.div>
              )}

              {error && (
                <p className="text-center text-xs text-slate-400 dark:text-[#a0aec0]">
                  Oops, something went wrong — try again!
                </p>
              )}

              {isLimited && (
                <p className="text-center text-xs text-slate-500 dark:text-[#a0aec0]">
                  You&apos;ve reached the session limit —{' '}
                  <a href="mailto:pritha.mishra2003@gmail.com" className="text-[#8B2635] underline">
                    reach out directly
                  </a>
                  !
                </p>
              )}

            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className={`flex items-center gap-2 border-t border-slate-200 bg-slate-50 dark:border-[#8B2635]/35 dark:bg-[#0d1117] ${heroLayout ? 'px-4 py-3' : 'px-3 py-2'}`}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLimited ? 'Session limit reached' : 'Ask me anything...'}
                disabled={isLoading || isLimited}
                className={`flex-1 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-[#8B2635] disabled:opacity-50 dark:border-[#8B2635]/35 dark:bg-[#1c2128] dark:text-[#f0f6fc] dark:placeholder-[#a0aec0] dark:focus:border-[#8B2635] ${heroLayout ? 'py-2.5 text-sm' : 'py-2 text-sm'}`}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isLimited}
                className={`rounded-xl bg-[#8B2635] text-white transition-opacity disabled:opacity-40 hover:opacity-90 ${heroLayout ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-sm'}`}
                aria-label="Send message"
              >
                ↑
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
