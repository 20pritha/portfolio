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
}

const SUGGESTIONS = [
  { emoji: '💼', label: 'What did you build?' },
  { emoji: '🤖', label: 'Tell me about your AI projects' },
  { emoji: '🎓', label: 'Where did you study?' },
  { emoji: '🏆', label: 'Any achievements?' },
  { emoji: '🛠️', label: "What's your tech stack?" },
  { emoji: '📬', label: 'How can I contact Pritha?' },
];

const SESSION_KEY = 'chatbot_msg_count';
const MSG_LIMIT = 10;

export default function ChatBot({ defaultOpen = false, hideToggle = false }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const msgCount = () => parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10);
  const bumpCount = () => sessionStorage.setItem(SESSION_KEY, String(msgCount() + 1));
  const isLimited = messages.length > 0 && msgCount() >= MSG_LIMIT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function send(text: string) {
    if (!text.trim() || isLoading || msgCount() >= MSG_LIMIT) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsLoading(true);
    setError(false);
    bumpCount();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
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

  return (
    <div className="mt-4 flex w-full flex-col items-center">
      {/* Toggle pill */}
      {!hideToggle && (
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`${!hideToggle ? 'mt-3' : ''} w-full max-w-[420px] overflow-hidden rounded-2xl border border-[#8B2635] bg-white shadow-lg dark:bg-[#161b22]`}
          >
            {/* Header */}
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

            {/* Messages */}
            <div className="flex max-h-[320px] min-h-[180px] flex-col gap-3 overflow-y-auto p-4 sm:max-h-[360px]">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-center text-xs text-slate-500 dark:text-[#8b949e]">
                    Ask me anything about Pritha ✨
                  </p>
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
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#8B2635] text-white'
                        : 'bg-slate-100 text-slate-800 dark:bg-[#21262d] dark:text-[#e6edf3]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
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
                        className="h-2 w-2 rounded-full bg-[#8B2635]"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
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
              className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#30363d] dark:bg-[#0d1117]"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLimited ? 'Session limit reached' : 'Ask about Pritha…'}
                disabled={isLoading || isLimited}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-[#8B2635] disabled:opacity-50 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#e6edf3] dark:placeholder-[#8b949e] dark:focus:border-[#8B2635]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isLimited}
                className="rounded-xl bg-[#8B2635] px-3 py-2 text-sm text-white transition-opacity disabled:opacity-40 hover:opacity-90"
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
