import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Briefcase, Plus, ArrowRight } from "lucide-react";
import { HubShell, StatusPill } from "@/features/hub/layout";
import { useValises, createValise, VALISE_STATUS_META, type ValiseStatus } from "@/features/hub/valises";
import { useAdminSession, useLiveDemands } from "@/features/admin/session";
import { WAREHOUSES } from "@/features/admin/mock";
import { formatDate } from "@/features/demands/data";

export const Route = createFileRoute("/hub/valises/")({
  component: ValisesScreen,
});

const STATUS_ORDER: ValiseStatus[] = [
  "preparation",
  "sealed",
  "in_transit",
  "arrived",
  "controlled",
];

function ValisesScreen() {
  const valises = useValises();
  const demands = useLiveDemands();
  const { warehouseId, isAdmin, warehouse } = useAdminSession();
  const [filter, setFilter] = useState<ValiseStatus | "all">("all");

  const scoped = useMemo(
    () =>
      valises.filter((v) =>
        isAdmin
          ? true
          : v.warehouseFromId === warehouseId || v.warehouseToId === warehouseId,
      ),
    [valises, warehouseId, isAdmin],
  );
  const list = filter === "all" ? scoped : scoped.filter((v) => v.status === filter);

  function totalWeight(refs: { demandId: string; parcelId: string }[]) {
    let t = 0;
    refs.forEach((r) => {
      const d = demands.find((x) => x.id === r.demandId);
      const p = d?.parcels.find((x) => x.id === r.parcelId);
      if (p?.weightKg) t += p.weightKg;
    });
    return t;
  }

  return (
    <HubShell
      title="Valises"
      subtitle="Préparation, chargement, transit et contrôle"
      actions={
        <button
          onClick={() => {
            const v = createValise({
              warehouseFromId: isAdmin ? "paris-cdg" : warehouseId,
              warehouseToId: "brazzaville",
            });
            window.location.href = `/hub/valises/${v.id}`;
          }}
          className="bg-foreground text-background text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="size-4" /> Nouvelle valise
        </button>
      }
    >
      <div className="flex gap-2 flex-wrap mb-4">
        <FilterChip label="Toutes" active={filter === "all"} onClick={() => setFilter("all")} />
        {STATUS_ORDER.map((s) => (
          <FilterChip
            key={s}
            label={VALISE_STATUS_META[s].label}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.length === 0 ? (
          <div className="col-span-full bg-card ring-1 ring-border rounded-xl p-10 text-center text-sm text-muted-foreground">
            Aucune valise dans cet état pour {isAdmin ? "l'ensemble des entrepôts" : warehouse?.name}.
          </div>
        ) : (
          list.map((v) => {
            const from = WAREHOUSES.find((w) => w.id === v.warehouseFromId)?.name;
            const to = WAREHOUSES.find((w) => w.id === v.warehouseToId)?.name;
            const meta = VALISE_STATUS_META[v.status];
            const weight = totalWeight(v.parcelRefs);
            return (
              <Link
                key={v.id}
                to="/hub/valises/$id"
                params={{ id: v.id }}
                className="block bg-card ring-1 ring-border rounded-xl p-4 hover:ring-primary transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                      <Briefcase className="size-4" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold">{v.code}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {v.carrier ?? "Transporteur —"}
                        {v.flightNumber ? ` · ${v.flightNumber}` : ""}
                      </p>
                    </div>
                  </div>
                  <StatusPill label={meta.label} tone={meta.tone} />
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{from}</span>
                  <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{to}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div>
                    <p className="font-mono text-lg font-bold">{v.parcelRefs.length}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">colis</p>
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold">{weight.toFixed(1)}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">kg</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold pt-1">
                      {v.departedAt ? formatDate(v.departedAt) : v.sealedAt ? formatDate(v.sealedAt) : formatDate(v.createdAt)}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      {v.departedAt ? "départ" : v.sealedAt ? "scellée" : "créée"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </HubShell>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-full text-xs font-bold ring-1 transition-colors " +
        (active
          ? "bg-foreground text-background ring-foreground"
          : "bg-card text-muted-foreground ring-border hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}