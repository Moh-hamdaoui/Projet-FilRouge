'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id?: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
  [key: string]: unknown;
};

type AuthResponse = {
  token: string;
  user: User;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE  ?? 'https://node-eemi.vercel.app';
const BRAND = '#f79a2f';

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: { name: string; email: string; password: string; role?: 'admin' } = {
        name,
        email,
        password,
      };
      if (isAdmin) payload.role = 'admin';

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Erreur ${res.status}`);
      }

      const raw: unknown = await res.json();

      // Type guard pour éviter toute fuite de any
      const isAuthResponse = (x: unknown): x is AuthResponse =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as { token?: unknown }).token === 'string' &&
        typeof (x as { user?: unknown }).user === 'object' &&
        (x as { user?: unknown }).user !== null;

      if (!isAuthResponse(raw)) {
        throw new Error('Réponse invalide du serveur');
      }

      localStorage.setItem('token', raw.token);
      localStorage.setItem('user', JSON.stringify(raw.user));

      window.dispatchEvent(new Event('auth:change'));
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Échec de la connexion';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-20">
        <h1 className="text-center text-5xl font-extrabold leading-tight md:text-7xl">
          Je m&apos;inscris
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-xl grid grid-cols-4 items-center gap-4"
        >
          <label className="col-span-4 w-full">
            <span className="sr-only">Nom</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Nom"
              className="h-12 w-full rounded-2xl bg-neutral-800/90 px-4 text-center text-white placeholder-neutral-300 ring-1 ring-neutral-700 outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </label>

          <label className="col-span-2 w-full">
            <span className="sr-only">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="h-12 w-full rounded-2xl bg-neutral-800/90 px-4 text-center text-white placeholder-neutral-300 ring-1 ring-neutral-700 outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </label>

          <label className="col-span-2 w-full">
            <span className="sr-only">Mot de passe</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="h-12 w-full rounded-2xl bg-neutral-800/90 px-4 text-center text-white placeholder-neutral-300 ring-1 ring-neutral-700 outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </label>

          <label className="col-span-4 flex items-center gap-3 text-neutral-300">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsAdmin(e.target.checked)}
              className="h-5 w-5 rounded accent-[#f79a2f] cursor-pointer"
            />
            <span>Compte administrateur</span>
          </label>

          {error && (
            <p className="col-span-4 w-full rounded-xl bg-red-500/10 p-3 text-center text-red-300 ring-1 ring-red-500/30">
              {error}
            </p>
          )}

          <div className="col-span-4 flex justify-center">
            <button
              type="submit"
              disabled={loading || !email || !password || !name}
              className="h-12 w-72 rounded-xl font-semibold text-white shadow
                         disabled:cursor-not-allowed disabled:bg-neutral-700
                         transition hover:brightness-95"
              style={{ backgroundColor: BRAND }}
            >
              {loading ? 'Confirmer…' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
