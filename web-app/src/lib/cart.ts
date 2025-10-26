'use client';

export type CartMap = Record<string, number>; 
const KEY = 'cart';

function read(): CartMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as CartMap;
  } catch {
    return {};
  }
}
function write(cart: CartMap) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(cart));

  window.dispatchEvent(new Event('cart:change'));
}
export function getCart(): CartMap { return read(); }
export function getCount(): number {
  return Object.values(read()).reduce((a, b) => a + b, 0);
}
export function add(id: string, delta = 1) {
  const c = read();
  c[id] = (c[id] ?? 0) + delta;
  write(c);
}
export function remove(id: string, delta = 1) {
  const c = read();
  if (!c[id]) return;
  c[id] -= delta;
  if (c[id] <= 0) delete c[id];
  write(c);
}
export function clear() { 
    write({}); 
}
export function asIdList(): string[] {
  const c = read();
  return Object.entries(c).flatMap(([id, q]) => Array(q).fill(id));
}
