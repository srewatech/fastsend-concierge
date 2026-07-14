import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  DEMANDS,
  STATUS_META,
  formatMoney,
  relativeTime,
  type DemandStatus,
} from "@/features/demands/data";
import { StatusBadge } from "@/features/demands/ui";

export const Route = createFileRoute("/demandes/")({
  head: () => ({
    meta: [
      { title: "Mes demandes · FastSends" },
      { name: "description", content: "Suivi de vos demandes d'expédition FastSends." },
    ],
  }),
  component: DemandsList,
});

const FILTERS: { id: "all" | DemandStatus; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "in_transit", label: "En transit" },
  { id: "awaiting_payment", label: "Paiement" },
  { id: "customs", label: "Douanes" },
  { id: "delivered", label: "Livrées" },
];

function DemandsList() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return DEMANDS.filter((d) => (filter === "all" ? true : d.status === filter)).filter((d) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        d.reference.toLowerCase().includes(q) ||
        d.serviceName.toLowerCase().includes(q) ||
        d.route.from.toLowerCase().includes(q) ||
        d.route.to.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const active = DEMANDS.filter((d) => d.status !== "delivered" && d.status !== "cancelled").length;

  return (
    <div className="mx-auto max-w-[440px] min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            FastSends / Mes demandes
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Vue manager →
            </Link>
            <Link
              to="/"
              className="text-[10px] font-bold uppercase tracking-widest text-primary"
            >
              + Nouvelle
            </Link>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Mes demandes</h1>
          <span className="font-mono text-xs text-muted-foreground">
            {active} actives
          </span>
        </div>
        <div className="relative mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une référence, route…"
            className="w-full bg-card ring-1 ring-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            ⌕
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-none">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={
                  "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all " +
                  (active
                    ? "bg-foreground text-background"
                    : "bg-card ring-1 ring-border text-muted-foreground")
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="p-5 space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">∅</div>
            <p className="text-sm text-muted-foreground">Aucune demande ne correspond.</p>
          </div>
        ) : (
          list.map((d) => {
            const meta = STATUS_META[d.status];
            return (
              <Link
                key={d.id}
                to="/demandes/$id"
                params={{ id: d.id }}
                className="block bg-card ring-1 ring-border rounded-2xl p-4 hover:ring-primary/50 hover:shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {d.serviceCode}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground truncate">
                        {d.reference}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm truncate">{d.serviceName}</h3>
                  </div>
                  <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span className="font-medium text-foreground truncate">{d.route.from}</span>
                  <span className="text-[10px]">──▶</span>
                  <span className="font-medium text-foreground truncate">{d.route.to}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>
                      {d.parcels.length} colis
                    </span>
                    <span className="opacity-40">·</span>
                    <span>{relativeTime(d.updatedAt)}</span>
                  </div>
                  {d.amount ? (
                    <span className="font-mono font-bold">
                      {formatMoney(d.amount, d.currency)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">Devis</span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}