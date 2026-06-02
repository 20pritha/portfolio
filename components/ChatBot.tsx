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
  onMoodHint?: (mood: 'face' | 'celebrating' | 'thinking2') => void;
}

const SUGGESTIONS = [
  { emoji: '◎', label: 'Current work & focus' },
  { emoji: '◆', label: 'Most impactful project' },
  { emoji: '◉', label: 'Journey into AI engineering' },
  { emoji: '◇', label: 'Technical expertise & stack' },
  { emoji: '△', label: 'Key achievements' },
  { emoji: '→', label: 'Open to opportunities?' },
];

const SESSION_KEY = 'chatbot_msg_count';
const MSG_LIMIT = 10;

function detectMood(text: string): 'face' | 'celebrating' | 'thinking2' {
  const t = text.toLowerCase();
  if (/achiev|award|win|key achiev|champion|robot|dance|club|finalist|competition|techfest|milan|jhalak/.test(t)) return 'celebrating';
  if (/build|project|ai|ml|rag|llm|stack|tech|code|engineer|intern|pipeline|eval|model|skill|azure|gemini|python|flask|explain|tell|journey|focus|impact|expert/.test(t)) return 'thinking2';
  return 'face';
}

export default function ChatBot({ defaultOpen = false, hideToggle = false, heroLayout = false, onMoodHint }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
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
    setMessages([...historyForApi, { role: 'assistant', content: '' }]);
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

      if (!res.ok) throw new Error('stream error');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
          try {
            const json = JSON.parse(line.slice(6));
            const token =
              json.choices?.[0]?.delta?.content ||
              json.choices?.[0]?.delta?.reasoning ||
              '';
            if (token) {
              accumulated += token;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: accumulated };
                return copy;
              });
            }
          } catch {}
        }
      }

      if (!accumulated) throw new Error('empty stream');
    } catch {
      setError(true);
      setMessages(prev =>
        prev[prev.length - 1]?.content === '' ? prev.slice(0, -1) : prev,
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const showBrain =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === 'assistant' &&
    messages[messages.length - 1]?.content === '';

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

  return (
    <div className={heroLayout ? 'w-full' : 'mt-4 flex w-full flex-col items-center'}>
      {/* Toggle pill — hidden in heroLayout or when hideToggle */}
      {!hideToggle && !heroLayout && (
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-[#8B2635] px-4 py-2 text-sm font-medium text-[#8B2635] transition-colors duration-200 hover:bg-[#8B2635] hover:text-white dark:border-[#8B2635] dark:text-[#e6edf3] dark:hover:bg-[#8B2635] dark:hover:text-white"
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
            className={`overflow-hidden border border-[#8B2635] bg-white dark:bg-[#161b22] ${
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
                  <span className="text-sm font-semibold text-slate-900 dark:text-[#e6edf3]">Pritha&apos;s Assistant</span>
                </div>
                {!hideToggle && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:text-[#8b949e] dark:hover:text-[#e6edf3]"
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
                  <p className={`text-center text-slate-500 dark:text-[#8b949e] ${heroLayout ? 'text-sm' : 'text-xs'}`}>
                    Ask me anything about Pritha ✨
                  </p>

                  {heroLayout ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => send(s.label)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition-colors hover:border-[#8B2635] hover:bg-[#8B2635]/5 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:border-[#8B2635]"
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
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:border-[#8B2635] hover:bg-[#8B2635]/5 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:border-[#8B2635]"
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
                          : 'bg-slate-100 text-slate-800 dark:bg-[#21262d] dark:text-[#e6edf3]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Brain — only while waiting for first token */}
              {showBrain && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full">
                    <Image src="/avatars/avatar-face.png" alt="Pritha" fill className="object-contain" />
                  </div>
                  <div className="flex items-center rounded-2xl bg-slate-100 px-4 py-3 dark:bg-[#21262d]">
                    <motion.span
                      className="select-none text-lg leading-none"
                      animate={{ scale: [1, 1.25, 0.9, 1.15, 1], rotate: [0, -10, 10, -5, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      🧠
                    </motion.span>
                  </div>
                </motion.div>
              )}

              {error && (
                <p className="text-center text-xs text-slate-400 dark:text-[#8b949e]">
                  Oops, something went wrong — try again!
                </p>
              )}

              {isLimited && (
                <p className="text-center text-xs text-slate-500 dark:text-[#8b949e]">
                  You&apos;ve reached the session limit —{' '}
                  <a href="mailto:pritha.mishra2003@gmail.com" className="text-[#8B2635] underline">
                    reach out directly
                  </a>
                  !
                </p>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className={`flex items-center gap-2 border-t border-slate-200 bg-slate-50 dark:border-[#30363d] dark:bg-[#0d1117] ${heroLayout ? 'px-4 py-3' : 'px-3 py-2'}`}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLimited ? 'Session limit reached' : 'Ask about Pritha…'}
                disabled={isLoading || isLimited}
                className={`flex-1 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-[#8B2635] disabled:opacity-50 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3] dark:placeholder-[#8b949e] dark:focus:border-[#8B2635] ${heroLayout ? 'py-2.5 text-sm' : 'py-2 text-sm'}`}
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
