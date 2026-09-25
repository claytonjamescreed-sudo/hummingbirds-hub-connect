import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Mic, NotebookPen, Hash, Loader2, Wand2, Quote, AlertTriangle, Lightbulb, Frown, Database, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { synthesizeCall, type Synthesis } from "@/lib/synth.functions";

export const Route = createFileRoute("/intel")({
  head: () => ({
    meta: [
      { title: "Customer Call Intelligence Hub — Chipp" },
      { name: "description", content: "Sync Attention calls and Granola notes, tag with #chipp-context, and synthesize insights with AI for Chipp agents." },
      { property: "og:title", content: "Customer Call Intelligence Hub — Chipp" },
      { property: "og:description", content: "AI call synthesis and knowledge base sync for Chipp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Intel,
});

type Call = { id: string; source: "Attention" | "Granola"; title: string; date: string; tags: string[]; transcript: string };

const CALLS: Call[] = [
  { id: "c1", source: "Attention", title: "Olipop — Q4 retail activation review", date: "Sep 22", tags: ["#chipp-context", "#renewal"],
    transcript: `Rep: Thanks for joining. How did the Target activation go?\nDana (Olipop): Honestly the creator content was great, but reporting took forever. I had to chase my account manager for shelf photos.\nRep: That's helpful. What would make it easier?\nDana: If I could see store-level check-ins in real time, I'd be sold. Right now I'm stitching spreadsheets together every Monday.\nDana: Also, our finance team pushed back on price. They asked why we'd pay more than a standard influencer agency.\nRep: Understood — our creators actually purchase in store, so you get verified trial.\nDana: That's the story I need in a one-pager for finance. And can we get the UGC licensed for paid social for 12 months instead of 6?` },
  { id: "c2", source: "Granola", title: "Strategy sync — grocery category expansion", date: "Sep 20", tags: ["#chipp-context", "#strategy"],
    transcript: `Notes — leadership meeting.\nMarcus: Brands in grocery keep saying they can't tie creator posts to sell-through.\nLena: Kroger buyers want proof of velocity lift before resets. "Show me the lift, not the likes" — direct quote from the Siete buyer.\nMarcus: Competitors are bundling retail media. We keep losing on "one-stop shop" objections.\nLena: Feature idea: a POS data integration with SPINS so we can report lift automatically.\nAction: build a velocity-lift case study by end of Q4.` },
  { id: "c3", source: "Attention", title: "Kind Snacks — discovery call", date: "Sep 18", tags: ["#discovery"],
    transcript: `Rep: Tell me about your goals.\nAmir (Kind): We're launching a new bar in 1,200 Walmart doors and need trial fast.\nAmir: Our worry is creator quality. Last vendor sent us blurry photos from the wrong aisle.\nRep: We vet every creator and require geotagged shelf photos.\nAmir: Good. Can we target specific zip codes? We only care about the Southeast pilot.\nAmir: Timeline is tight — we'd need creators live within three weeks.` },
  { id: "c4", source: "Granola", title: "Product council — creator app roadmap", date: "Sep 15", tags: ["#product"],
    transcript: `Product council notes.\nJess: Creators want faster payouts; average is 21 days.\nTom: Brands keep asking for a self-serve campaign builder.\nJess: "I shouldn't need a call to launch a 50-creator test" — quote from a DTC founder.\nTom: Objection we hear: minimum spend is too high for emerging brands.` },
];

function Intel() {
  const [integrations, setIntegrations] = useState({ Attention: true, Granola: true });
  const [calls, setCalls] = useState(CALLS);
  const [filter, setFilter] = useState<string>("#chipp-context");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string>("c1");
  const [results, setResults] = useState<Record<string, Synthesis>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [synced, setSynced] = useState<Record<string, string>>({});
  const synth = useServerFn(synthesizeCall);

  const allTags = useMemo(() => Array.from(new Set(calls.flatMap((c) => c.tags))), [calls]);
  const visible = calls.filter((c) => integrations[c.source] && (!filter || c.tags.includes(filter)) && c.title.toLowerCase().includes(q.toLowerCase()));
  const current = calls.find((c) => c.id === selected);

  const toggleTag = (id: string) => setCalls((cs) => cs.map((c) => c.id !== id ? c : { ...c, tags: c.tags.includes("#chipp-context") ? c.tags.filter((t) => t !== "#chipp-context") : [...c.tags, "#chipp-context"] }));

  async function run(call: Call) {
    setLoading(call.id);
    try {
      const r = await synth({ data: { title: call.title, transcript: call.transcript } });
      if (r.ok) { setResults((p) => ({ ...p, [call.id]: r.result })); toast.success("Call synthesized"); }
      else toast.error(r.error);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Synthesis failed"); }
    finally { setLoading(null); }
  }

  const res = current ? results[current.id] : undefined;
  const kbCards = Object.entries(results).filter(([id]) => calls.find((c) => c.id === id)?.tags.includes("#chipp-context"));

  return (
    <AppShell kicker="Chipp · Call Intelligence" title="Every customer conversation, agent-ready">
      {/* Integrations */}
      <section className="grid gap-4 md:grid-cols-2">
        {([["Attention", "Recorded customer calls", Mic, "142 calls synced"], ["Granola", "Strategic meeting notes", NotebookPen, "38 notes synced"]] as const).map(([name, desc, Icon, stat]) => (
          <div key={name} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-lime text-primary"><Icon className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{desc} · {integrations[name] ? <span className="text-brand-forest">Connected — {stat}</span> : "Disconnected"}</p>
            </div>
            <Switch checked={integrations[name]} onCheckedChange={(v) => { setIntegrations((p) => ({ ...p, [name]: v })); toast(`${name} ${v ? "connected" : "disconnected"}`); }} />
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Call list */}
        <div className="rounded-3xl border border-border bg-card p-5">
          <Input placeholder="Search calls…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setFilter("")} className={`rounded-full border px-3 py-1 text-xs ${!filter ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>All</button>
            {allTags.map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={`rounded-full border px-3 py-1 text-xs ${filter === t ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{t}</button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {visible.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No calls match.</p>}
            {visible.map((c) => (
              <div key={c.id} className={`rounded-2xl border p-3 transition ${selected === c.id ? "border-primary bg-accent" : "border-border"}`}>
                <button onClick={() => setSelected(c.id)} className="w-full text-left">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {c.source === "Attention" ? <Mic className="h-3 w-3" /> : <NotebookPen className="h-3 w-3" />}{c.source} · {c.date}
                    {results[c.id] && <Badge variant="outline" className="ml-auto text-[10px]">synthesized</Badge>}
                  </div>
                  <p className="mt-1 text-sm font-medium">{c.title}</p>
                </button>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {c.tags.map((t) => <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{t}</span>)}
                  <button onClick={() => toggleTag(c.id)} className="ml-auto flex items-center gap-1 text-[11px] text-brand-olive hover:underline">
                    <Hash className="h-3 w-3" />{c.tags.includes("#chipp-context") ? "Remove context" : "Add #chipp-context"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Synthesizer */}
        <div className="rounded-3xl border border-border bg-card p-6">
          {current && (
            <>
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">AI Call Synthesizer</p>
                  <h2 className="font-display text-2xl">{current.title}</h2>
                </div>
                <Button onClick={() => run(current)} disabled={loading === current.id}>
                  {loading === current.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {res ? "Re-synthesize" : "Synthesize call"}
                </Button>
              </div>
              {!res && (
                <pre className="mt-5 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-muted p-4 font-sans text-sm text-muted-foreground">{current.transcript}</pre>
              )}
              {res && (
                <div className="mt-5 space-y-5">
                  <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
                    <div className="flex items-center justify-between"><p className="text-xs uppercase tracking-widest opacity-70">Summary</p><Badge className="bg-brand-lime text-primary hover:bg-brand-lime">{res.sentiment}</Badge></div>
                    <p className="mt-2">{res.summary}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Block icon={<Frown className="h-4 w-4" />} title="Pain points" items={res.painPoints} />
                    <Block icon={<AlertTriangle className="h-4 w-4" />} title="Objections" items={res.objections} />
                    <Block icon={<Lightbulb className="h-4 w-4" />} title="Feature requests" items={res.featureRequests} />
                    <div className="rounded-2xl border border-border p-4">
                      <p className="flex items-center gap-2 text-sm font-medium"><Quote className="h-4 w-4 text-brand-olive" />Verbatim quotes</p>
                      <div className="mt-2 space-y-2">
                        {res.quotes.map((qt, i) => <blockquote key={i} className="border-l-2 border-brand-lime pl-3 text-sm italic">“{qt.quote}” <span className="not-italic text-muted-foreground">— {qt.speaker}</span></blockquote>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* KB sync */}
      <section className="mt-10 rounded-3xl bg-primary p-6 text-primary-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <Database className="h-5 w-5 text-brand-lime" />
          <h2 className="font-display text-2xl">Chipp Knowledge Base — sync preview</h2>
          <span className="ml-auto text-sm opacity-70">Only #chipp-context calls sync to agents</span>
        </div>
        {kbCards.length === 0 ? (
          <p className="mt-6 text-sm opacity-70">Synthesize a #chipp-context call to generate live context cards.</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {kbCards.flatMap(([id, r]) => {
              const c = calls.find((x) => x.id === id)!;
              return [
                ...r.painPoints.slice(0, 2).map((p, i) => ({ key: `${id}-p${i}`, kind: "Pain point", text: p, c })),
                ...r.objections.slice(0, 1).map((p, i) => ({ key: `${id}-o${i}`, kind: "Objection", text: p, c })),
                ...r.featureRequests.slice(0, 1).map((p, i) => ({ key: `${id}-f${i}`, kind: "Feature request", text: p, c })),
              ];
            }).map((card) => (
              <div key={card.key} className="rounded-2xl bg-background p-4 text-foreground">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-brand-lime px-2 py-0.5 font-medium text-primary">{card.kind}</span>
                  <span className="text-muted-foreground">{synced[card.c.id] ? `synced ${synced[card.c.id]}` : "ready"}</span>
                </div>
                <p className="mt-3 text-sm">{card.text}</p>
                <p className="mt-3 text-xs text-muted-foreground">Source: {card.c.source} · {card.c.title}</p>
              </div>
            ))}
          </div>
        )}
        {kbCards.length > 0 && (
          <Button variant="secondary" className="mt-6" onClick={() => { const t = new Date().toLocaleTimeString(); setSynced(Object.fromEntries(kbCards.map(([id]) => [id, t]))); toast.success("Context pushed to Chipp agents"); }}>
            <RefreshCw className="h-4 w-4" />Sync to Chipp agents
          </Button>
        )}
      </section>
    </AppShell>
  );
}

function Block({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="flex items-center gap-2 text-sm font-medium"><span className="text-brand-olive">{icon}</span>{title}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">{items.length ? items.map((i, k) => <li key={k}>• {i}</li>) : <li>None found</li>}</ul>
    </div>
  );
}
