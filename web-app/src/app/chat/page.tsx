'use client';

import { useEffect, useState } from 'react';
import { attachListeners, connectWithToken, sendUserMessage } from '@/lib/socket';

type Msg = { userId: string; from: 'user'|'admin'; text: string; at: number };

export default function UserChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') ?? '';
    connectWithToken(token).then(({ ok }) => setReady(ok));
    return attachListeners({
      onMessage: (m) => setMessages((prev) => [...prev, m]),
      onHistory: ({ items }) => setMessages(items),
    });
  }, []);

  const send = () => {
    if (!text.trim()) return;
    sendUserMessage(text.trim());
    setText('');
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-4 text-3xl font-extrabold">Support</h1>

        {!ready && (
          <p className="mb-4 rounded-lg bg-yellow-500/10 p-3 text-yellow-300 ring-1 ring-yellow-500/30">
            Connexion au chat…
          </p>
        )}

        <div className="space-y-2 rounded-2xl bg-neutral-900/80 p-4 ring-1 ring-neutral-800">
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[75%] rounded-xl px-3 py-2 ${m.from === 'user' ? 'self-end bg-orange-500/90' : 'self-start bg-neutral-800'}`}>
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
              placeholder="Écrivez votre message…"
              className="flex-1 rounded-xl bg-neutral-800 px-3 py-2 outline-none ring-1 ring-neutral-700"
            />
            <button onClick={send} className="rounded-xl bg-[#f79a2f] px-4 py-2 font-semibold text-white">
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
