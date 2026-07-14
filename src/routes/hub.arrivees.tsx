import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Briefcase, CheckCircle2, Lock, PackageX, PackageCheck, ArrowRight } from "lucide-react";
import { HubShell, StatusPill, SectionCard } from "@/features/hub/layout";
import { useValises, markArrived, controlValise, VALISE_STATUS_META } from "@/features/hub/valises";
import { useAdminSession, useLiveDemands } from "@/features/admin/session";
import { WAREHOUSES } from "@/features/admin/mock";
import { formatDateTime } from "@/features/demands/data";

export const Route = createFileRoute("/hub/arrivees")({
  component: ArriveesScreen,
});

type Check = "ok" | "missing" | "damaged";

function ArriveesScreen() {
  const valises = useValises();
  const demands = useLiveDemands();
  const { warehouseId, isAdmin, actorName } = useAdminSession();

  const inbound = useMemo(
    () =>
      valises.filter(
        (v) =>
          (v.status === "in_transit" || v.status === "arrived") &&
          (isAdmin || v.warehouseToId === warehouseId),
      ),
    [valises, warehouseId, isAdmin],
  );

  const [openValiseId, setOpenValiseId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, Check>>({});

  const openValise = valises.find((v) => v.id === openValiseId);

  function setCheck(k: string, v: Check) {
    setChecks((prev) => ({ ...prev, [k]: v }));
  }

  return (
    <HubShell title="Arrivée · Contrôle" subtitle="Valider les valises reçues à destination">
      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        <SectionCard title={`Valises entrantes · ${inbound.length}`}>
          {inbound.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground text-center">
              Aucune valise en approche pour cet entrepôt.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {inbound.map((v) => {
                const from = WAREHOUSES.find((w) => w.id === v.warehouseFromId)?.name;
                const to = WAREHOUSES.find((w) => w.id === v.warehouseToId)?.name;
                const meta = VALISE_STATUS_META[v.status];
                const active = openValiseId === v.id;
                return (
                  <li key={v.id}>
                    <button
                      onClick={() => {
                        setOpenValiseId(v.id);
                        setChecks({});
                      }}
                      className={
                        "w-full text-left px-4 py-3 hover:bg-muted/50 " +
                        (active ? "bg-primary/5" : "")
                      }
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-sm font-bold">{v.code}</p>
                        <StatusPill label={meta.label} tone={meta.tone} />
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        {from} <ArrowRight className="size-3" /> {to} · {v.parcelRefs.length} colis
                      </p>
                      {v.status === "in_transit" ? (
                        <div
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markArrived(v.id, actorName);
                          }}
                          className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline cursor-pointer"
                        >
                          <Briefcase className="size-3" /> Marquer comme arrivée
                        </div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Contrôle du manifeste">
          {!openValise ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Sélectionnez une valise à gauche pour contrôler son contenu.
            </div>
          ) : openValise.status === "in_transit" ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              La valise <span className="font-mono font-bold">{openValise.code}</span> est encore
              en transit. Marquez-la comme arrivée pour lancer le contrôle.
            </div>
          ) : (
            <ControlPanel
              valiseId={openValise.id}
              refs={openValise.parcelRefs}
              checks={checks}
              setCheck={setCheck}
              onSubmit={() => {
                controlValise(openValise.id, checks, actorName);
                setOpenValiseId(null);
                setChecks({});
              }}
              headerNote={
                <>
                  <span className="font-mono font-bold">{openValise.code}</span>
                  {openValise.sealNumber ? (
                    <span className="ml-2 text-muted-foreground">
                      <Lock className="inline size-3 mr-1" />
                      {openValise.sealNumber}
                    </span>
                  ) : null}
                  {openValise.arrivedAt ? (
                    <span className="ml-2 text-muted-foreground text-[11px]">
                      Arrivée {formatDateTime(openValise.arrivedAt)}
                    </span>
                  ) : null}
                </>
              }
              demands={demands}
              alreadyControlled={openValise.status === "controlled"}
            />
          )}
        </SectionCard>
      </div>
    </HubShell>
  );
}

function ControlPanel({
  valiseId,
  refs,
  checks,
  setCheck,
  onSubmit,
  headerNote,
  demands,
  alreadyControlled,
}: {
  valiseId: string;
  refs: { demandId: string; parcelId: string }[];
  checks: Record<string, Check>;
  setCheck: (k: string, v: Check) => void;
  onSubmit: () => void;
  headerNote: React.ReactNode;
  demands: ReturnType<typeof useLiveDemands>;
  alreadyControlled: boolean;
}) {
  return (
    <div className="p-4 space-y-3">
      <p className="text-xs">{headerNote}</p>
      {refs.length === 0 ? (
        <p className="text-sm text-muted-foreground p-6 text-center">Valise vide.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2">Colis</th>
                <th className="text-left py-2">Client</th>
                <th className="text-right py-2">Contrôle</th>
              </tr>
            </thead>
            <tbody>
              {refs.map((r) => {
                const d = demands.find((x) => x.id === r.demandId);
                const p = d?.parcels.find((x) => x.id === r.parcelId);
                if (!d || !p) return null;
                const key = r.demandId + ":" + r.parcelId;
                const cur = checks[key] ?? (p.arrivalCheck ?? "ok");
                return (
                  <tr key={key} className="border-b border-border">
                    <td className="py-2">
                      <p className="font-mono text-[11px]">{p.reference}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[240px]">{p.description}</p>
                    </td>
                    <td className="py-2 text-xs">
                      {d.beneficiary?.name ?? d.contact.name}
                      <span className="block text-[10px] text-muted-foreground font-mono">
                        {d.reference}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex justify-end gap-1">
                        <CheckBtn
                          active={cur === "ok"}
                          onClick={() => setCheck(key, "ok")}
                          tone="ok"
                          icon={<PackageCheck className="size-3.5" />}
                          label="OK"
                        />
                        <CheckBtn
                          active={cur === "damaged"}
                          onClick={() => setCheck(key, "damaged")}
                          tone="warn"
                          icon={<PackageX className="size-3.5" />}
                          label="Abîmé"
                        />
                        <CheckBtn
                          active={cur === "missing"}
                          onClick={() => setCheck(key, "missing")}
                          tone="danger"
                          icon={<PackageX className="size-3.5" />}
                          label="Manquant"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-end pt-2">
            <button
              disabled={alreadyControlled}
              onClick={onSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-40 flex items-center gap-2"
            >
              <CheckCircle2 className="size-4" />
              {alreadyControlled ? "Déjà contrôlée" : "Valider le contrôle"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CheckBtn({
  active,
  tone,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  tone: "ok" | "warn" | "danger";
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const base = "px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ring-1 ";
  const activeCls =
    tone === "ok"
      ? "bg-emerald-600 text-white ring-emerald-600"
      : tone === "warn"
        ? "bg-amber-500 text-white ring-amber-500"
        : "bg-destructive text-destructive-foreground ring-destructive";
  const inactiveCls = "bg-card text-muted-foreground ring-border hover:text-foreground";
  return (
    <button onClick={onClick} className={base + (active ? activeCls : inactiveCls)}>
      {icon}
      {label}
    </button>
  );
}