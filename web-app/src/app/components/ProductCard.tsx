'use client';

import Link from 'next/link';
import Image from 'next/image';
import { add as addToCart } from '@/lib/cart';

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  onAdd?: (id: string) => void;
  detailsHref?: string;
};

export default function ProductCard({
  id, name, price, imageUrl, isAvailable, onAdd, detailsHref,
}: ProductCardProps) {
  const href = detailsHref ?? `/products/${id}`;

  return (
    <article className={`rounded-3xl bg-neutral-900/80 ring-1 ring-neutral-800 p-3 shadow-lg ${!isAvailable ? 'opacity-70' : ''}`}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <Image src={imageUrl} alt={name} fill className="object-cover" sizes="(min-width:1024px) 320px, (min-width:640px) 45vw, 90vw" unoptimized />
        {!isAvailable && (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">Indisponible</span>
        )}
      </div>

      <div className="mt-3 space-y-1 px-1">
        <h3 className="text-white font-semibold">{name}</h3>
        <p className="text-neutral-200 font-semibold">
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-3 px-1 pb-1">
        <Link href={href} aria-label={`Voir ${name}`} className="grid h-11 w-11 place-items-center rounded-2xl bg-neutral-800 ring-1 ring-neutral-700 text-white hover:bg-neutral-700">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
            <path d="M12 16v-5m0-3h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>

        <button
          disabled={!isAvailable}
          onClick={() => { addToCart(id); onAdd?.(id); }}
          className="flex-1 rounded-xl bg-[#f79a2f] px-5 py-2.5 font-medium text-white hover:bg-[#f79a2f]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ajouter au panier
        </button>
      </div>
    </article>
  );
}
