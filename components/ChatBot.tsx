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
  floating?: boolean;
  onMoodHint?: (mood: 'face' | 'celebrating' | 'thinking2') => void;
}

const QUICK_ACTIONS = [
  { label: 'Who are you?', question: 'Who are you?' },
  { label: 'Work',         question: 'What do you do and how can you help me?' },
  { label: 'Experience',   question: 'Tell me about your internship experience at QCG and NUS.' },
  { label: 'Skills',       question: 'Tell me about your skills and projects.' },
  { label: 'Contact',      question: 'How can I contact you?' },
] as const;

type QuickLabel = typeof QUICK_ACTIONS[number]['label'];

const SESSION_KEY = 'chatbot_msg_count';
const MSG_LIMIT = 10;

function detectMood(text: string): 'face' | 'celebrating' | 'thinking2' {
  const t = text.toLowerCase();
  if (/achiev|award|win|champion|robot|dance|club|finalist|competition|techfest|milan|jhalak/.test(t)) return 'celebrating';
  if (/build|project|ai|ml|rag|llm|stack|tech|code|engineer|intern|pipeline|eval|model|skill|azure|gemini|python|flask|explain|tell|journey|focus|impact|expert/.test(t)) return 'thinking2';
  return 'face';
}

export default function ChatBot({
  defaultOpen = false,
  hideToggle = false,
  heroLayout = false,
  floating = false,
  onMoodHint,
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [usedActions, setUsedActions] = useState<Set<QuickLabel>>(new Set());
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

    const matched = QUICK_ACTIONS.find(a => a.question === text.trim());
    if (matched) setUsedActions(prev => new Set([...prev, matched.label]));

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
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
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

  // ── Shared UI blocks ────────────────────────────────────────────

  const quickChips = (
    <div className="flex flex-wrap gap-2 px-4 py-2.5">
      {QUICK_ACTIONS.map(({ label, question }) => {
        const used = usedActions.has(label);
        return (
          <button
            key={label}
            onClick={() => send(question)}
            disabled={isLoading || isLimited}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 disabled:cursor-not-allowed
              ${used
                ? 'border-[#8B2635]/20 bg-transparent text-[#8B2635]/35 dark:text-[#8B2635]/30 cursor-default'
                : 'border-[#8B2635]/40 bg-white text-[#8B2635] hover:bg-[#8B2635] hover:text-white dark:bg-[#21262d] dark:text-[#f0f6fc] dark:border-[#8B2635]/50 dark:hover:bg-[#8B2635] dark:hover:border-[#8B2635] dark:hover:text-white'
              }`}
          >
            {used ? `✓ ${label}` : label}
          </button>
        );
      })}
    </div>
  );

  const messageList = (minH: string, maxH: string, pad: string) => (
    <div
      ref={messagesRef}
      className={`flex flex-col gap-3 overflow-y-auto ${minH} ${maxH} ${pad}`}
    >
      {messages.length === 0 && !isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="m-auto text-center text-xs text-slate-400 dark:text-[#8b949e]"
        >
          Pick a topic below or ask me anything ↓
        </motion.p>
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
          {msg.content && (
            <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'rounded-br-sm bg-[#8B2635] text-white'
                : 'rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-[#21262d] dark:text-[#f0f6fc]'
            }`}>
              {msg.content}
            </div>
          )}
        </motion.div>
      ))}

      {isLoading && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B2635] text-[9px] font-bold text-white">PM</div>
          <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-[#21262d]">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-[#8b949e]"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {error && <p className="text-center text-xs text-slate-400">Oops — try again!</p>}
      {isLimited && (
        <p className="text-center text-xs text-slate-500 dark:text-[#8b949e]">
          Session limit reached —{' '}
          <a href="mailto:pritha.mishra2003@gmail.com" className="text-[#8B2635] underline">reach out directly</a>!
        </p>
      )}
    </div>
  );

  const inputForm = (px: string, py: string) => (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${px} ${py}`}>
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isLimited ? 'Session limit reached' : 'Ask me anything...'}
        disabled={isLoading || isLimited}
        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-[#8B2635] disabled:opacity-50 dark:border-[#8B2635]/30 dark:bg-[#1c2128] dark:text-[#f0f6fc] dark:placeholder-[#8b949e] dark:focus:border-[#8B2635]"
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading || isLimited}
        className="rounded-xl bg-[#8B2635] px-3 py-2 text-sm text-white transition-opacity disabled:opacity-40 hover:opacity-90"
        aria-label="Send"
      >
        ↑
      </button>
    </form>
  );

  // ── Floating mode ────────────────────────────────────────────────

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
              className="flex w-[340px] flex-col overflow-hidden rounded-2xl border border-[#8B2635]/20 bg-white shadow-2xl dark:bg-[#1c2128]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-[#8B2635]/15">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8B2635] text-[10px] font-bold text-white">PM</div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-[#f0f6fc]">AI Pritha</span>
                    <span className="block text-[10px] text-slate-400 dark:text-[#8b949e]">Ask me about my work</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc]"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              {messageList('min-h-[160px]', 'max-h-[300px]', 'p-4')}

              {/* Input */}
              <div className="border-t border-slate-100 bg-slate-50 dark:border-[#8B2635]/10 dark:bg-[#0d1117]">
                {inputForm('px-3', 'py-2')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger bubble */}
        <motion.button
          onClick={() => setIsOpen(v => !v)}
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

  // ── Inline / hero layout mode ─────────────────────────────────────

  return (
    <div className={heroLayout ? 'w-full' : 'mt-4 flex w-full flex-col items-center'}>
      {!hideToggle && !heroLayout && (
        <button
          onClick={() => setIsOpen(v => !v)}
          className="flex items-center gap-2 rounded-full border border-[#8B2635] px-4 py-2 text-sm font-medium text-[#8B2635] transition-colors duration-200 hover:bg-[#8B2635] hover:text-white dark:text-[#f0f6fc] dark:hover:bg-[#8B2635] dark:hover:text-white"
          aria-expanded={isOpen}
        >
          💬 Ask me anything
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={heroLayout ? false : { opacity: 0, height: 0 }}
            animate={heroLayout ? undefined : { opacity: 1, height: 'auto' }}
            exit={heroLayout ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`flex flex-col overflow-hidden border border-[#8B2635] bg-white dark:bg-[#1c2128] ${
              heroLayout
                ? 'w-full rounded-3xl shadow-xl'
                : `${!hideToggle ? 'mt-3' : ''} w-full max-w-[420px] rounded-2xl shadow-lg`
            }`}
          >
            {/* Header (non-heroLayout only) */}
            {!heroLayout && (
              <div className="flex items-center justify-between border-b border-[#8B2635]/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="relative h-6 w-6 overflow-hidden rounded-full">
                    <Image src="/avatars/avatar-face.png" alt="Pritha" fill className="object-contain" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-[#f0f6fc]">AI Pritha</span>
                    <span className="block text-xs text-slate-400 dark:text-[#8b949e]">Ask me about my work</span>
                  </div>
                </div>
                {!hideToggle && (
                  <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-[#f0f6fc]" aria-label="Close">✕</button>
                )}
              </div>
            )}

            {/* Messages */}
            {messageList(
              heroLayout ? 'min-h-[200px]' : 'min-h-[160px]',
              heroLayout ? 'max-h-[380px]' : 'max-h-[300px]',
              heroLayout ? 'p-6' : 'p-4',
            )}

            {/* Quick chips — always visible */}
            <div className="border-t border-slate-100 dark:border-[#8B2635]/10">
              {quickChips}
            </div>

            {/* Input */}
            <div className={`border-t border-slate-100 bg-slate-50 dark:border-[#8B2635]/10 dark:bg-[#0d1117] ${heroLayout ? 'px-4 py-3' : 'px-3 py-2'}`}>
              {inputForm(heroLayout ? 'px-0' : 'px-0', heroLayout ? 'py-0' : 'py-0')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
