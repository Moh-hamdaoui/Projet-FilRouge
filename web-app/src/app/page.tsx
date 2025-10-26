'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import hero from '@/app/images/burger.png';
import ProductCard from '@/app/components/ProductCard';

type ApiProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

type ApiResponse = {
  items: ApiProduct[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://node-eemi.vercel.app';

export default function Home() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`API error ${res.status}`);

        const raw: unknown = await res.json();

        const isApiResponse = (x: unknown): x is ApiResponse =>
          typeof x === 'object' &&
          x !== null &&
          'items' in x &&
          Array.isArray((x as { items: unknown }).items);

        setProducts(isApiResponse(raw) ? raw.items : []);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Erreur inattendue';
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAdd = (id: string) => {
    console.log('add', id);
  };

  return (
    <main className="bg-neutral-950 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <section className="relative h-72 rounded-3xl overflow-hidden md:h-[380px]">
          <Image src={hero} alt="Burgerito" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <div className="space-y-2">
              <p className="max-w-xl text-sm leading-relaxed text-white md:text-base">
                Lorem ipsum dolor sit amet consectetur. Velit nisl tempus mattis sit mauris nunc
                adipiscing sit massa. Maecenas vel facilisis arcu turpis nunc.
              </p>
              <h1
                className="font-extrabold leading-[0.9] tracking-tight text-[clamp(2.75rem,8vw,7rem)]"
                style={{ color: '#f79a2f' }}
              >
                BURGERITO
              </h1>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-neutral-900/80 ring-1 ring-neutral-800 p-3">
                  <div className="animate-pulse">
                    <div className="aspect-[4/3] w-full rounded-2xl bg-neutral-800" />
                    <div className="mt-3 space-y-2 px-1">
                      <div className="h-4 w-2/3 rounded bg-neutral-800" />
                      <div className="h-4 w-1/3 rounded bg-neutral-800" />
                    </div>
                    <div className="mt-3 h-10 w-full rounded-xl bg-neutral-800" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="rounded-xl bg-red-500/10 p-4 text-red-300 ring-1 ring-red-500/30">
              Impossible de charger les produits : {error}
            </p>
          )}

          {!loading && !error && (
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  imageUrl={p.imageUrl}
                  isAvailable={p.isAvailable}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
