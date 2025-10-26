'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCount } from "@/lib/cart";

const BRAND = "#f79a2f";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://node-eemi.vercel.app";

type Role = 'admin' | 'user' | undefined;

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<Role>(undefined);
  const [hydrated, setHydrated] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  async function checkAuth() {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (!token || !rawUser) {
      setAuthed(false);
      setRole(undefined);
      return;
    }
    try {
      const r = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      setAuthed(r.ok);
    } catch {
      setAuthed(true);
    } finally {
      try {
        const u = JSON.parse(rawUser) as { role?: Role };
        setRole((u?.role as Role) ?? 'user');
      } catch { setRole(undefined); }
    }
  }

  useEffect(() => {
    setHydrated(true);
    checkAuth();
    setCartCount(getCount());
  }, []);

  useEffect(() => {
    const onAuth = () => checkAuth();
    const onCart = () => setCartCount(getCount());
    window.addEventListener('auth:change', onAuth);
    window.addEventListener('cart:change', onCart);
    return () => {
      window.removeEventListener('auth:change', onAuth);
      window.removeEventListener('cart:change', onCart);
    };
  }, []);

  useEffect(() => { checkAuth(); }, [pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event('auth:change'));
    router.push("/login");
  };

  const CartButton = (
    <Link
      href="/cart"
      aria-label={`Aller au panier (${cartCount})`}
      className="relative rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      {/* icône panier */}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="16" cy="20" r="1.5" />
        <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.6l1.2-6.2H7.1" />
      </svg>
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 grid min-w-[1.25rem] h-5 place-items-center rounded-full bg-white px-1 text-xs font-bold text-orange-600">
          {cartCount}
        </span>
      )}
      <span className="sr-only">Panier</span>
    </Link>
  );

  const SupportButton = role === 'user' && (
    <Link
      href="/chat"
      aria-label="Support"
      title="Support"
      className="rounded-xl bg-neutral-800 px-3 py-2 text-sm text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
      </svg>
    </Link>
  );

  const AdminChatButton = role === 'admin' && (
    <Link
      href="/admin/chat"
      aria-label="Messagerie admin"
      className="rounded-xl px-3 py-2 text-sm font-semibold text-white shadow transition hover:brightness-95"
      style={{ backgroundColor: BRAND }}
      title="Messagerie admin"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l3 6 6 .9-4.5 4.3 1 6L12 17l-5.5 3.2 1-6L3 9.9 9 9l3-6z"/>
      </svg>
    </Link>
  );

  return (
    <nav className="bg-neutral-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1 text-xl tracking-wider text-white">LOGO</Link>

        {hydrated && authed ? (
          <div className="flex items-center gap-3">
            {CartButton}
            {SupportButton}
            {AdminChatButton}
            <Link
              href="/profile"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition hover:brightness-95"
              style={{ backgroundColor: BRAND }}
            >
              Mon profile
            </Link>
            <button
              onClick={logout}
              className="rounded-xl bg-rose-500/95 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-500"
            >
              Me déconnecter
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {CartButton}
            {SupportButton}
            <Link
              href="/register"
              className="rounded-xl bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            >
              Inscription
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              Connexion
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
