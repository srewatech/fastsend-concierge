import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, CreditCard, Briefcase } from "lucide-react";
import { HubShell, StatusPill } from "@/features/hub/layout";
import { useAdminSession, useWarehouseDemands } from "@/features/admin/session";
import { formatDateTime } from "@/features/demands/data";
import {
  useValises,
  addParcelToValise,
  createValise,
  markParcelsPaid,
  VALISE_STATUS_META,
} from "@/features/hub/valises";

export const Route = createFileRoute("/hub/parcels")({
  component: ParcelsScreen,
});

type Ref = { demandId: string; parcelId: string };

function ParcelsScreen() {
  const demands = useWarehouseDemands();
  const valises = useValises();
  const { warehouseId, isAdmin } = useAdminSession();
  const [selected, setSelected] = useState<Ref[]>([]);
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid" | "unassigned">("all");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    return demands
      .map((d) => {
        const received = d.parcels.filter((p) => p.status === "received" || p.status === "shipped");
        return { d, received };
      })
      .filter((g) => g.received.length > 0)
      .map((g) => {
        const filtered = g.received.filter((p) => {
          if (filter === "unpaid") return p.paymentStatus !== "paid";
          if (filter === "paid") return p.paymentStatus === "paid";
          if (filter === "unassigned") return !p.valiseId;
          return true;
        });
        return { ...g, filtered };
      })
      .filter((g) => g.filtered.length > 0);
  }, [demands, filter]);

  const prepValises = valises.filter(
    (v) =>
      v.status === "preparation" &&
      (isAdmin || v.warehouseFromId === warehouseId),
  );

  function toggleSelect(ref: Ref) {
    setSelected((prev) => {
      const idx = prev.findIndex((r) => r.demandId === ref.demandId && r.parcelId === ref.parcelId);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, ref];
    });
  }

  function isSelected(ref: Ref) {
    return selected.some((r) => r.demandId === ref.demandId && r.parcelId === ref.parcelId);
  }

  function payLot() {
    if (selected.length === 0) return;
    markParcelsPaid(selected);
    setSelected([]);
  }

  function addToValise(valiseId: string) {
    if (selected.length === 0) return;
    let vid = valiseId;
    if (vid === "__new__") {
      const first = demands.find((d) => d.id === selected[0].demandId);
      const v = createValise({
        warehouseFromId: (isAdmin ? first?.warehouseId : warehouseId) ?? "paris-cdg",
        warehouseToId:
          first?.route.to === "Brazzaville"
            ? "brazzaville"
            : first?.route.to === "Pointe-Noire"
              ? "pointe-noire"
              : "brazzaville",
      });
      vid = v.id;
    }
    selected.forEach((r) => addParcelToValise(vid, r));
    setSelected([]);
  }

  function toggleOpen(id: string) {
    setOpenIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <HubShell
      title="Colis reçus"
      subtitle="Groupement par demande · paiement de lot · préparation valise"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(
            [
              ["all", "Tous"],
              ["unpaid", "À facturer"],
              ["paid", "Payés"],
              ["unassigned", "Sans valise"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={
                "px-3 py-1.5 text-xs font-bold rounded-md " +
                (filter === k ? "bg-background shadow-sm" : "text-muted-foreground")
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-card ring-1 ring-border rounded-lg px-3 py-1.5">
          <span className="text-xs text-muted-foreground">
            {selected.length} colis sélectionné{selected.length > 1 ? "s" : ""}
          </span>
          <button
            disabled={selected.length === 0}
            onClick={payLot}
            className="text-xs font-bold px-3 py-1.5 rounded-md bg-emerald-600 text-white disabled:opacity-40 flex items-center gap-1"
          >
            <CreditCard className="size-3.5" /> Marquer payés
          </button>
          <select
            disabled={selected.length === 0}
            onChange={(e) => {
              if (e.target.value) {
                addToValise(e.target.value);
                e.currentTarget.value = "";
              }
            }}
            defaultValue=""
            className="text-xs font-bold px-3 py-1.5 rounded-md bg-foreground text-background disabled:opacity-40"
          >
            <option value="" disabled>
              + Ajouter à une valise
            </option>
            {prepValises.map((v) => (
              <option key={v.id} value={v.id}>
                {v.code} · {v.parcelRefs.length} colis
              </option>
            ))}
            <option value="__new__">✚ Nouvelle valise</option>
          </select>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-3">
        {groups.length === 0 ? (
          <div className="bg-card ring-1 ring-border rounded-xl p-10 text-center text-sm text-muted-foreground">
            Aucun colis reçu ne correspond à ce filtre.
          </div>
        ) : (
          groups.map(({ d, filtered }) => {
            const total = d.parcels.length;
            const done = d.parcels.filter((p) => p.status !== "expected").length;
            const open = openIds.has(d.id);
            return (
              <div key={d.id} className="bg-card ring-1 ring-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleOpen(d.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50"
                >
                  <ChevronDown
                    className={"size-4 transition-transform " + (open ? "rotate-0" : "-rotate-90")}
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-mono text-[10px] text-muted-foreground">{d.reference}</p>
                    <p className="text-sm font-bold truncate">
                      {d.contact.name} → {d.route.to}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">
                      {done}/{total} colis reçus
                    </p>
                    <div className="w-32 h-1.5 bg-muted rounded-full mt-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(done / total) * 100}%` }}
                      />
                    </div>
                  </div>
                </button>
                {open ? (
                  <table className="w-full text-sm border-t border-border">
                    <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-2 w-8"></th>
                        <th className="text-left px-4 py-2">Réf.</th>
                        <th className="text-left px-4 py-2">Description</th>
                        <th className="text-left px-4 py-2">Poids</th>
                        <th className="text-left px-4 py-2">Reçu</th>
                        <th className="text-left px-4 py-2">Paiement</th>
                        <th className="text-left px-4 py-2">Valise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => {
                        const ref: Ref = { demandId: d.id, parcelId: p.id };
                        const v = valises.find((x) => x.id === p.valiseId);
                        return (
                          <tr key={p.id} className="border-t border-border">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={isSelected(ref)}
                                onChange={() => toggleSelect(ref)}
                                className="accent-primary"
                              />
                            </td>
                            <td className="px-4 py-2 font-mono text-[11px]">{p.reference}</td>
                            <td className="px-4 py-2 truncate max-w-[280px]">{p.description}</td>
                            <td className="px-4 py-2 font-mono text-[11px]">
                              {p.weightKg ? `${p.weightKg} kg` : "—"}
                            </td>
                            <td className="px-4 py-2 text-[11px] text-muted-foreground">
                              {p.receivedAt ? formatDateTime(p.receivedAt) : "—"}
                            </td>
                            <td className="px-4 py-2">
                              {p.paymentStatus === "paid" ? (
                                <StatusPill label="Payé" tone="success" />
                              ) : (
                                <StatusPill label="À facturer" tone="warn" />
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {v ? (
                                <span className="inline-flex items-center gap-1 text-xs font-mono">
                                  <Briefcase className="size-3" /> {v.code}
                                  <span className="text-muted-foreground">
                                    · {VALISE_STATUS_META[v.status].label}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  Non assignée
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </HubShell>
  );
}