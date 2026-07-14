import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  getDemand,
  STATUS_META,
  PARCEL_STATUS_META,
  formatMoney,
  formatDate,
  formatDateTime,
} from "@/features/demands/data";
import { StatusBadge, SectionCard, KeyValue } from "@/features/demands/ui";

export const Route = createFileRoute("/demandes/$id")({
  loader: ({ params }) => {
    const demand = getDemand(params.id);
    if (!demand) throw notFound();
    return { demand };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.demand.reference} · FastSends` : "Demande · FastSends" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemandDetail,
  notFoundComponent: DemandNotFound,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-sm text-muted-foreground">
      Impossible de charger cette demande. {error.message}
    </div>
  ),
});

function DemandNotFound() {
  return (
    <div className="mx-auto max-w-[440px] min-h-screen grid place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Demande introuvable</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Cette référence n'existe pas ou n'est plus accessible.
        </p>
        <Link
          to="/demandes"
          className="inline-flex bg-foreground text-background font-bold px-5 py-3 rounded-xl text-sm"
        >
          ← Retour aux demandes
        </Link>
      </div>
    </div>
  );
}

const TIMELINE_TONE: Record<
  "info" | "success" | "warning" | "milestone",
  { dot: string; ring: string }
> = {
  info: { dot: "bg-primary", ring: "ring-primary/20" },
  success: { dot: "bg-emerald-500", ring: "ring-emerald-500/20" },
  warning: { dot: "bg-amber-500", ring: "ring-amber-500/20" },
  milestone: { dot: "bg-foreground", ring: "ring-foreground/20" },
};

function DemandDetail() {
  const { demand } = Route.useLoaderData();
  const meta = STATUS_META[demand.status];
  const received = demand.parcels.filter((p) => p.status !== "expected").length;

  return (
    <div className="mx-auto max-w-[440px] min-h-screen bg-background text-foreground pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <Link
            to="/demandes"
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
          >
            ← Toutes les demandes
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {demand.serviceCode}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] text-muted-foreground">{demand.reference}</p>
            <h1 className="text-xl font-bold tracking-tight">{demand.serviceName}</h1>
          </div>
          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
        </div>
      </header>

      <main className="p-5 space-y-4">
        {/* Hero route + amount */}
        <div className="bg-foreground text-background rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Départ</p>
              <p className="text-sm font-bold truncate">{demand.route.from}</p>
            </div>
            <div className="flex-1 relative h-6 flex items-center">
              <div className="h-px w-full bg-background/25" />
              <div className="absolute left-1/2 -translate-x-1/2 size-2 bg-primary rounded-full" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Arrivée</p>
              <p className="text-sm font-bold truncate">{demand.route.to}</p>
            </div>
          </div>
          <div className="flex items-end justify-between pt-4 border-t border-background/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Montant</p>
              <p className="font-mono text-2xl font-bold">
                {demand.amount ? formatMoney(demand.amount, demand.currency) : "En attente"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Paiement</p>
              <p className="text-xs font-bold">
                {demand.paymentStatus === "paid"
                  ? "✓ Payé"
                  : demand.paymentStatus === "refunded"
                    ? "Remboursé"
                    : "En attente"}
              </p>
            </div>
          </div>
        </div>

        {/* Parcels progress */}
        <SectionCard
          title={`Colis · ${received}/${demand.parcels.length} traités`}
        >
          <div className="space-y-2">
            {demand.parcels.map((p, i) => {
              const pMeta = PARCEL_STATUS_META[p.status];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl"
                >
                  <div className="size-9 shrink-0 bg-card rounded-lg grid place-items-center font-mono text-[10px] font-bold ring-1 ring-border">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{p.description}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {p.reference}
                      {p.weightKg ? ` · ${p.weightKg} kg` : ""}
                      {p.receivedAt ? ` · reçu le ${formatDate(p.receivedAt)}` : ""}
                    </p>
                  </div>
                  <StatusBadge tone={pMeta.tone}>{pMeta.label}</StatusBadge>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Timeline */}
        <SectionCard title="Suivi">
          <ol className="relative pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            {demand.timeline
              .slice()
              .reverse()
              .map((e) => {
                const tone = TIMELINE_TONE[e.type];
                return (
                  <li key={e.id} className="relative pb-5 last:pb-0">
                    <span
                      className={
                        "absolute -left-6 top-1.5 size-3 rounded-full ring-4 " +
                        tone.dot +
                        " " +
                        tone.ring
                      }
                    />
                    <p className="text-sm font-bold leading-tight">{e.title}</p>
                    {e.description ? (
                      <p className="text-[12px] text-muted-foreground mt-0.5">{e.description}</p>
                    ) : null}
                    <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-widest">
                      {formatDateTime(e.date)}
                      {e.actor ? ` · ${e.actor}` : ""}
                    </p>
                  </li>
                );
              })}
          </ol>
        </SectionCard>

        {/* Beneficiary */}
        {demand.beneficiary ? (
          <SectionCard title="Bénéficiaire">
            <KeyValue label="Nom" value={demand.beneficiary.name} />
            <KeyValue label="Téléphone" value={demand.beneficiary.phone} />
            {demand.beneficiary.address ? (
              <KeyValue label="Adresse" value={demand.beneficiary.address} />
            ) : null}
          </SectionCard>
        ) : null}

        {/* Contact */}
        <SectionCard title="Contact demandeur">
          <KeyValue label="Nom" value={demand.contact.name} />
          <KeyValue label="Email" value={demand.contact.email} />
          <KeyValue label="Téléphone" value={demand.contact.phone} />
        </SectionCard>

        {/* Payment */}
        <SectionCard title="Paiement">
          <KeyValue label="Méthode" value={demand.paymentMethod} />
          <KeyValue
            label="Statut"
            value={
              <StatusBadge
                tone={
                  demand.paymentStatus === "paid"
                    ? "success"
                    : demand.paymentStatus === "refunded"
                      ? "neutral"
                      : "warn"
                }
              >
                {demand.paymentStatus === "paid"
                  ? "Payé"
                  : demand.paymentStatus === "refunded"
                    ? "Remboursé"
                    : "En attente"}
              </StatusBadge>
            }
          />
          {demand.promoCode ? <KeyValue label="Code promo" value={demand.promoCode} /> : null}
          {demand.referralCode ? (
            <KeyValue label="Parrainage" value={demand.referralCode} />
          ) : null}
        </SectionCard>

        {/* Meta */}
        <SectionCard title="Informations">
          <KeyValue label="Créée le" value={formatDateTime(demand.createdAt)} />
          <KeyValue label="Dernière MAJ" value={formatDateTime(demand.updatedAt)} />
          {demand.notes ? <KeyValue label="Notes" value={demand.notes} /> : null}
        </SectionCard>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            className="bg-card ring-1 ring-border font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-all"
          >
            Contacter le support
          </button>
          <button
            type="button"
            className="bg-foreground text-background font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-all"
          >
            Télécharger le reçu
          </button>
        </div>
      </main>
    </div>
  );
}