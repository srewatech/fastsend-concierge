import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  Plus,
  ChevronRight,
} from "lucide-react";
import { HubShell } from "@/features/hub/layout";
import { useAdminSession, useWarehouseDemands } from "@/features/admin/session";
import {
  findCandidates,
  classifyMatch,
  SCAN_SCENARIOS,
  type OcrResult,
  type Candidate,
} from "@/features/admin/matching";
import { receiveParcel } from "@/features/demands/data";

export const Route = createFileRoute("/hub/reception")({
  component: ReceptionScreen,
});

function ReceptionScreen() {
  const demands = useWarehouseDemands();
  const { warehouseId, isAdmin, warehouse, actorName } = useAdminSession();
  const [ocr, setOcr] = useState<OcrResult | null>(null);
  const [manualQuery, setManualQuery] = useState("");
  const [confirmedKey, setConfirmedKey] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const candidates = useMemo<Candidate[]>(() => {
    if (!ocr) return [];
    return findCandidates(ocr, demands, {
      warehouseId: isAdmin ? undefined : warehouseId,
    });
  }, [ocr, demands, warehouseId, isAdmin]);

  const verdict = classifyMatch(candidates);

  const queue = useMemo(() => {
    // File d'attente simulée : colis attendus dans l'entrepôt
    return demands
      .flatMap((d) => d.parcels.filter((p) => p.status === "expected").map((p) => ({ d, p })))
      .slice(0, 8);
  }, [demands]);

  function simulate(kind: "with" | "without") {
    setConfirmedKey(null);
    setOcr(kind === "with" ? SCAN_SCENARIOS.withTracking() : SCAN_SCENARIOS.withoutTracking());
  }

  function confirm(c: Candidate) {
    receiveParcel({
      demandId: c.demand.id,
      parcelId: c.parcel.id,
      weightKg: ocr?.weightKg,
      trackingNumber: ocr?.trackingNumber,
      actor: actorName,
      warehouseLabel: warehouse?.name,
    });
    setConfirmedKey(c.demand.id + c.parcel.id);
  }

  return (
    <HubShell title="Poste de réception" subtitle="Scan, IA/OCR et rapprochement automatique">
      <div className="grid lg:grid-cols-[280px_1fr_360px] gap-4">
        {/* Queue */}
        <aside className="bg-card ring-1 ring-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              File d'attente
            </p>
            <p className="text-sm font-bold">{queue.length} bordereaux à traiter</p>
          </div>
          <ul className="divide-y divide-border max-h-[540px] overflow-y-auto">
            {queue.map(({ d, p }) => (
              <li key={d.id + p.id} className="px-4 py-3 hover:bg-muted/50">
                <p className="font-mono text-[10px] text-muted-foreground">{d.reference}</p>
                <p className="text-sm font-medium truncate">{p.description}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {d.contact.name}
                  {p.weightKg ? ` · ${p.weightKg} kg` : ""}
                  {p.carrier ? ` · ${p.carrier}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </aside>

        {/* Center: OCR + actions */}
        <div className="space-y-4">
          <div className="bg-card ring-1 ring-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="Recherche manuelle : nom, tracking, téléphone…"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => simulate("with")}
                className="bg-foreground text-background rounded-lg p-4 text-left hover:opacity-90"
              >
                <Camera className="size-5 mb-2" />
                <p className="text-sm font-bold">Simuler scan · avec tracking</p>
                <p className="text-[11px] opacity-60">OCR complet + tracking détecté</p>
              </button>
              <button
                type="button"
                onClick={() => simulate("without")}
                className="bg-muted ring-1 ring-border rounded-lg p-4 text-left hover:bg-muted/70"
              >
                <Upload className="size-5 mb-2" />
                <p className="text-sm font-bold">Simuler scan · sans tracking</p>
                <p className="text-[11px] text-muted-foreground">Match par nom + description</p>
              </button>
            </div>
          </div>

          {/* OCR panel */}
          <div className="bg-card ring-1 ring-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Sparkles className="size-3 text-primary" /> Fiche OCR
              </p>
              {ocr ? (
                <button
                  type="button"
                  onClick={() => setOcr(null)}
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  Réinitialiser
                </button>
              ) : null}
            </div>
            {ocr ? (
              <OcrForm ocr={ocr} onChange={setOcr} />
            ) : (
              <div className="text-center py-10 text-sm text-muted-foreground">
                <div className="size-14 mx-auto rounded-full bg-muted grid place-items-center mb-3">
                  <Camera className="size-6" />
                </div>
                Simulez un scan ou déposez une photo pour lancer l'analyse.
              </div>
            )}
          </div>
        </div>

        {/* Right: candidates */}
        <aside className="bg-card ring-1 ring-border rounded-xl p-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Candidats de rapprochement
          </p>
          {confirmedKey ? (
            <div className="text-center py-6">
              <div className="size-12 mx-auto rounded-full bg-emerald-500 text-white grid place-items-center mb-2">
                <CheckCircle2 className="size-6" />
              </div>
              <p className="text-sm font-bold">Réception enregistrée</p>
              <p className="text-[11px] text-muted-foreground">
                Le client sera notifié automatiquement.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOcr(null);
                  setConfirmedKey(null);
                }}
                className="mt-4 w-full bg-foreground text-background text-sm font-bold py-2.5 rounded-lg"
              >
                Traiter le suivant
              </button>
            </div>
          ) : !ocr ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              En attente d'un scan.
            </p>
          ) : verdict === "certain" ? (
            <CertainCard c={candidates[0]} onConfirm={confirm} />
          ) : verdict === "candidates" ? (
            <>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-600" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                  Plusieurs correspondances
                </p>
              </div>
              <ul className="space-y-2">
                {candidates.slice(0, 4).map((c) => (
                  <CandidateRow key={c.demand.id + c.parcel.id} c={c} onPick={confirm} />
                ))}
              </ul>
            </>
          ) : (
            <NoMatchBlock onCreate={() => setShowCreate(true)} />
          )}

          {ocr ? (
            <>
              <button
                type="button"
                className="w-full mt-2 border border-dashed border-border rounded-lg py-2 text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
              >
                <PackageX className="size-3.5" /> Créer un colis orphelin
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="w-full border border-dashed border-primary text-primary rounded-lg py-2 text-[11px] font-bold flex items-center justify-center gap-2"
              >
                <Plus className="size-3.5" /> Créer une demande (dernier recours)
              </button>
            </>
          ) : null}
        </aside>
      </div>

      {showCreate ? <CreateDemandModal onClose={() => setShowCreate(false)} /> : null}
    </HubShell>
  );
}

function OcrForm({ ocr, onChange }: { ocr: OcrResult; onChange: (o: OcrResult) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field
        label="Nom destinataire"
        value={ocr.recipientName}
        onChange={(v) => onChange({ ...ocr, recipientName: v })}
      />
      <Field
        label="N° de suivi"
        value={ocr.trackingNumber ?? ""}
        placeholder="Non détecté"
        onChange={(v) => onChange({ ...ocr, trackingNumber: v || undefined })}
      />
      <Field
        label="Poids (kg)"
        value={ocr.weightKg?.toString() ?? ""}
        onChange={(v) => onChange({ ...ocr, weightKg: v ? Number(v) : undefined })}
      />
      <Field
        label="Transporteur"
        value={ocr.carrier ?? ""}
        onChange={(v) => onChange({ ...ocr, carrier: v || undefined })}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-muted rounded-md px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

function CertainCard({
  c,
  onConfirm,
}: {
  c: Candidate;
  onConfirm: (c: Candidate) => void;
}) {
  return (
    <div className="ring-2 ring-emerald-500/40 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-emerald-600" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
          Match certain · {c.score}%
        </p>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">{c.demand.reference}</p>
      <p className="text-sm font-bold truncate">{c.parcel.description}</p>
      <p className="text-[11px] text-muted-foreground truncate">
        {c.demand.contact.name} → {c.demand.route.to}
      </p>
      <ul className="text-[10px] text-muted-foreground space-y-0.5">
        {c.reasons.slice(0, 3).map((r) => (
          <li key={r}>· {r}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onConfirm(c)}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-md text-sm"
      >
        Confirmer la réception
      </button>
    </div>
  );
}

function CandidateRow({ c, onPick }: { c: Candidate; onPick: (c: Candidate) => void }) {
  const color =
    c.score >= 80 ? "bg-emerald-500" : c.score >= 60 ? "bg-primary" : "bg-amber-500";
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(c)}
        className="w-full text-left ring-1 ring-border rounded-lg p-3 hover:ring-primary transition-all"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-muted-foreground">{c.demand.reference}</p>
            <p className="text-sm font-bold truncate">{c.parcel.description}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {c.demand.contact.name} · {c.demand.route.to}
            </p>
          </div>
          <span className="font-mono text-sm font-bold">{c.score}%</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className={"h-full " + color} style={{ width: `${c.score}%` }} />
        </div>
      </button>
    </li>
  );
}

function NoMatchBlock({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="size-10 mx-auto rounded-full bg-muted grid place-items-center mb-2">
        <PackageX className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-bold">Aucune demande correspondante</p>
      <p className="text-[11px] text-muted-foreground mb-3">
        Rechercher manuellement ou créer un dossier.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="w-full bg-foreground text-background text-sm font-bold py-2 rounded-md flex items-center justify-center gap-2"
      >
        Créer une demande <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function CreateDemandModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 grid place-items-center p-4">
      <div className="bg-background rounded-2xl ring-1 ring-border shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Dernier recours
            </p>
            <h2 className="text-lg font-bold">Créer une demande côté opérateur</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          À utiliser quand le colis arrive sans qu'aucune demande client n'existe. Vous pourrez
          rattacher le colis et facturer le client ensuite.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom client" value="" onChange={() => {}} />
          <Field label="Téléphone" value="" onChange={() => {}} />
          <Field label="Service" value="Delivery" onChange={() => {}} />
          <Field label="Destination" value="Brazzaville" onChange={() => {}} />
        </div>
        <label className="block mt-3">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Description du colis
          </span>
          <textarea
            className="mt-1 w-full bg-muted rounded-md px-2.5 py-1.5 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex. AliExpress · pièces vélo (dérailleur + chaîne)"
          />
        </label>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 bg-muted text-sm font-bold py-2.5 rounded-lg"
          >
            Annuler
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-foreground text-background text-sm font-bold py-2.5 rounded-lg"
          >
            Créer et rattacher
          </button>
        </div>
      </div>
    </div>
  );
}
