import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AppShell({ children, title, kicker }: { children: ReactNode; title: string; kicker: string }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg">h</span>
            <span className="font-display text-xl tracking-tight">hummingbirds</span>
          </Link>
          <nav className="flex gap-1 text-sm">
            <Link to="/portal" className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-accent !text-accent-foreground" }}>Partner Portal</Link>
            <Link to="/intel" className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-accent !text-accent-foreground" }}>Call Intelligence</Link>
          </nav>
          <span className="ml-auto rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Demo · powered by Chipp</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-olive">{kicker}</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
