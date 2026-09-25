import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, X, FileSignature, Send, CircleDollarSign, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Chipp Partner Portal — Hummingbirds" },
      { name: "description", content: "Partner applications, e-signature onboarding, Refer & Earn and payout reconciliation for Hummingbirds." },
      { property: "og:title", content: "Chipp Partner Portal — Hummingbirds" },
      { property: "og:description", content: "Partner intake, onboarding, referrals and payouts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portal,
});

type App = { id: number; company: string; contact: string; type: string; audience: string; status: "pending" | "approved" | "declined" };
const initialApps: App[] = [
  { id: 1, company: "Northstar Retail Agency", contact: "Maya Chen", type: "Agency", audience: "CPG brands, 40 clients", status: "pending" },
  { id: 2, company: "Shelf Signal", contact: "Derek Owens", type: "Consultant", audience: "Grocery category managers", status: "pending" },
  { id: 3, company: "Bloom Collective", contact: "Priya Nair", type: "Affiliate", audience: "Beauty founders newsletter", status: "approved" },
  { id: 4, company: "Tidewater Media", contact: "Sam Ruiz", type: "Agency", audience: "Regional bev brands", status: "declined" },
];

const reps = ["Jordan Blake", "Alexis Moreno", "Chris Patel"];
type Lead = { id: string; brand: string; contact: string; est: number; rep: string; dealId: string };
type Payout = { id: string; brand: string; partner: string; amount: number; gates: [boolean, boolean, boolean] };

const initialPayouts: Payout[] = [
  { id: "P-1042", brand: "Olipop", partner: "Bloom Collective", amount: 4800, gates: [true, true, true] },
  { id: "P-1043", brand: "Kind Snacks", partner: "Bloom Collective", amount: 3200, gates: [true, true, false] },
  { id: "P-1044", brand: "Siete Foods", partner: "Northstar Retail", amount: 6100, gates: [true, false, false] },
  { id: "P-1045", brand: "Liquid Death", partner: "Shelf Signal", amount: 2500, gates: [false, false, false] },
];
const gateNames = ["Closed Won", "Topo Brand Invoice Paid", "Ramp Payout"];

