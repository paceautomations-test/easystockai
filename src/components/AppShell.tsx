import { Link } from "@tanstack/react-router";
import { LayoutGrid, MessageCirclePlus } from "lucide-react";
import type { ReactNode } from "react";
export function AppShell({ title, subtitle, children, right }: { title: string; subtitle?: string; children: ReactNode; right?: ReactNode }) {
  const tab = "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs text-muted-foreground transition";
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <header className="sticky top-0 z-10 flex items-end justify-between bg-background/80 px-5 pb-4 pt-6 backdrop-blur-xl">
        <div>
          <p className="text-gradient text-xs font-semibold uppercase tracking-[0.2em]">EasyStock AI</p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </header>
      <main className="flex-1 px-4 pb-32">{children}</main>
      <nav className="fixed inset-x-4 bottom-4 mx-auto flex max-w-[26rem] gap-1 rounded-3xl border bg-card/90 p-1.5 shadow-glow backdrop-blur-xl">
        <Link to="/" className={tab} activeProps={{ className: "bg-secondary !text-foreground" }} activeOptions={{ exact: true }}><LayoutGrid className="h-5 w-5" />Inventory</Link>
        <Link to="/add" className={tab} activeProps={{ className: "bg-secondary !text-foreground" }}><MessageCirclePlus className="h-5 w-5" />Add item</Link>
      </nav>
    </div>
  );
}
