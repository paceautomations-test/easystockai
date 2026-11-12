import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Shirt, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { adjustStock, removeProduct, useProducts } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Inventory — EasyStock AI" },
    { name: "description", content: "See and update your boutique stock in one tap." },
    { property: "og:title", content: "Inventory — EasyStock AI" },
    { property: "og:description", content: "See and update your boutique stock in one tap." },
  ] }),
  component: Inventory,
});

function Inventory() {
  const items = useProducts();
  const total = items.reduce((n, p) => n + Object.values(p.sizes).reduce((a, b) => a + b, 0), 0);
  return (
    <AppShell title="Your inventory">
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-secondary p-4"><p className="text-xs text-muted-foreground">Products</p><p className="text-2xl font-bold text-primary">{items.length}</p></div>
        <div className="rounded-2xl bg-secondary p-4"><p className="text-xs text-muted-foreground">Units in stock</p><p className="text-2xl font-bold text-primary">{total}</p></div>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-8 text-center">
          <Shirt className="mx-auto mb-3 h-10 w-10 text-accent" />
          <p className="font-semibold">No items yet</p>
          <p className="mb-4 text-sm text-muted-foreground">Snap a photo and describe it to add your first item.</p>
          <Link to="/add" className="inline-block rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground">Add item</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((p) => (
            <li key={p.id} className="rounded-2xl border bg-card p-3 shadow-sm">
              <div className="flex gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {p.image ? <img src={p.image} alt={p.title} className="h-full w-full object-cover" /> : <Shirt className="m-auto mt-6 h-8 w-8 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <p className="truncate font-semibold">{p.title}</p>
                    <button aria-label="Delete" onClick={() => removeProduct(p.id)} className="text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <p className="font-bold text-accent">${p.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(p.sizes).map(([s, q]) => (
                  <div key={s} className={`flex items-center gap-2 rounded-full px-2 py-1 text-sm ${q === 0 ? "bg-destructive/10 text-destructive" : "bg-secondary"}`}>
                    <button aria-label={`Sold one ${s}`} onClick={() => adjustStock(p.id, s, -1)} className="rounded-full bg-card p-1"><Minus className="h-3 w-3" /></button>
                    <span className="font-medium">{s}: {q}</span>
                    <button aria-label={`Add one ${s}`} onClick={() => adjustStock(p.id, s, 1)} className="rounded-full bg-card p-1"><Plus className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
