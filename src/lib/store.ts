import { useEffect, useState } from "react";
export type Product = { id: string; title: string; price: number; image?: string; sizes: Record<string, number>; createdAt: number };
const KEY = "easystock-products";
const listeners = new Set<() => void>();
function read(): Product[] { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
export function saveProducts(p: Product[]) { localStorage.setItem(KEY, JSON.stringify(p)); listeners.forEach((l) => l()); }
export function useProducts() {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => { const l = () => setItems(read()); l(); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return items;
}
export function addProduct(p: Product) { saveProducts([p, ...read()]); }
export function adjustStock(id: string, size: string, delta: number) {
  saveProducts(read().map((p) => p.id === id ? { ...p, sizes: { ...p.sizes, [size]: Math.max(0, (p.sizes[size] ?? 0) + delta) } } : p));
}
export function removeProduct(id: string) { saveProducts(read().filter((p) => p.id !== id)); }
const ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
/** Parses notes like "Olive tee, S-L, $48, 5 each" */
export function parseNote(note: string) {
  const price = Number(note.match(/\$\s?(\d+(?:\.\d+)?)/)?.[1] ?? 0);
  const qty = Number(note.match(/(\d+)\s*(?:each|units|pcs)/i)?.[1] ?? 1);
  const sizes: Record<string, number> = {};
  const range = note.match(/\b(XS|S|M|L|XL|XXL)\s*[-–to]+\s*(XS|S|M|L|XL|XXL)\b/i);
  if (range) {
    const a = ORDER.indexOf(range[1].toUpperCase()), b = ORDER.indexOf(range[2].toUpperCase());
    ORDER.slice(Math.min(a, b), Math.max(a, b) + 1).forEach((s) => (sizes[s] = qty));
  } else {
    (note.toUpperCase().match(/\b(XS|S|M|L|XL|XXL)\b/g) || []).forEach((s) => (sizes[s] = qty));
  }
  if (!Object.keys(sizes).length) sizes["One size"] = qty;
  const first = note.split(",")[0].trim();
  const title = first ? first.replace(/\b\w/g, (c) => c.toUpperCase()) : "New item";
  return { title, price, sizes };
}
