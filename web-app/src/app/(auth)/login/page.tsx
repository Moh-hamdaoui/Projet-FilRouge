'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id?: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
};

type AuthResponse = {
  token: string;
  user: User;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://node-eemi.vercel.app';
const BRAND = '#f79a2f';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Erreur ${res.status}`);
      }

      const raw: unknown = await res.json();

      const isAuthResponse = (x: unknown): x is AuthResponse =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as { token?: unknown }).token === 'string' &&
        typeof (x as { user?: unknown }).user === 'object' &&
        (x as { user?: unknown }).user !== null;

      if (!isAuthResponse(raw)) {
        throw new Error('Réponse de connexion invalide');
      }

      localStorage.setItem('token', raw.token);
      localStorage.setItem('user', JSON.stringify(raw.user));

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
          Je me connecte
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full max-w-xl flex-col items-center gap-4"
        >
          <label className="w-full">
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

          <label className="w-full">
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

          {error && (
            <p className="w-full rounded-xl bg-red-500/10 p-3 text-center text-red-300 ring-1 ring-red-500/30">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="mt-2 h-12 w-52 rounded-xl px-6 font-semibold text-white shadow
                       disabled:cursor-not-allowed disabled:bg-neutral-700
                       transition hover:brightness-95"
            style={{ backgroundColor: BRAND }}
          >
            {loading ? 'Connexion…' : 'Connexion'}
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-400">
          Pas de compte ?{' '}
          <a href="/register" className="font-semibold" style={{ color: BRAND }}>
            Inscription
          </a>
        </p>
      </div>
    </main>
  );
}
