import { Link } from "@tanstack/react-router";
import { Package, Plus } from "lucide-react";
import type { ReactNode } from "react";
export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="bg-primary px-5 pb-5 pt-6 text-primary-foreground">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">EasyStock AI</p>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
      </header>
      <main className="flex-1 px-4 py-5 pb-28">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md justify-around border-t bg-card py-2">
        <Link to="/" className="flex flex-col items-center gap-1 px-6 py-1 text-xs text-muted-foreground" activeProps={{ className: "text-primary font-semibold" }} activeOptions={{ exact: true }}>
          <Package className="h-6 w-6" />Inventory
        </Link>
        <Link to="/add" className="flex flex-col items-center gap-1 px-6 py-1 text-xs text-muted-foreground" activeProps={{ className: "text-primary font-semibold" }}>
          <Plus className="h-6 w-6" />Add item
        </Link>
      </nav>
    </div>
  );
}
