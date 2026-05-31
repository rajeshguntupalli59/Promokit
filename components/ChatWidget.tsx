'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type Role = 'user' | 'assistant';
type Message = { role: Role; content: string };

const SUGGESTIONS = [
  'How do I get more customers on WhatsApp?',
  'What features does PromoKit have?',
  'How much does PromoKit cost?',
  'Tips for festival season marketing?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { return () => { abortRef.current?.abort() } }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Namaste! 🙏 I'm your PromoKit marketing assistant. Ask me anything about growing your business, Indian marketing strategies, or how PromoKit can help you — I'm here!",
      }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Append placeholder assistant message
    setMessages(m => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const current = accumulated;
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: current };
          return copy;
        });
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: "Sorry, I couldn't connect right now. Please try again!" };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(560px, calc(100vh - 120px))',
            background: '#0D0D0D',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF9500)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>🤖</div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-white text-sm">PromoKit Assistant</div>
              <div className="text-[10px] text-white/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                Online · Marketing Expert
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors text-lg leading-none">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF9500)' }}>🤖</div>
                )}
                <div
                  className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg, #FF6B1A, #FF9500)', color: '#fff', borderBottomRightRadius: '6px' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', borderBottomLeftRadius: '6px' }
                  }
                >
                  {m.content || (
                    <span className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Suggestion chips — only shown when no conversation yet */}
            {messages.length === 1 && !streaming && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{ background: 'rgba(255,107,26,0.12)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.3)' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about marketing or PromoKit…"
                disabled={streaming}
                className="flex-1 bg-transparent text-sm outline-none placeholder-white/25 text-white/85 min-w-0"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={input.trim() && !streaming
                  ? { background: 'linear-gradient(135deg, #FF6B1A, #FF9500)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}
              >
                {streaming ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-18 0" strokeOpacity="0.3" strokeLinecap="round"/>
                    <path d="M12 3a9 9 0 019 9" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: open ? 'rgba(30,30,30,0.95)' : 'linear-gradient(135deg, #FF6B1A, #FF9500)',
          border: open ? '1.5px solid rgba(255,255,255,0.15)' : 'none',
          boxShadow: open ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(255,107,26,0.5)',
        }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>
    </>
  );
}
