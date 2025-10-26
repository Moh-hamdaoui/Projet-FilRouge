import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE ?? 'https://node-eemi.vercel.app';
const APP_ORIGIN = process.env.APP_ORIGIN ?? 'http://localhost:3000';

type User = { id: string; name?: string; role?: 'admin'|'user'; email?: string };
type ChatMessage = { userId: string; from: 'user'|'admin'; text: string; at: number };

const conversations = new Map<string, ChatMessage[]>();

const app = express();
app.use(cors({ origin: APP_ORIGIN }));
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: APP_ORIGIN, methods: ['GET','POST'] }
});

io.on('connection', (socket) => {
  socket.on('auth', async ({ token }: { token?: string }) => {
    if (!token) return socket.emit('auth:error', 'missing_token');

    try {
      const r = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!r.ok) throw new Error('invalid_token');
      const { user } = (await r.json()) as { user: User };

      const userRoom = `user:${user.id}`;
      socket.data.user = user;
      socket.join(userRoom);
      if (user.role === 'admin') socket.join('admins');

      const history = conversations.get(user.id) ?? [];
      socket.emit('history', { userId: user.id, items: history });

      if (user.role === 'admin') {
        const overview = Array.from(conversations.entries())
          .map(([uid, items]) => ({ userId: uid, last: items[items.length - 1] }));
        socket.emit('conversations:list', overview);
      }

      socket.emit('auth:ok', { me: user });
    } catch (e) {
      socket.emit('auth:error', 'invalid_token');
    }
  });

  socket.on('message:user', ({ text }: { text: string }) => {
    const user: User | undefined = socket.data.user;
    if (!user) return;
    const msg: ChatMessage = { userId: user.id, from: 'user', text, at: Date.now() };
    const arr = conversations.get(user.id) ?? [];
    arr.push(msg);
    conversations.set(user.id, arr);

    io.to(`user:${user.id}`).emit('message', msg);   
    io.to('admins').emit('message', msg);          
  });

  socket.on('message:admin', ({ toUserId, text }: { toUserId: string; text: string }) => {
    const me: User | undefined = socket.data.user;
    if (!me || me.role !== 'admin') return;
    const msg: ChatMessage = { userId: toUserId, from: 'admin', text, at: Date.now() };
    const arr = conversations.get(toUserId) ?? [];
    arr.push(msg);
    conversations.set(toUserId, arr);

    io.to(`user:${toUserId}`).emit('message', msg); 
    io.to('admins').emit('message', msg);      
  });

    socket.on('history:get', ({ userId }: { userId: string }) => {
    const me = socket.data.user;
    if (!me || me.role !== 'admin') return;
    const items = conversations.get(userId) ?? [];
    socket.emit('history', { userId, items });
  });
});

const PORT = Number(process.env.PORT ?? 4000);
server.listen(PORT, () => {
  console.log('WS server on :' + PORT);
});
