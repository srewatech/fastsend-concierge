import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Package, ChevronRight } from "lucide-react";
import { useWarehouseDemands } from "@/features/admin/session";
import { PARCEL_STATUS_META, relativeTime } from "@/features/demands/data";
import { StatusBadge } from "@/features/demands/ui";

export const Route = createFileRoute("/admin/parcels")({
  component: ParcelsScreen,
});

const TABS: { id: "expected" | "received" | "issue"; label: string }[] = [
  { id: "expected", label: "Attendus" },
  { id: "received", label: "Reçus 24h" },
  { id: "issue", label: "Anomalies" },
];

function ParcelsScreen() {
  const demands = useWarehouseDemands();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("expected");

  const items = useMemo(() => {
    const flat = demands.flatMap((d) =>
      d.parcels.map((p) => ({ demand: d, parcel: p })),
    );
    if (tab === "expected") return flat.filter((x) => x.parcel.status === "expected");
    if (tab === "issue") return flat.filter((x) => x.parcel.status === "issue");
    // received last 24h
    return flat.filter((x) => {
      if (!x.parcel.receivedAt) return false;
      return Date.now() - new Date(x.parcel.receivedAt).getTime() < 86400000;
    });
  }, [demands, tab]);

  return (
    <div className="pb-24">
      <header className="pt-10 px-5 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Colis
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Suivi entrepôt</h1>
      </header>

      <div className="px-5 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest " +
              (tab === t.id
                ? "bg-foreground text-background"
                : "bg-card ring-1 ring-border text-muted-foreground")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="px-5 mt-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            <Package className="size-8 mx-auto mb-2 opacity-40" />
            Aucun colis dans cette vue.
          </div>
        ) : (
          items.map(({ demand, parcel }) => {
            const meta = PARCEL_STATUS_META[parcel.status];
            return (
              <Link
                key={demand.id + parcel.id}
                to="/admin/demandes/$id"
                params={{ id: demand.id }}
                className="block bg-card ring-1 ring-border rounded-xl p-3 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-muted grid place-items-center">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{parcel.description}</p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate uppercase tracking-widest">
                      {demand.reference}
                      {parcel.trackingNumber ? ` · ${parcel.trackingNumber}` : ""}
                      {parcel.receivedAt ? ` · ${relativeTime(parcel.receivedAt)}` : ""}
                    </p>
                  </div>
                  <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}