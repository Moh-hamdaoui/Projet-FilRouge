'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  attachListeners,
  connectWithToken,
  sendAdminMessage,
  requestHistory,       
} from '@/lib/socket';
import { useRouter } from 'next/navigation';

type Msg = { userId: string; from: 'user'|'admin'; text: string; at: number };
type Conv = { userId: string; last?: Msg };

export default function AdminChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Record<string, Msg[]>>({});
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);   

  useEffect(() => {
    const token = localStorage.getItem('token') ?? '';
    connectWithToken(token).then(({ ok }) => { if (!ok) router.push('/login'); });

    return attachListeners({
      onMessage: (m) => {
        setMessages(prev => {
          const arr = prev[m.userId] ? [...prev[m.userId], m] : [m];
          return { ...prev, [m.userId]: arr };
        });
        setConvs(prev => [{ userId: m.userId, last: m }, ...prev.filter(c => c.userId !== m.userId)]);
      },
      onHistory: ({ userId, items }) => {
        setMessages(prev => ({ ...prev, [userId]: items }));
      },
      onConversations: (items) => setConvs(items),
    });
  }, [router]);

  // ⬇️ DEMANDE l’historique complet quand on sélectionne une conversation
  useEffect(() => {
    if (active && !(messages[active]?.length)) {
      requestHistory(active);
    }
  }, [active, messages]);

  const current = useMemo(() => (active ? messages[active] ?? [] : []), [active, messages]);

  // ⬇️ Auto-scroll en bas quand la liste change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' });
  }, [current.length, active]);

  const send = () => {
    if (!active || !text.trim()) return;
    sendAdminMessage(active, text.trim());
    setText('');
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4 md:grid-cols-[280px,1fr]">
        <aside className="rounded-2xl bg-neutral-900/80 p-3 ring-1 ring-neutral-800">
          <h2 className="mb-2 font-semibold">Conversations</h2>
          <ul className="space-y-2">
            {convs.map((c) => (
              <li key={c.userId}>
                <button
                  onClick={() => setActive(c.userId)}
                  className={`w-full rounded-xl px-3 py-2 text-left ${active === c.userId ? 'bg-neutral-800' : 'hover:bg-neutral-800/60'}`}
                >
                  <div className="text-sm font-semibold">Utilisateur #{c.userId.slice(-4)}</div>
                  {c.last && <div className="line-clamp-1 text-xs text-neutral-400">{c.last.text}</div>}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-2xl bg-neutral-900/80 p-4 ring-1 ring-neutral-800">
          {active ? (
            <>
              <div className="mb-2 text-sm text-neutral-400">
                Conversation avec l’utilisateur {active}
              </div>

              <div
                ref={scrollRef}
                className="flex flex-col gap-2 max-h-[60vh] overflow-auto"
              >
                {current.map((m, i) => (
                  <div key={i} className={`max-w-[75%] rounded-xl px-3 py-2 ${m.from === 'admin' ? 'self-end bg-orange-500/90' : 'self-start bg-neutral-800'}`}>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span className="text-xs opacity-70">{new Date(m.at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Répondre…"
                  className="flex-1 rounded-xl bg-neutral-800 px-3 py-2 outline-none ring-1 ring-neutral-700"
                />
                <button onClick={send} className="rounded-xl bg-[#f79a2f] px-4 py-2 font-semibold text-white">
                  Envoyer
                </button>
              </div>
            </>
          ) : (
            <div className="text-neutral-400">Sélectionne une conversation à gauche.</div>
          )}
        </section>
      </div>
    </main>
  );
}
