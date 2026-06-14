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
  onMoodHint,
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [usedActions, setUsedActions] = useState<Set<QuickLabel>>(new Set());
  const [typedLen, setTypedLen] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fullTextRef = useRef('');
  const typingIntervalRef = useRef<ReturnType<typeof setInterval>>();

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

  useEffect(() => {
    if (!isLoading) {
      clearInterval(typingIntervalRef.current);
      const full = fullTextRef.current;
      if (full) {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') updated[updated.length - 1] = { role: 'assistant', content: full };
          return updated;
        });
        setTypedLen(full.length);
      }
      return;
    }
    fullTextRef.current = '';
    setTypedLen(0);
    typingIntervalRef.current = setInterval(() => {
      setTypedLen(prev => {
        const full = fullTextRef.current;
        if (prev >= full.length) return prev;
        const remaining = full.slice(prev);
        const match = remaining.match(/^(\S+\s*)/);
        return prev + (match ? match[0].length : 1);
      });
    }, 40);
    return () => clearInterval(typingIntervalRef.current);
  }, [isLoading]);

  async function send(text: string) {
    if (!text.trim() || isLoading || msgCount() >= MSG_LIMIT) return;

    onMoodHint?.(detectMood(text));

    const matched = QUICK_ACTIONS.find(a => a.question === text.trim());
    if (matched) setUsedActions(prev => new Set([...prev, matched.label]));

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

      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullTextRef.current += chunk;
      }
    } catch {
      setError(true);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

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

      {messages.map((msg, i) => {
        const isStreamingMsg = isLoading && i === messages.length - 1 && msg.role === 'assistant';
        const displayContent = isStreamingMsg
          ? fullTextRef.current.slice(0, typedLen)
          : msg.content;
        if (msg.role === 'assistant' && !displayContent) return null;
        return (
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
          {displayContent && (
            <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'rounded-br-sm bg-[#8B2635] text-white'
                : 'rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-[#21262d] dark:text-[#f0f6fc]'
            }`}>
              {displayContent}
              {isStreamingMsg && (
                <span className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-current align-middle opacity-70" />
              )}
            </div>
          )}
        </motion.div>
        );
      })}

      {isLoading && typedLen === 0 && (
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

  return (
    <div className={heroLayout ? 'w-full' : 'mt-4 flex w-full flex-col items-center'}>
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

            {messageList(
              heroLayout ? 'min-h-[200px]' : 'min-h-[160px]',
              heroLayout ? 'max-h-[380px]' : 'max-h-[300px]',
              heroLayout ? 'p-6' : 'p-4',
            )}

            <div className="border-t border-slate-100 dark:border-[#8B2635]/10">
              {quickChips}
            </div>

            <div className={`border-t border-slate-100 bg-slate-50 dark:border-[#8B2635]/10 dark:bg-[#0d1117] ${heroLayout ? 'px-4 py-3' : 'px-3 py-2'}`}>
              {inputForm('px-0', 'py-0')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
