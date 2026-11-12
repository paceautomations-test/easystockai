import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { RefreshCw, Shirt } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { fetchInventory } from "@/lib/shopify";

const inventoryQuery = queryOptions({ queryKey: ["inventory"], queryFn: fetchInventory, refetchInterval: 30000, refetchOnWindowFocus: true });

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Inventory — EasyStock AI" },
    { name: "description", content: "Your live Shopify stock, at a glance." },
    { property: "og:title", content: "Inventory — EasyStock AI" },
    { property: "og:description", content: "Your live Shopify stock, at a glance." },
  ] }),
  component: Inventory,
});

function Inventory() {
  const { data, isLoading, error, refetch, isFetching } = useQuery(inventoryQuery);
  const items = data ?? [];
  const units = items.reduce((n, p) => n + p.variants.reduce((a, v) => a + (v.quantityAvailable ?? 0), 0), 0);
  const low = items.filter((p) => p.variants.some((v) => (v.quantityAvailable ?? 1) <= 0 || !v.availableForSale)).length;

  return (
    <AppShell title="Inventory" subtitle="Synced with Shopify" right={
      <button onClick={() => refetch()} aria-label="Refresh" className="rounded-full border bg-card p-2.5"><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /></button>
    }>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {[["Products", items.length], ["Units", units], ["Sold out", low]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border bg-card p-3"><p className="text-[11px] text-muted-foreground">{l}</p><p className="text-xl font-semibold">{v}</p></div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">{(error as Error).message}</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-8 text-center">
          <div className="bg-gradient-brand mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"><Shirt className="h-7 w-7 text-primary-foreground" /></div>
          <p className="font-semibold">No products found</p>
          <p className="mb-5 text-sm text-muted-foreground">Your Shopify store is empty. Add your first item to get started.</p>
          <Link to="/add" className="bg-gradient-brand inline-block rounded-full px-6 py-3 font-semibold text-primary-foreground">Add item</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((p) => (
            <li key={p.id} className="flex gap-3 rounded-2xl border bg-card p-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                {p.image ? <img src={p.image} alt={p.title} className="h-full w-full object-cover" /> : <Shirt className="mx-auto mt-6 h-8 w-8 text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                <p className="text-sm text-gradient font-semibold">{p.currency} {Number(p.price).toFixed(2)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.variants.map((v) => {
                    const out = !v.availableForSale || v.quantityAvailable === 0;
                    return <span key={v.id} className={`rounded-full px-2 py-0.5 text-[11px] ${out ? "bg-destructive/15 text-destructive" : "bg-secondary text-secondary-foreground"}`}>
                      {v.title === "Default Title" ? "Stock" : v.title}: {v.quantityAvailable ?? (out ? 0 : "—")}
                    </span>;
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
