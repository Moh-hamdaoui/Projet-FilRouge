'use client';

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

type ChatMessage = { userId: string; from: 'user'|'admin'; text: string; at: number };

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(WS_URL, { autoConnect: false, transports: ['websocket'] });
  }
  return socket;
}

export function connectWithToken(token: string) {
  return new Promise<{ ok: boolean; error?: string }>((resolve) => {
    const s = getSocket();
    const onOk = () => { cleanup(); resolve({ ok: true }); };
    const onErr = (e: string) => { cleanup(); resolve({ ok: false, error: e }); };
    const cleanup = () => {
      s.off('auth:ok', onOk);
      s.off('auth:error', onErr);
    };

    s.connect();
    s.on('connect', () => s.emit('auth', { token }));
    s.once('auth:ok', onOk);
    s.once('auth:error', onErr);
  });
}

export function sendUserMessage(text: string) {
  getSocket().emit('message:user', { text });
}
export function sendAdminMessage(toUserId: string, text: string) {
  getSocket().emit('message:admin', { toUserId, text });
}

export type Listeners = {
  onMessage?: (m: ChatMessage) => void;
  onHistory?: (payload: { userId: string; items: ChatMessage[] }) => void;
  onConversations?: (items: Array<{ userId: string; last?: ChatMessage }>) => void;
};
export function attachListeners({ onMessage, onHistory, onConversations }: Listeners) {
  const s = getSocket();
  if (onMessage) s.on('message', onMessage);
  if (onHistory) s.on('history', onHistory);
  if (onConversations) s.on('conversations:list', onConversations);
  return () => {
    if (onMessage) s.off('message', onMessage);
    if (onHistory) s.off('history', onHistory);
    if (onConversations) s.off('conversations:list', onConversations);
  };
}

export function requestHistory(userId: string) {
  getSocket().emit('history:get', { userId });
}
