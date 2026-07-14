import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle, Package } from "lucide-react";
import {
  getRuntimeDemand,
  PARCEL_STATUS_META,
  receiveParcel,
  formatDateTime,
  type Demand,
} from "@/features/demands/data";
import { useAdminSession, useLiveDemands } from "@/features/admin/session";
import { StatusBadge } from "@/features/demands/ui";

export const Route = createFileRoute("/admin/demandes/$id")({
  loader: ({ params }) => {
    const d = getRuntimeDemand(params.id);
    if (!d) throw notFound();
    return { id: d.id };
  },
  component: AdminDemandDetail,
});

function AdminDemandDetail() {
  const { id } = Route.useLoaderData();
  // Force re-render on runtime updates
  useLiveDemands();
  const demand = getRuntimeDemand(id) as Demand;
  const { actorName, warehouse } = useAdminSession();

  const total = demand.parcels.length;
  const received = demand.parcels.filter((p) => p.status !== "expected").length;

  function handleReceive(parcelId: string) {
    const p = demand.parcels.find((x) => x.id === parcelId);
    if (!p) return;
    receiveParcel({
      demandId: demand.id,
      parcelId,
      weightKg: p.weightKg,
      trackingNumber: p.trackingNumber,
      actor: actorName,
      warehouseLabel: warehouse?.name,
    });
  }

  return (
    <div className="pb-24">
      <header className="pt-10 px-5 pb-4 flex items-center gap-3">
        <Link
          to="/admin/demandes"
          className="size-9 rounded-full bg-muted grid place-items-center"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-muted-foreground">{demand.reference}</p>
          <h1 className="text-lg font-bold tracking-tight truncate">{demand.contact.name}</h1>
        </div>
      </header>

      {/* Summary */}
      <section className="px-5">
        <div className="bg-foreground text-background rounded-2xl p-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest opacity-70 mb-2">
            <span>{demand.route.from}</span>
            <span>→</span>
            <span>{demand.route.to}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-background/10">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60">Progression</p>
              <p className="font-mono text-xl font-bold">
                {received}/{total} colis
              </p>
            </div>
            <div className="w-24 h-2 bg-background/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${(received / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Parcels checklist */}
      <section className="px-5 mt-5">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Colis
        </h2>
        <ul className="space-y-2">
          {demand.parcels.map((p) => {
            const meta = PARCEL_STATUS_META[p.status];
            const done = p.status !== "expected";
            return (
              <li
                key={p.id}
                className="bg-card ring-1 ring-border rounded-xl p-3 space-y-2"
              >
                <div className="flex items-start gap-3">
                  {done ? (
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{p.description}</p>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest truncate">
                      {p.reference}
                      {p.trackingNumber ? ` · ${p.trackingNumber}` : ""}
                      {p.weightKg ? ` · ${p.weightKg} kg` : ""}
                    </p>
                  </div>
                  <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                </div>
                {!done ? (
                  <button
                    type="button"
                    onClick={() => handleReceive(p.id)}
                    className="w-full bg-foreground text-background font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Package className="size-3.5" /> Marquer comme reçu
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Timeline */}
      <section className="px-5 mt-5">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Historique
        </h2>
        <ol className="bg-card ring-1 ring-border rounded-xl divide-y divide-border">
          {demand.timeline
            .slice()
            .reverse()
            .map((e) => (
              <li key={e.id} className="px-4 py-3">
                <p className="text-sm font-bold">{e.title}</p>
                {e.description ? (
                  <p className="text-[11px] text-muted-foreground">{e.description}</p>
                ) : null}
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
                  {formatDateTime(e.date)}
                  {e.actor ? ` · ${e.actor}` : ""}
                </p>
              </li>
            ))}
        </ol>
      </section>
    </div>
  );
}