function Portal() {
  const [apps, setApps] = useState(initialApps);
  const [leads, setLeads] = useState<Lead[]>([
    { id: "L-1", brand: "Olipop", contact: "ops@olipop.com", est: 48000, rep: reps[0], dealId: "HS-88213" },
  ]);
  const [payouts, setPayouts] = useState(initialPayouts);

  return (
    <AppShell kicker="Chipp · Partner Portal" title="Grow with Hummingbirds partners">
      <Tabs defaultValue="apps">
        <TabsList className="h-auto flex-wrap rounded-full p-1">
          <TabsTrigger value="apps" className="rounded-full">Applications</TabsTrigger>
          <TabsTrigger value="onboard" className="rounded-full">Agreement & Onboarding</TabsTrigger>
          <TabsTrigger value="refer" className="rounded-full">Refer & Earn</TabsTrigger>
          <TabsTrigger value="ledger" className="rounded-full">Payout Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="apps" className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <ApplyForm onSubmit={(a) => { setApps((p) => [{ ...a, id: Date.now(), status: "pending" }, ...p]); toast.success("Application received"); }} />
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Internal review</h2>
              <span className="text-sm text-muted-foreground">{apps.filter((a) => a.status === "pending").length} pending</span>
            </div>
            <div className="mt-4 divide-y divide-border">
              {apps.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.company} <span className="text-sm text-muted-foreground">· {a.contact}</span></p>
                    <p className="text-sm text-muted-foreground">{a.type} — {a.audience}</p>
                  </div>
                  {a.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setApps((p) => p.map((x) => x.id === a.id ? { ...x, status: "approved" } : x))}><Check className="h-4 w-4" />Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => setApps((p) => p.map((x) => x.id === a.id ? { ...x, status: "declined" } : x))}><X className="h-4 w-4" />Decline</Button>
                    </div>
                  ) : (
                    <Badge className={a.status === "approved" ? "bg-brand-lime text-primary hover:bg-brand-lime" : "bg-muted text-muted-foreground hover:bg-muted"}>{a.status}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="onboard" className="mt-6"><Onboarding /></TabsContent>

        <TabsContent value="refer" className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <ReferForm onSubmit={(brand, contact, est) => {
            const rep = reps[leads.length % reps.length];
            const dealId = `HS-${88213 + leads.length * 7}`;
            setLeads((p) => [{ id: `L-${p.length + 1}`, brand, contact, est, rep, dealId }, ...p]);
            toast.success(`HubSpot deal ${dealId} created`, { description: `Assigned via round-robin to ${rep}` });
          }} />
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {reps.map((r) => (
                <div key={r} className="rounded-2xl border border-border bg-card p-4">
                  <Users className="h-4 w-4 text-brand-olive" />
                  <p className="mt-2 text-sm font-medium">{r}</p>
                  <p className="font-display text-3xl">{leads.filter((l) => l.rep === r).length}</p>
                  <p className="text-xs text-muted-foreground">deals assigned</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl">Submitted leads</h2>
              <p className="text-sm text-muted-foreground">Next in rotation: <b>{reps[leads.length % reps.length]}</b></p>
              <div className="mt-4 divide-y divide-border">
                {leads.map((l) => (
                  <div key={l.id} className="flex items-center gap-4 py-3 text-sm">
                    <div className="flex-1"><p className="font-medium">{l.brand}</p><p className="text-muted-foreground">{l.contact}</p></div>
                    <span className="font-mono text-xs">{l.dealId}</span>
                    <span>${l.est.toLocaleString()}</span>
                    <Badge variant="outline">{l.rep}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="mt-6">
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {gateNames.map((g, i) => (
              <div key={g} className="rounded-2xl bg-primary p-5 text-primary-foreground">
                <p className="text-xs uppercase tracking-widest opacity-70">Gate {i + 1}</p>
                <p className="font-display text-xl">{g}</p>
                <p className="mt-2 font-display text-3xl text-brand-lime">{payouts.filter((p) => p.gates[i]).length}/{payouts.length}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-3xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b border-border"><th className="p-4">ID</th><th>Brand</th><th>Partner</th><th>Amount</th>{gateNames.map((g) => <th key={g} className="px-2">{g}</th>)}<th className="pr-4">Status</th></tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const done = p.gates.filter(Boolean).length;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="p-4 font-mono text-xs">{p.id}</td><td>{p.brand}</td><td>{p.partner}</td><td>${p.amount.toLocaleString()}</td>
                      {p.gates.map((g, i) => (
                        <td key={i} className="px-2">
                          <button
                            disabled={i > 0 && !p.gates[i - 1]}
                            onClick={() => setPayouts((all) => all.map((x) => x.id !== p.id ? x : { ...x, gates: x.gates.map((v, j) => j < i ? v : x.gates[i] ? false : j === i ? true : v) as Payout["gates"] }))}
                            className={`grid h-7 w-7 place-items-center rounded-full border transition disabled:opacity-30 ${g ? "border-transparent bg-brand-lime text-primary" : "border-border"}`}
                            aria-label={`Toggle ${gateNames[i]}`}
                          >{g && <Check className="h-4 w-4" />}</button>
                        </td>
                      ))}
                      <td className="pr-4">{done === 3 ? <Badge className="bg-brand-forest text-primary-foreground hover:bg-brand-forest"><CircleDollarSign className="h-3 w-3" />Paid</Badge> : <span className="text-muted-foreground">{done}/3 gates</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Gates clear in order: Closed Won → Topo brand invoice paid → Ramp payout. Unchecking a gate resets later gates.</p>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ApplyForm({ onSubmit }: { onSubmit: (a: Omit<App, "id" | "status">) => void }) {
  const [f, setF] = useState({ company: "", contact: "", type: "Agency", audience: "" });
  return (
    <form className="space-y-4 rounded-3xl bg-accent p-6" onSubmit={(e) => { e.preventDefault(); if (!f.company || !f.contact) return; onSubmit(f); setF({ company: "", contact: "", type: "Agency", audience: "" }); }}>
      <h2 className="font-display text-2xl">Become a partner</h2>
      <div><Label>Company</Label><Input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} className="bg-background" /></div>
      <div><Label>Contact name</Label><Input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} className="bg-background" /></div>
      <div><Label>Partner type</Label>
        <div className="mt-1 flex gap-2">{["Agency", "Consultant", "Affiliate"].map((t) => (
          <button type="button" key={t} onClick={() => setF({ ...f, type: t })} className={`rounded-full border px-3 py-1 text-sm ${f.type === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{t}</button>
        ))}</div>
      </div>
      <div><Label>Who do you reach?</Label><Textarea value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })} className="bg-background" /></div>
      <Button type="submit" className="w-full">Submit application</Button>
    </form>
  );
}

const steps = ["Sign partner agreement", "Complete W-9 / tax info", "Connect Ramp payout account", "Watch Hummingbirds 101 video", "Book kickoff with partner manager"];

function Onboarding() {
  const [sig, setSig] = useState("");
  const [agree, setAgree] = useState(false);
  const [signed, setSigned] = useState(false);
  const [done, setDone] = useState<boolean[]>([false, false, false, false, false]);
  const pct = ((done.filter(Boolean).length) / steps.length) * 100;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-2"><FileSignature className="h-5 w-5 text-brand-olive" /><h2 className="font-display text-2xl">Partner Agreement</h2></div>
        <div className="mt-4 h-64 overflow-y-auto rounded-2xl bg-muted p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Hummingbirds Referral Partner Agreement</p>
          <p className="mt-2">1. <b>Referrals.</b> Partner may refer brands to Hummingbirds. A referral qualifies once logged in the Partner Portal and accepted as a new HubSpot deal.</p>
          <p className="mt-2">2. <b>Commission.</b> Partner earns 10% of first-year contract value for qualified referrals reaching Closed Won.</p>
          <p className="mt-2">3. <b>Payment.</b> Commissions are paid via Ramp within 15 days after the referred brand's invoice is paid in full.</p>
          <p className="mt-2">4. <b>Term.</b> This agreement renews annually unless terminated with 30 days' written notice.</p>
          <p className="mt-2">5. <b>Confidentiality.</b> Partner will keep non-public Hummingbirds information confidential.</p>
        </div>
        {signed ? (
          <div className="mt-5 rounded-2xl bg-brand-lime/40 p-4">
            <p className="font-signature text-3xl">{sig}</p>
            <p className="text-xs text-muted-foreground">Signed electronically · {new Date().toLocaleString()}</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <Label>Type your full legal name to sign</Label>
            <Input value={sig} onChange={(e) => setSig(e.target.value)} className="font-signature text-2xl h-14" placeholder="Your name" />
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} />I agree to the terms and consent to sign electronically.</label>
            <Button disabled={!sig.trim() || !agree} onClick={() => { setSigned(true); setDone((d) => [true, ...d.slice(1)]); toast.success("Agreement signed"); }}>Sign agreement</Button>
          </div>
        )}
      </div>
      <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
        <h2 className="font-display text-2xl">Onboarding checklist</h2>
        <Progress value={pct} className="mt-4 bg-primary-foreground/20 [&>div]:bg-brand-lime" />
        <p className="mt-2 text-sm opacity-70">{Math.round(pct)}% complete</p>
        <ul className="mt-5 space-y-3">
          {steps.map((s, i) => (
            <li key={s}>
              <button disabled={i === 0} onClick={() => setDone((d) => d.map((v, j) => j === i ? !v : v))} className="flex w-full items-center gap-3 text-left text-sm">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${done[i] ? "border-transparent bg-brand-lime text-primary" : "border-primary-foreground/30"}`}>{done[i] && <Check className="h-3.5 w-3.5" />}</span>
                <span className={done[i] ? "line-through opacity-60" : ""}>{s}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReferForm({ onSubmit }: { onSubmit: (brand: string, contact: string, est: number) => void }) {
  const [brand, setBrand] = useState(""); const [contact, setContact] = useState(""); const [est, setEst] = useState("25000");
  return (
    <form className="space-y-4 rounded-3xl bg-accent p-6" onSubmit={(e) => { e.preventDefault(); if (!brand || !contact) return; onSubmit(brand, contact, Number(est) || 0); setBrand(""); setContact(""); }}>
      <h2 className="font-display text-2xl">Refer & Earn</h2>
      <p className="text-sm text-muted-foreground">Earn 10% of first-year contract value. Each lead auto-creates a HubSpot deal.</p>
      <div><Label>Brand name</Label><Input value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-background" /></div>
      <div><Label>Contact email</Label><Input type="email" value={contact} onChange={(e) => setContact(e.target.value)} className="bg-background" /></div>
      <div><Label>Est. annual budget ($)</Label><Input type="number" value={est} onChange={(e) => setEst(e.target.value)} className="bg-background" /></div>
      <Button type="submit" className="w-full"><Send className="h-4 w-4" />Submit referral</Button>
    </form>
  );
}
