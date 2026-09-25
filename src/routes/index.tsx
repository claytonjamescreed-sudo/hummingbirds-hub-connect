import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Handshake, AudioLines } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hummingbirds × Chipp — Demo Suite" },
      { name: "description", content: "Demo of the Chipp Partner Portal and Customer Call Intelligence Hub for Hummingbirds." },
      { property: "og:title", content: "Hummingbirds × Chipp — Demo Suite" },
      { property: "og:description", content: "Partner portal and call intelligence hub demos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-lime text-primary font-display text-xl">h</span>
          <span className="font-display text-2xl">hummingbirds</span>
        </div>
        <h1 className="mt-20 max-w-3xl font-display text-6xl leading-[1.02] tracking-tight md:text-7xl">
          Everyday creators. <span className="text-brand-lime italic">Smarter partners.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg opacity-80">Two Chipp-powered tools built for the Hummingbirds team — pick one to explore.</p>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Card to="/portal" icon={<Handshake />} n="01" title="Chipp Partner Portal" items={["Application intake & review", "E-sign agreement & onboarding", "Refer & Earn → HubSpot deals", "3-gate payout ledger"]} />
          <Card to="/intel" icon={<AudioLines />} n="02" title="Customer Call Intelligence Hub" items={["Attention + Granola integrations", "#chipp-context tagging", "AI Call Synthesizer", "Knowledge Base sync preview"]} />
        </div>
      </div>
    </div>
  );
}

function Card({ to, icon, n, title, items }: { to: "/portal" | "/intel"; icon: React.ReactNode; n: string; title: string; items: string[] }) {
  return (
    <Link to={to} className="group rounded-3xl bg-background p-8 text-foreground transition hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-lime text-primary">{icon}</span>
        <ArrowUpRight className="transition group-hover:rotate-45" />
      </div>
      <p className="mt-8 text-sm text-muted-foreground">{n}</p>
      <h2 className="font-display text-3xl">{title}</h2>
      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        {items.map((i) => <li key={i}>— {i}</li>)}
      </ul>
    </Link>
  );
}
