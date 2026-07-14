import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  Sparkles,
  User,
  Truck,
  Scale,
  Hash,
  ChevronRight,
} from "lucide-react";
import { useAdminSession, useWarehouseDemands } from "@/features/admin/session";
import { findCandidates, classifyMatch, type Candidate } from "@/features/admin/matching";
import { scanStore, useScan } from "@/features/admin/scanStore";
import { receiveParcel } from "@/features/demands/data";

export const Route = createFileRoute("/admin/scan/match")({
  component: MatchScreen,
});

function MatchScreen() {
  const navigate = useNavigate();
  const { ocr } = useScan();
  const demands = useWarehouseDemands();
  const { warehouseId, isAdmin, actorName, warehouse } = useAdminSession();

  useEffect(() => {
    if (!ocr) navigate({ to: "/admin/scan", replace: true });
  }, [ocr, navigate]);

  const candidates = useMemo<Candidate[]>(() => {
    if (!ocr) return [];
    return findCandidates(ocr, demands, {
      warehouseId: isAdmin ? undefined : warehouseId,
    });
  }, [ocr, demands, warehouseId, isAdmin]);

  const verdict = classifyMatch(candidates);

  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  function confirmReception(c: Candidate) {
    receiveParcel({
      demandId: c.demand.id,
      parcelId: c.parcel.id,
      weightKg: ocr?.weightKg,
      trackingNumber: ocr?.trackingNumber,
      actor: actorName,
      warehouseLabel: warehouse?.name,
    });
    setConfirmedId(c.demand.id + c.parcel.id);
  }

  if (!ocr) return null;

  if (confirmedId) {
    return (
      <div className="pt-16 px-6 text-center">
        <div className="size-16 mx-auto rounded-full bg-emerald-500 text-white grid place-items-center mb-4">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Colis réceptionné</h1>
        <p className="text-sm text-muted-foreground mb-8">
          La demande a été mise à jour, le client sera notifié automatiquement.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              scanStore.clear();
              navigate({ to: "/admin/scan" });
            }}
            className="bg-foreground text-background font-bold py-3.5 rounded-xl text-sm"
          >
            Scanner un autre colis
          </button>
          <Link
            to="/admin"
            onClick={() => scanStore.clear()}
            className="text-sm text-muted-foreground py-2"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="pt-10 px-5 pb-4 flex items-center gap-3">
        <Link
          to="/admin/scan"
          onClick={() => scanStore.clear()}
          className="size-9 rounded-full bg-muted grid place-items-center"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Étape 2 / 3
          </p>
          <h1 className="text-lg font-bold tracking-tight">Résultat du scan</h1>
        </div>
      </header>

      {/* OCR card */}
      <section className="px-5">
        <div className="bg-foreground text-background rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
              <Sparkles className="size-3" /> Détecté par IA
            </p>
            <button className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Corriger
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <OcrField icon={User} label="Nom" value={ocr.recipientName} />
            <OcrField
              icon={Hash}
              label="Tracking"
              value={ocr.trackingNumber ?? "Non détecté"}
              missing={!ocr.trackingNumber}
            />
            <OcrField
              icon={Scale}
              label="Poids"
              value={ocr.weightKg ? `${ocr.weightKg} kg` : "—"}
            />
            <OcrField icon={Truck} label="Transporteur" value={ocr.carrier ?? "—"} />
          </div>
        </div>
      </section>

      {/* Verdict */}
      <section className="px-5 mt-4">
        {verdict === "certain" ? (
          <CertainMatch candidate={candidates[0]} onConfirm={confirmReception} />
        ) : verdict === "candidates" ? (
          <CandidatesList candidates={candidates} onPick={confirmReception} />
        ) : (
          <NoMatch />
        )}
      </section>
    </div>
  );
}

function OcrField({
  icon: Icon,
  label,
  value,
  missing,
}: {
  icon: typeof User;
  label: string;
  value: string;
  missing?: boolean;
}) {
  return (
    <div className="bg-background/10 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="size-3 opacity-60" />
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{label}</span>
      </div>
      <p className={"text-sm font-bold truncate " + (missing ? "opacity-50 italic" : "")}>
        {value}
      </p>
    </div>
  );
}

function CertainMatch({
  candidate,
  onConfirm,
}: {
  candidate: Candidate;
  onConfirm: (c: Candidate) => void;
}) {
  const { demand, parcel, reasons } = candidate;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="size-4 text-emerald-600" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
          Colis identifié · match certain
        </p>
      </div>
      <div className="bg-card ring-2 ring-emerald-500/40 rounded-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-muted-foreground">{demand.reference}</p>
            <p className="text-sm font-bold truncate">{parcel.description}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {demand.contact.name} → {demand.route.to}
            </p>
          </div>
          <span className="font-mono text-lg font-bold text-emerald-700">
            {candidate.score}%
          </span>
        </div>
        <ul className="text-[11px] text-muted-foreground space-y-1">
          {reasons.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onConfirm(candidate)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm"
        >
          Confirmer la réception
        </button>
        <button
          type="button"
          className="w-full text-xs text-muted-foreground py-1"
        >
          Ce n'est pas le bon colis
        </button>
      </div>
    </div>
  );
}

function CandidatesList({
  candidates,
  onPick,
}: {
  candidates: Candidate[];
  onPick: (c: Candidate) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="size-4 text-amber-600" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
          Plusieurs demandes possibles
        </p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Aucun numéro de suivi détecté. Choisissez la demande correspondante :
      </p>
      <ul className="space-y-2">
        {candidates.slice(0, 5).map((c) => (
          <li key={c.demand.id + c.parcel.id}>
            <button
              type="button"
              onClick={() => onPick(c)}
              className="w-full text-left bg-card ring-1 ring-border rounded-2xl p-4 hover:ring-primary/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {c.demand.reference}
                  </p>
                  <p className="text-sm font-bold truncate">{c.parcel.description}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {c.demand.contact.name} · {c.demand.route.to}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-base font-bold">{c.score}%</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    confiance
                  </p>
                </div>
              </div>
              <ScoreBar score={c.score} />
              <ul className="text-[10px] text-muted-foreground space-y-0.5 mt-2">
                {c.reasons.slice(0, 3).map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="w-full mt-4 text-xs font-bold text-muted-foreground border border-border rounded-xl py-3 flex items-center justify-center gap-2"
      >
        <PackageX className="size-4" />
        Aucun ne correspond · créer un colis orphelin
      </button>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-primary" : score >= 40 ? "bg-amber-500" : "bg-muted-foreground";
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={"h-full transition-all " + color}
        style={{ width: `${Math.min(100, score)}%` }}
      />
    </div>
  );
}

function NoMatch() {
  return (
    <div className="text-center py-10">
      <div className="size-14 mx-auto rounded-full bg-muted grid place-items-center mb-3">
        <PackageX className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-bold">Aucune demande correspondante</h2>
      <p className="text-xs text-muted-foreground mt-1 mb-6">
        Aucune demande ouverte ne correspond à ce bordereau dans cet entrepôt.
      </p>
      <div className="flex flex-col gap-2">
        <button className="bg-foreground text-background font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
          Rechercher manuellement <ChevronRight className="size-4" />
        </button>
        <button className="border border-border text-sm font-bold py-3 rounded-xl">
          Créer un colis orphelin
        </button>
      </div>
    </div>
  );
}