export type Product = {
  id: string | number;
  title: string;     
  price: number;
  image: string;
  available?: boolean;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://node-eemi.vercel.app';

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/api/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API /api/products → ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as { items: Product[] };
  return data.items;
}
