'use client';

import { add as addToCart } from '@/lib/cart';

type Props = {
  id: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function AddToCartButton({ id, disabled, className, children }: Props) {
  return (
    <button
      disabled={disabled}
      onClick={() => addToCart(id)}
      className={
        className ??
        "w-52 rounded-xl px-5 py-2.5 font-medium text-white " +
        "bg-[#f79a2f] hover:bg-[#f79a2f]/90 " +
        "disabled:bg-neutral-700 disabled:text-neutral-300 disabled:hover:bg-neutral-700 disabled:cursor-not-allowed"
      }
    >
      {children ?? 'Ajouter au panier'}
    </button>
  );
}
