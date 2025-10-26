'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/app/components/ProductCard';

type ApiProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://node-eemi.vercel.app';

export default function RelatedProducts({ currentId }: { currentId: string }) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`, { cache: 'no-store' });
        const data = await res.json();
        const items: ApiProduct[] = Array.isArray(data?.items) ? data.items : [];
        setProducts(items.filter(i => i.id !== currentId).slice(0, 8));
      } finally {
        setLoading(false);
      }
    })();
  }, [currentId]);

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl md:text-3xl font-extrabold">Nos autres propositions</h2>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              imageUrl={p.imageUrl}
              isAvailable={p.isAvailable}
              onAdd={(id) => console.log('add', id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
