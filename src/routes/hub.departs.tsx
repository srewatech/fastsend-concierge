import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plane, ArrowRight, Lock } from "lucide-react";
import { HubShell, StatusPill, SectionCard } from "@/features/hub/layout";
import { useValises, markDeparted, VALISE_STATUS_META } from "@/features/hub/valises";
import { useAdminSession } from "@/features/admin/session";
import { WAREHOUSES } from "@/features/admin/mock";
import { formatDateTime } from "@/features/demands/data";

export const Route = createFileRoute("/hub/departs")({
  component: DepartsScreen,
});

function DepartsScreen() {
  const valises = useValises();
  const { warehouseId, isAdmin, actorName } = useAdminSession();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [carrier, setCarrier] = useState("Air France Cargo");
  const [flight, setFlight] = useState("");

  const ready = useMemo(
    () =>
      valises.filter(
        (v) => v.status === "sealed" && (isAdmin || v.warehouseFromId === warehouseId),
      ),
    [valises, warehouseId, isAdmin],
  );

  const inTransit = valises.filter(
    (v) => v.status === "in_transit" && (isAdmin || v.warehouseFromId === warehouseId),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function registerDeparture() {
    if (selected.size === 0) return;
    selected.forEach((id) => markDeparted(id, { carrier, flightNumber: flight, actor: actorName }));
    setSelected(new Set());
    setFlight("");
  }

  return (
    <HubShell title="Chargement · Départ" subtitle="Regrouper des valises scellées dans un vol ou un camion">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <SectionCard title={`Prêtes à partir · ${ready.length}`}>
          {ready.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground text-center">
              Aucune valise scellée en attente. Scellez une valise depuis son détail.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {ready.map((v) => {
                const from = WAREHOUSES.find((w) => w.id === v.warehouseFromId)?.name;
                const to = WAREHOUSES.find((w) => w.id === v.warehouseToId)?.name;
                const meta = VALISE_STATUS_META[v.status];
                const active = selected.has(v.id);
                return (
                  <li key={v.id} className={"px-4 py-3 flex items-center gap-3 " + (active ? "bg-primary/5" : "")}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggle(v.id)}
                      className="accent-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-bold">{v.code}</p>
                        <StatusPill label={meta.label} tone={meta.tone} />
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        {from} <ArrowRight className="size-3" /> {to} · {v.parcelRefs.length} colis
                        {v.sealNumber ? (
                          <>
                            {" · "}
                            <Lock className="size-3" /> {v.sealNumber}
                          </>
                        ) : null}
                      </p>
                    </div>
                    <Link
                      to="/hub/valises/$id"
                      params={{ id: v.id }}
                      className="text-[11px] font-bold text-primary"
                    >
                      Voir
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Nouveau départ">
            <div className="p-4 space-y-3">
              <label className="block">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Transporteur
                </span>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="mt-1 w-full bg-muted rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Air France Cargo</option>
                  <option>Ethiopian Cargo</option>
                  <option>ASKY Cargo</option>
                  <option>Camion Bolloré</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Numéro de vol / camion
                </span>
                <input
                  value={flight}
                  onChange={(e) => setFlight(e.target.value)}
                  placeholder="ex. AF-820"
                  className="mt-1 w-full bg-muted rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <div className="text-xs text-muted-foreground">
                {selected.size} valise{selected.size > 1 ? "s" : ""} sélectionnée
                {selected.size > 1 ? "s" : ""}
              </div>
              <button
                disabled={selected.size === 0}
                onClick={registerDeparture}
                className="w-full bg-primary text-primary-foreground text-sm font-bold py-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Plane className="size-4" /> Enregistrer le départ
              </button>
            </div>
          </SectionCard>

          <SectionCard title={`En transit · ${inTransit.length}`}>
            {inTransit.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground">Aucune valise en vol.</p>
            ) : (
              <ul className="divide-y divide-border">
                {inTransit.map((v) => (
                  <li key={v.id} className="px-4 py-2">
                    <p className="font-mono text-xs font-bold">{v.code}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {v.flightNumber ?? v.carrier} · {v.departedAt ? formatDateTime(v.departedAt) : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </HubShell>
  );
}