'use client';

import { useEffect, useMemo, useState } from 'react';
import BackHome from "@/app/components/BackHome";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { getCart, remove, clear, asIdList } from '@/lib/cart';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://node-eemi.vercel.app';
const BRAND = '#f79a2f';

type ProductsApi = { items: Product[] };

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [placing, setPlacing]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    setItems(getCart());

    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/products`, { cache: 'no-store' });
        if (!r.ok) throw new Error(`Erreur API ${r.status}`);
        const data: unknown = await r.json();

        const isProductsApi = (x: unknown): x is ProductsApi =>
          typeof x === 'object' &&
          x !== null &&
          Array.isArray((x as { items?: unknown }).items);

        setProducts(isProductsApi(data) ? data.items : []);
      } catch (_err: unknown) {
          const message = _err instanceof Error ? _err.message : String(_err);
          setError(`Impossible de charger les produits : ${message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    const map = new Map(products.map(p => [p.id, p]));
    return Object.entries(items)
      .map(([id, qty]) => ({ product: map.get(id), qty }))
      .filter((r): r is { product: Product; qty: number } => Boolean(r.product));
  }, [items, products]);

  const total = rows.reduce((sum, r) => sum + r.product.price * r.qty, 0);

  async function checkout() {
    setPlacing(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push("/login");
        return; 
      }


      const itemsList = asIdList();
      const body: unknown = { items: itemsList };
      if (!Array.isArray((body as { items: unknown }).items)) {
        throw new Error('Panier invalide');
      }

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Erreur ${res.status}`);
      }

      clear();
      setItems({});
      alert('Commande créée');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la commande';
      setError(message);
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="mb-6 text-4xl font-extrabold">Panier</h1>
          <div className="rounded-3xl bg-neutral-900/80 p-6 ring-1 ring-neutral-800 animate-pulse h-40" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div>
          <BackHome/>
        </div>

        <h1 className="mb-6 text-4xl md:text-5xl font-extrabold">Panier</h1>

        {rows.length === 0 ? (
          <p className="text-neutral-400">Votre panier est vide.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
            <ul className="space-y-3">
              {rows.map(({ product, qty }) => (
                <li key={product.id} className="flex items-center justify-between rounded-2xl bg-neutral-900/80 p-3 ring-1 ring-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-neutral-400">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { remove(product.id, qty); setItems(getCart()); }}
                      className="ml-3 rounded-xl bg-rose-500/90 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-500"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="space-y-3 rounded-2xl bg-neutral-900/80 p-4 ring-1 ring-neutral-800 h-fit">
              <div className="flex justify-between text-neutral-300">
                <span>Total</span>
                <span className="font-semibold text-white">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(total)}
                </span>
              </div>
              {error && (
                <p className="rounded-lg bg-red-500/10 p-3 text-red-300 ring-1 ring-red-500/30">{error}</p>
              )}
              <button
                onClick={checkout}
                disabled={placing || rows.length === 0}
                className="w-full rounded-xl px-5 py-2.5 font-medium text-white shadow
                           disabled:cursor-not-allowed disabled:bg-neutral-700
                           transition hover:brightness-95"
                style={{ backgroundColor: BRAND }}
              >
                {placing ? 'Commande…' : 'Commander'}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
