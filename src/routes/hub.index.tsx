import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  PackageSearch,
  Briefcase,
  Plane,
  Warehouse,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { HubShell, KpiCard, SectionCard, StatusPill } from "@/features/hub/layout";
import { useAdminSession, useWarehouseDemands } from "@/features/admin/session";
import { useValises, VALISE_STATUS_META } from "@/features/hub/valises";
import { relativeTime } from "@/features/demands/data";
import { WAREHOUSES } from "@/features/admin/mock";

export const Route = createFileRoute("/hub/")({
  component: HubDashboard,
});

function HubDashboard() {
  const demands = useWarehouseDemands();
  const valises = useValises();
  const { warehouseId, isAdmin, warehouse } = useAdminSession();

  const kpis = useMemo(() => {
    const parcels = demands.flatMap((d) => d.parcels.map((p) => ({ d, p })));
    const expected = parcels.filter((x) => x.p.status === "expected").length;
    const received24h = parcels.filter(
      (x) => x.p.receivedAt && Date.now() - new Date(x.p.receivedAt).getTime() < 86400000,
    ).length;
    const awaitingPayment = parcels.filter(
      (x) => x.p.status === "received" && x.p.paymentStatus !== "paid",
    ).length;
    const scopedValises = valises.filter((v) =>
      isAdmin ? true : v.warehouseFromId === warehouseId || v.warehouseToId === warehouseId,
    );
    const preparation = scopedValises.filter((v) => v.status === "preparation").length;
    const inTransit = scopedValises.filter((v) => v.status === "in_transit").length;
    const toControl = scopedValises.filter(
      (v) =>
        v.status === "arrived" &&
        (isAdmin || v.warehouseToId === warehouseId),
    ).length;
    return { expected, received24h, awaitingPayment, preparation, inTransit, toControl };
  }, [demands, valises, warehouseId, isAdmin]);

  const shortcuts = [
    { to: "/hub/reception", label: "Réceptionner", icon: PackageSearch, hint: "Scan / OCR" },
    { to: "/hub/valises", label: "Préparer une valise", icon: Briefcase, hint: "Grouper les colis" },
    { to: "/hub/departs", label: "Enregistrer un départ", icon: Plane, hint: "Vol / camion" },
    { to: "/hub/arrivees", label: "Contrôler une arrivée", icon: Warehouse, hint: "Manifeste" },
  ] as const;

  const alerts = useMemo(() => {
    const list: { id: string; title: string; desc: string; tone: "warn" | "danger" | "info" }[] = [];
    demands.forEach((d) => {
      const unpaid = d.parcels.filter((p) => p.status === "received" && p.paymentStatus !== "paid").length;
      if (unpaid > 0)
        list.push({
          id: d.id + "-pay",
          title: `${d.reference} · ${unpaid} colis à facturer`,
          desc: d.contact.name,
          tone: "warn",
        });
    });
    valises.forEach((v) => {
      if (v.status === "arrived") {
        const wh = WAREHOUSES.find((w) => w.id === v.warehouseToId)?.name;
        list.push({
          id: v.id + "-ctrl",
          title: `${v.code} · à contrôler`,
          desc: `Arrivée ${wh} · ${v.arrivedAt ? relativeTime(v.arrivedAt) : ""}`,
          tone: "danger",
        });
      }
    });
    return list.slice(0, 6);
  }, [demands, valises]);

  const timeline = useMemo(() => {
    return demands
      .flatMap((d) => d.timeline.map((e) => ({ demand: d, event: e })))
      .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime())
      .slice(0, 8);
  }, [demands]);

  return (
    <HubShell
      title="Tableau de bord"
      subtitle={isAdmin ? "Vue consolidée · tous les entrepôts" : `Opérations ${warehouse?.name}`}
    >
      {/* KPI */}
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Colis attendus" value={kpis.expected} />
        <KpiCard label="Reçus 24h" value={kpis.received24h} tone="info" />
        <KpiCard label="À facturer" value={kpis.awaitingPayment} tone="warn" />
        <KpiCard label="Valises en prépa" value={kpis.preparation} />
        <KpiCard label="En transit" value={kpis.inTransit} tone="info" />
        <KpiCard label="À contrôler" value={kpis.toControl} tone="danger" />
      </section>

      {/* Shortcuts */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {shortcuts.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.to}
              to={s.to}
              className="group bg-card ring-1 ring-border rounded-xl p-4 flex items-center gap-3 hover:ring-primary transition-all"
            >
              <div className="size-11 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.hint}</p>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          );
        })}
      </section>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        <SectionCard title="Activité en direct">
          <ul className="divide-y divide-border">
            {timeline.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted-foreground text-center">Aucune activité récente.</li>
            ) : (
              timeline.map(({ demand, event }) => (
                <li key={demand.id + event.id} className="px-4 py-3 flex gap-3">
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
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                      {demand.reference} · {relativeTime(event.date)}
                      {event.actor ? ` · ${event.actor}` : ""}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </SectionCard>

        <SectionCard title="Alertes">
          <ul className="divide-y divide-border">
            {alerts.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted-foreground text-center">
                Tout est sous contrôle 👌
              </li>
            ) : (
              alerts.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-start gap-3">
                  <AlertTriangle
                    className={
                      "size-4 mt-0.5 shrink-0 " +
                      (a.tone === "danger" ? "text-destructive" : "text-amber-600")
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.desc}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </SectionCard>

        <SectionCard title="Valises actives">
          <ul className="divide-y divide-border">
            {valises
              .filter((v) =>
                isAdmin
                  ? true
                  : v.warehouseFromId === warehouseId || v.warehouseToId === warehouseId,
              )
              .slice(0, 5)
              .map((v) => {
                const meta = VALISE_STATUS_META[v.status];
                const from = WAREHOUSES.find((w) => w.id === v.warehouseFromId)?.name;
                const to = WAREHOUSES.find((w) => w.id === v.warehouseToId)?.name;
                return (
                  <li key={v.id}>
                    <Link
                      to="/hub/valises/$id"
                      params={{ id: v.id }}
                      className="block px-4 py-3 hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-bold">{v.code}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {from} → {to} · {v.parcelRefs.length} colis
                          </p>
                        </div>
                        <StatusPill label={meta.label} tone={meta.tone} />
                      </div>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </SectionCard>
      </div>
    </HubShell>
  );
}