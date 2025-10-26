export type Product = { id: string; name: string; price: number; description?: string };
export type CartItem = Product & { qty: number };
export type OrderStatus = "pending" | "preparing" | "cooking" | "ready" | "delivered";
export type Order = { id: string; items: CartItem[]; total: number; status: OrderStatus; createdAt: number; userId?: string | null };
export type User = { id: string; email: string };
