import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useWarehouseDemands } from "@/features/admin/session";
import { STATUS_META } from "@/features/demands/data";
import { StatusBadge } from "@/features/demands/ui";

export const Route = createFileRoute("/admin/demandes/")({
  component: AdminDemandsList,
});

function AdminDemandsList() {
  const demands = useWarehouseDemands();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return demands.filter((d) => {
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        d.reference.toLowerCase().includes(s) ||
        d.contact.name.toLowerCase().includes(s) ||
        (d.beneficiary?.name.toLowerCase().includes(s) ?? false)
      );
    });
  }, [demands, q]);

  return (
    <div className="pb-24">
      <header className="pt-10 px-5 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Demandes Delivery
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Vue opérationnelle</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Référence, client…"
          className="w-full mt-3 bg-card ring-1 ring-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </header>

      <main className="px-5 space-y-2">
        {list.map((d) => {
          const meta = STATUS_META[d.status];
          const received = d.parcels.filter((p) => p.status !== "expected").length;
          const pct = Math.round((received / d.parcels.length) * 100);
          return (
            <Link
              key={d.id}
              to="/admin/demandes/$id"
              params={{ id: d.id }}
              className="block bg-card ring-1 ring-border rounded-2xl p-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] text-muted-foreground">{d.reference}</p>
                  <p className="text-sm font-bold truncate">{d.contact.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    → {d.route.to}
                  </p>
                </div>
                <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] font-bold text-muted-foreground">
                  {received}/{d.parcels.length}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}