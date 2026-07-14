import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, ChevronRight, MapPin } from "lucide-react";
import { useAdminSession, useWarehouseDemands } from "@/features/admin/session";
import { WAREHOUSES } from "@/features/admin/mock";
import { relativeTime } from "@/features/demands/data";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { warehouse, isAdmin, warehouseId, setWarehouseId, actorName } = useAdminSession();
  const demands = useWarehouseDemands();

  const expectedParcels = demands.flatMap((d) =>
    d.parcels.filter((p) => p.status === "expected").map((p) => ({ demand: d, parcel: p })),
  );
  const receivedToday = demands.flatMap((d) =>
    d.parcels.filter((p) => {
      if (!p.receivedAt) return false;
      return Date.now() - new Date(p.receivedAt).getTime() < 86400000;
    }),
  ).length;

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="pt-10 px-5 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Bonjour
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{actorName.split(" ")[0]}</h1>
          </div>
          <div className="size-11 rounded-full bg-foreground text-background grid place-items-center font-bold">
            {isAdmin ? "AD" : (warehouse?.manager.initials ?? "??")}
          </div>
        </div>

        {/* Warehouse selector */}
        <details className="mt-4 group">
          <summary className="list-none cursor-pointer bg-card ring-1 ring-border rounded-xl px-4 py-3 flex items-center gap-3">
            <MapPin className="size-4 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Entrepôt actif
              </p>
              <p className="text-sm font-bold">
                {isAdmin ? "Tous les entrepôts" : (warehouse?.name ?? "—")}
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-open:rotate-90 transition-transform" />
          </summary>
          <div className="mt-2 bg-card ring-1 ring-border rounded-xl overflow-hidden">
            {WAREHOUSES.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWarehouseId(w.id)}
                className={
                  "w-full text-left px-4 py-3 text-sm flex items-center justify-between border-b border-border last:border-0 hover:bg-muted " +
                  (w.id === warehouseId ? "bg-primary/5 font-bold" : "")
                }
              >
                <span>
                  {w.name}
                  <span className="text-muted-foreground font-normal ml-2 text-xs">
                    · {w.manager.name}
                  </span>
                </span>
                {w.id === warehouseId ? <span className="text-primary">✓</span> : null}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setWarehouseId("all")}
              className={
                "w-full text-left px-4 py-3 text-sm font-bold border-t border-border hover:bg-muted " +
                (warehouseId === "all" ? "bg-primary/5" : "")
              }
            >
              Vue admin · tous les entrepôts
            </button>
          </div>
        </details>
      </header>

      {/* KPI */}
      <section className="px-5 grid grid-cols-3 gap-2">
        <Kpi value={expectedParcels.length} label="Attendus" />
        <Kpi value={receivedToday} label="Reçus 24h" />
        <Kpi value={0} label="Anomalies" />
      </section>

      {/* Scan CTA */}
      <div className="px-5 mt-5">
        <Link
          to="/admin/scan"
          className="flex items-center justify-between bg-foreground text-background rounded-2xl p-5 active:scale-[0.99] transition-transform"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Action rapide</p>
            <p className="text-lg font-bold">Scanner un bordereau</p>
          </div>
          <div className="size-12 rounded-full bg-primary grid place-items-center">
            <ScanLine className="size-6" strokeWidth={2.5} />
          </div>
        </Link>
      </div>

      {/* Expected today */}
      <section className="px-5 mt-6">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          À réceptionner ({expectedParcels.length})
        </h2>
        {expectedParcels.length === 0 ? (
          <div className="bg-card ring-1 ring-border rounded-xl p-6 text-center text-sm text-muted-foreground">
            Aucun colis attendu dans cet entrepôt.
          </div>
        ) : (
          <ul className="space-y-2">
            {expectedParcels.slice(0, 6).map(({ demand, parcel }) => (
              <li key={demand.id + parcel.id}>
                <Link
                  to="/admin/demandes/$id"
                  params={{ id: demand.id }}
                  className="block bg-card ring-1 ring-border rounded-xl p-3 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-muted grid place-items-center font-mono text-[9px] font-bold">
                      {parcel.trackingNumber ? "TR" : "??"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{parcel.description}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {demand.reference} · {demand.contact.name}
                        {parcel.weightKg ? ` · ${parcel.weightKg} kg` : ""}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent activity */}
      <section className="px-5 mt-6">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Activité récente
        </h2>
        <ul className="bg-card ring-1 ring-border rounded-xl divide-y divide-border">
          {demands
            .flatMap((d) => d.timeline.map((e) => ({ demand: d, event: e })))
            .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime())
            .slice(0, 5)
            .map(({ demand, event }) => (
              <li key={demand.id + event.id} className="px-4 py-3 flex items-start gap-3">
                <div
                  className={
                    "mt-1 size-2 rounded-full shrink-0 " +
                    (event.type === "success"
                      ? "bg-emerald-500"
                      : event.type === "warning"
                        ? "bg-amber-500"
                        : event.type === "milestone"
                          ? "bg-foreground"
                          : "bg-primary")
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    {demand.reference} · {relativeTime(event.date)}
                  </p>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-card ring-1 ring-border rounded-xl p-3 text-center">
      <p className="font-mono text-2xl font-bold leading-none">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
        {label}
      </p>
    </div>
  );
}