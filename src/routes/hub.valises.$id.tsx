import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft,
  Briefcase,
  Lock,
  Plane,
  CheckCircle2,
  Download,
  Plus,
  Trash2,
} from "lucide-react";
import { HubShell, StatusPill, SectionCard } from "@/features/hub/layout";
import {
  useValises,
  sealValise,
  markDeparted,
  markArrived,
  addParcelToValise,
  removeParcelFromValise,
  VALISE_STATUS_META,
  type ValiseStatus,
} from "@/features/hub/valises";
import { useAdminSession, useLiveDemands } from "@/features/admin/session";
import { WAREHOUSES } from "@/features/admin/mock";
import { formatDateTime } from "@/features/demands/data";

export const Route = createFileRoute("/hub/valises/$id")({
  component: ValiseDetail,
});

const TIMELINE_STEPS: { key: ValiseStatus; label: string; icon: typeof Lock }[] = [
  { key: "preparation", label: "Créée", icon: Briefcase },
  { key: "sealed", label: "Scellée", icon: Lock },
  { key: "in_transit", label: "En transit", icon: Plane },
  { key: "arrived", label: "Arrivée", icon: Briefcase },
  { key: "controlled", label: "Contrôlée", icon: CheckCircle2 },
];

function ValiseDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const valises = useValises();
  const demands = useLiveDemands();
  const { actorName, warehouseId, isAdmin } = useAdminSession();
  const v = valises.find((x) => x.id === id);

  const manifest = useMemo(() => {
    if (!v) return [];
    return v.parcelRefs
      .map((r) => {
        const d = demands.find((x) => x.id === r.demandId);
        const p = d?.parcels.find((x) => x.id === r.parcelId);
        return d && p ? { d, p } : null;
      })
      .filter(Boolean) as { d: (typeof demands)[number]; p: (typeof demands)[number]["parcels"][number] }[];
  }, [v, demands]);

  const eligibleReceived = useMemo(() => {
    if (!v) return [];
    return demands.flatMap((d) =>
      d.parcels
        .filter((p) => p.status === "received" && !p.valiseId)
        .map((p) => ({ d, p })),
    );
  }, [v, demands]);

  if (!v) {
    return (
      <HubShell title="Valise introuvable">
        <div className="bg-card ring-1 ring-border rounded-xl p-10 text-center text-sm text-muted-foreground">
          Cette valise n'existe pas ou a été supprimée.
          <div className="mt-4">
            <Link to="/hub/valises" className="text-primary font-bold">
              ← Retour aux valises
            </Link>
          </div>
        </div>
      </HubShell>
    );
  }

  const from = WAREHOUSES.find((w) => w.id === v.warehouseFromId)?.name;
  const to = WAREHOUSES.find((w) => w.id === v.warehouseToId)?.name;
  const meta = VALISE_STATUS_META[v.status];
  const currentStepIdx = TIMELINE_STEPS.findIndex((s) => s.key === v.status);

  const totalWeight = manifest.reduce((s, m) => s + (m.p.weightKg ?? 0), 0);

  const canEdit = v.status === "preparation";
  const canSeal = v.status === "preparation" && v.parcelRefs.length > 0;
  const canDepart = v.status === "sealed";
  const canArrive = v.status === "in_transit" && (isAdmin || warehouseId === v.warehouseToId);
  const canControl = v.status === "arrived" && (isAdmin || warehouseId === v.warehouseToId);

  return (
    <HubShell title={`Valise ${v.code}`} subtitle={`${from} → ${to}`}>
      <div className="flex items-center gap-3 mb-4">
        <Link
          to="/hub/valises"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" /> Retour
        </Link>
        <StatusPill label={meta.label} tone={meta.tone} />
        {v.sealNumber ? (
          <span className="font-mono text-[11px] text-muted-foreground">
            <Lock className="inline size-3 mr-1" />
            {v.sealNumber}
          </span>
        ) : null}
        <div className="flex-1" />
        <button className="bg-muted text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2">
          <Download className="size-3.5" /> Manifeste PDF
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-card ring-1 ring-border rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between">
          {TIMELINE_STEPS.map((s, i) => {
            const done = i <= currentStepIdx;
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={
                      "size-10 rounded-full grid place-items-center " +
                      (done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                    }
                  >
                    <Icon className="size-4" />
                  </div>
                  <p className="text-[10px] font-bold mt-1.5 text-center">{s.label}</p>
                </div>
                {i < TIMELINE_STEPS.length - 1 ? (
                  <div
                    className={
                      "flex-1 h-0.5 mx-2 mb-4 " +
                      (i < currentStepIdx ? "bg-primary" : "bg-muted")
                    }
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-border pt-4 text-xs">
          <Stat label="Créée" value={v.createdAt ? formatDateTime(v.createdAt) : "—"} />
          <Stat label="Scellée" value={v.sealedAt ? formatDateTime(v.sealedAt) : "—"} />
          <Stat label="Départ" value={v.departedAt ? formatDateTime(v.departedAt) : "—"} />
          <Stat label="Arrivée" value={v.arrivedAt ? formatDateTime(v.arrivedAt) : "—"} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Manifest */}
        <SectionCard
          title={`Manifeste · ${manifest.length} colis · ${totalWeight.toFixed(1)} kg`}
        >
          {manifest.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              La valise est vide. Ajoutez des colis reçus depuis la colonne de droite.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">Colis</th>
                  <th className="text-left px-4 py-2">Demande</th>
                  <th className="text-left px-4 py-2">Client destinataire</th>
                  <th className="text-left px-4 py-2">Poids</th>
                  {canEdit ? <th className="w-10"></th> : null}
                </tr>
              </thead>
              <tbody>
                {manifest.map(({ d, p }) => (
                  <tr key={d.id + p.id} className="border-t border-border">
                    <td className="px-4 py-2">
                      <p className="font-mono text-[11px]">{p.reference}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                        {p.description}
                      </p>
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px]">{d.reference}</td>
                    <td className="px-4 py-2 text-xs">
                      {d.beneficiary?.name ?? d.contact.name}
                      <span className="block text-[10px] text-muted-foreground">
                        {d.route.to}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px]">
                      {p.weightKg ? `${p.weightKg} kg` : "—"}
                    </td>
                    {canEdit ? (
                      <td className="px-2 py-2 text-right">
                        <button
                          onClick={() =>
                            removeParcelFromValise(v.id, { demandId: d.id, parcelId: p.id })
                          }
                          className="text-muted-foreground hover:text-destructive"
                          title="Retirer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        {/* Side actions */}
        <div className="space-y-4">
          <SectionCard title="Actions">
            <div className="p-4 space-y-2">
              <button
                disabled={!canSeal}
                onClick={() => sealValise(v.id, actorName)}
                className="w-full bg-foreground text-background text-sm font-bold py-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Lock className="size-4" /> Sceller la valise
              </button>
              <button
                disabled={!canDepart}
                onClick={() => markDeparted(v.id, { actor: actorName })}
                className="w-full bg-primary text-primary-foreground text-sm font-bold py-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Plane className="size-4" /> Enregistrer le départ
              </button>
              <button
                disabled={!canArrive}
                onClick={() => markArrived(v.id, actorName)}
                className="w-full bg-muted text-sm font-bold py-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Briefcase className="size-4" /> Marquer comme arrivée
              </button>
              <button
                disabled={!canControl}
                onClick={() => navigate({ to: "/hub/arrivees" })}
                className="w-full bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="size-4" /> Contrôler à l'arrivée
              </button>
            </div>
          </SectionCard>

          {canEdit ? (
            <SectionCard title="Ajouter des colis reçus">
              {eligibleReceived.length === 0 ? (
                <p className="p-4 text-xs text-muted-foreground">
                  Aucun colis reçu non assigné.
                </p>
              ) : (
                <ul className="divide-y divide-border max-h-80 overflow-y-auto">
                  {eligibleReceived.map(({ d, p }) => (
                    <li key={d.id + p.id} className="px-4 py-2 flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{p.description}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {d.reference} · {p.weightKg ?? "?"} kg
                        </p>
                      </div>
                      <button
                        onClick={() => addParcelToValise(v.id, { demandId: d.id, parcelId: p.id })}
                        className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center hover:opacity-90"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          ) : null}
        </div>
      </div>
    </HubShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="text-xs font-medium">{value}</p>
    </div>
  );
}