import type { ServiceId } from "../wizard/types";

export type DemandStatus =
  | "pending_review"
  | "awaiting_payment"
  | "in_warehouse"
  | "in_transit"
  | "customs"
  | "delivered"
  | "cancelled";

export type ParcelStatus = "expected" | "received" | "shipped" | "delivered" | "issue";

export interface TimelineEvent {
  id: string;
  date: string; // ISO
  title: string;
  description?: string;
  actor?: string;
  type: "info" | "success" | "warning" | "milestone";
}

export interface DemandParcel {
  id: string;
  reference: string;
  description: string;
  weightKg?: number;
  status: ParcelStatus;
  receivedAt?: string;
  trackingNumber?: string;
  carrier?: string;
  receivedBy?: string;
}

export interface Demand {
  id: string;
  reference: string;
  serviceId: ServiceId;
  serviceName: string;
  serviceCode: string;
  status: DemandStatus;
  createdAt: string;
  updatedAt: string;
  route: { from: string; to: string };
  warehouseId?: string; // Entrepôt FR de réception (pour delivery)
  beneficiary?: { name: string; phone: string; address?: string };
  contact: { name: string; email: string; phone: string };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "refunded";
  amount?: number;
  currency: string;
  promoCode?: string;
  referralCode?: string;
  parcels: DemandParcel[];
  timeline: TimelineEvent[];
  notes?: string;
}

export const STATUS_META: Record<
  DemandStatus,
  { label: string; tone: "neutral" | "warn" | "info" | "success" | "danger" }
> = {
  pending_review: { label: "En revue", tone: "neutral" },
  awaiting_payment: { label: "Paiement attendu", tone: "warn" },
  in_warehouse: { label: "En entrepôt", tone: "info" },
  in_transit: { label: "En transit", tone: "info" },
  customs: { label: "Douanes", tone: "warn" },
  delivered: { label: "Livrée", tone: "success" },
  cancelled: { label: "Annulée", tone: "danger" },
};

export const PARCEL_STATUS_META: Record<
  ParcelStatus,
  { label: string; tone: "neutral" | "warn" | "info" | "success" | "danger" }
> = {
  expected: { label: "Attendu", tone: "neutral" },
  received: { label: "Reçu", tone: "info" },
  shipped: { label: "Expédié", tone: "info" },
  delivered: { label: "Livré", tone: "success" },
  issue: { label: "Anomalie", tone: "danger" },
};

export const DEMANDS: Demand[] = [
  {
    id: "FS-DLS-00421",
    reference: "FS-DLS-00421",
    serviceId: "delivery",
    serviceName: "Delivery",
    serviceCode: "DLS",
    status: "in_transit",
    createdAt: "2026-07-08T09:14:00Z",
    updatedAt: "2026-07-12T18:03:00Z",
    route: { from: "Paris CDG", to: "Brazzaville" },
    warehouseId: "paris-cdg",
    beneficiary: {
      name: "Sarah Mabiala",
      phone: "+242 06 512 4478",
      address: "12 rue de la Paix, Bacongo",
    },
    contact: { name: "Nadia B.", email: "nadia@example.com", phone: "+33 6 12 34 56 78" },
    paymentMethod: "Carte bancaire",
    paymentStatus: "paid",
    amount: 145000,
    currency: "XAF",
    promoCode: "SUMMER10",
    parcels: [
      {
        id: "p1",
        reference: "BRD-8842",
        description: "Vêtements enfants",
        weightKg: 4.2,
        status: "shipped",
        receivedAt: "2026-07-10T14:20:00Z",
        trackingNumber: "TBA123456789FR",
        carrier: "Amazon Logistics",
      },
      {
        id: "p2",
        reference: "BRD-8843",
        description: "Produits cosmétiques",
        weightKg: 2.1,
        status: "shipped",
        receivedAt: "2026-07-10T14:25:00Z",
        trackingNumber: "LX998877665CN",
        carrier: "Sephora",
      },
      { id: "p3", reference: "BRD-8844", description: "Chaussures", status: "expected" },
    ],
    timeline: [
      {
        id: "t1",
        date: "2026-07-08T09:14:00Z",
        title: "Demande créée",
        description: "Réception de la demande via l'application.",
        actor: "Système",
        type: "milestone",
      },
      {
        id: "t2",
        date: "2026-07-08T11:02:00Z",
        title: "Validée par l'équipe FastSends",
        actor: "Admin · Jean",
        type: "success",
      },
      {
        id: "t3",
        date: "2026-07-09T10:30:00Z",
        title: "Paiement confirmé",
        description: "145 000 XAF via Carte bancaire.",
        type: "success",
      },
      {
        id: "t4",
        date: "2026-07-10T14:25:00Z",
        title: "2 colis reçus à Paris CDG",
        description: "Bordereaux BRD-8842 et BRD-8843.",
        type: "info",
      },
      {
        id: "t5",
        date: "2026-07-12T18:03:00Z",
        title: "En transit vers Brazzaville",
        description: "Vol AF-820 · ETA 15 juillet.",
        type: "info",
      },
    ],
    notes: "Fragile · manipuler avec précaution.",
  },
  {
    id: "FS-SFL-00418",
    reference: "FS-SFL-00418",
    serviceId: "shop_online",
    serviceName: "Shop For You — En Ligne",
    serviceCode: "SFL",
    status: "awaiting_payment",
    createdAt: "2026-07-11T15:40:00Z",
    updatedAt: "2026-07-11T15:41:00Z",
    route: { from: "France (en ligne)", to: "Pointe-Noire" },
    contact: { name: "Nadia B.", email: "nadia@example.com", phone: "+33 6 12 34 56 78" },
    paymentMethod: "PayPal",
    paymentStatus: "pending",
    amount: 82500,
    currency: "XAF",
    parcels: [
      { id: "p1", reference: "—", description: "Zara · robe midi × 2", status: "expected" },
      { id: "p2", reference: "—", description: "Sephora · parfum 100ml", status: "expected" },
    ],
    timeline: [
      {
        id: "t1",
        date: "2026-07-11T15:40:00Z",
        title: "Demande créée",
        actor: "Système",
        type: "milestone",
      },
      {
        id: "t2",
        date: "2026-07-11T15:41:00Z",
        title: "Devis envoyé",
        description: "Lien PayPal transmis par email.",
        actor: "Admin · Aline",
        type: "warning",
      },
    ],
  },
  {
    id: "FS-PUS-00402",
    reference: "FS-PUS-00402",
    serviceId: "pickup",
    serviceName: "Pick-up",
    serviceCode: "PUS",
    status: "delivered",
    createdAt: "2026-06-28T08:22:00Z",
    updatedAt: "2026-07-01T16:10:00Z",
    route: { from: "Paris 17e", to: "Paris CDG" },
    contact: { name: "Nadia B.", email: "nadia@example.com", phone: "+33 6 12 34 56 78" },
    paymentMethod: "Espèces",
    paymentStatus: "paid",
    amount: 18000,
    currency: "XAF",
    parcels: [
      {
        id: "p1",
        reference: "BRD-8710",
        description: "1 carton scellé · 6 kg",
        weightKg: 6,
        status: "delivered",
      },
    ],
    timeline: [
      {
        id: "t1",
        date: "2026-06-28T08:22:00Z",
        title: "Demande créée",
        type: "milestone",
      },
      {
        id: "t2",
        date: "2026-06-30T09:00:00Z",
        title: "Chauffeur assigné",
        description: "Fabrice · +33 7 45 22 10 09",
        type: "info",
      },
      {
        id: "t3",
        date: "2026-07-01T11:30:00Z",
        title: "Colis récupéré",
        type: "success",
      },
      {
        id: "t4",
        date: "2026-07-01T16:10:00Z",
        title: "Livré à l'entrepôt Paris CDG",
        type: "success",
      },
    ],
  },
  {
    id: "FS-FRA-00389",
    reference: "FS-FRA-00389",
    serviceId: "air_freight",
    serviceName: "Fret Aérien",
    serviceCode: "FRA",
    status: "customs",
    createdAt: "2026-07-02T13:00:00Z",
    updatedAt: "2026-07-13T09:12:00Z",
    route: { from: "Marseille", to: "Pointe-Noire" },
    contact: { name: "Nadia B.", email: "nadia@example.com", phone: "+33 6 12 34 56 78" },
    paymentMethod: "Mobile Money",
    paymentStatus: "paid",
    amount: 312000,
    currency: "XAF",
    parcels: [
      {
        id: "p1",
        reference: "AF-9921",
        description: "Pièces auto · 42 kg",
        weightKg: 42,
        status: "shipped",
      },
    ],
    timeline: [
      { id: "t1", date: "2026-07-02T13:00:00Z", title: "Demande créée", type: "milestone" },
      { id: "t2", date: "2026-07-04T10:00:00Z", title: "Paiement confirmé", type: "success" },
      { id: "t3", date: "2026-07-10T08:45:00Z", title: "Départ Marseille", type: "info" },
      {
        id: "t4",
        date: "2026-07-13T09:12:00Z",
        title: "Blocage douanes Pointe-Noire",
        description: "En attente d'un document complémentaire (facture pro forma).",
        type: "warning",
      },
    ],
    notes: "Contacter le client pour la facture pro forma.",
  },
  // Demandes Delivery supplémentaires — colis attendus en entrepôts FR
  {
    id: "FS-DLS-00435",
    reference: "FS-DLS-00435",
    serviceId: "delivery",
    serviceName: "Delivery",
    serviceCode: "DLS",
    status: "in_warehouse",
    createdAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-07-13T11:00:00Z",
    route: { from: "Paris CDG", to: "Brazzaville" },
    warehouseId: "paris-cdg",
    beneficiary: { name: "Alain Ngouabi", phone: "+242 06 998 1122" },
    contact: { name: "Karim T.", email: "karim@example.com", phone: "+33 6 22 33 44 55" },
    paymentMethod: "Carte bancaire",
    paymentStatus: "paid",
    amount: 96000,
    currency: "XAF",
    parcels: [
      {
        id: "p1",
        reference: "BRD-9010",
        description: "Amazon · Casque audio Sony WH-1000XM5",
        weightKg: 1.1,
        status: "expected",
        trackingNumber: "TBA987654321FR",
        carrier: "Amazon",
      },
      {
        id: "p2",
        reference: "—",
        description: "Shein · lot vêtements femme (5 pièces)",
        weightKg: 3.4,
        status: "expected",
        carrier: "Shein",
      },
    ],
    timeline: [
      { id: "t1", date: "2026-07-10T10:00:00Z", title: "Demande créée", type: "milestone" },
      { id: "t2", date: "2026-07-10T11:12:00Z", title: "Paiement confirmé", type: "success" },
    ],
  },
  {
    id: "FS-DLS-00438",
    reference: "FS-DLS-00438",
    serviceId: "delivery",
    serviceName: "Delivery",
    serviceCode: "DLS",
    status: "in_warehouse",
    createdAt: "2026-07-11T14:00:00Z",
    updatedAt: "2026-07-13T09:00:00Z",
    route: { from: "Paris CDG", to: "Pointe-Noire" },
    warehouseId: "paris-cdg",
    beneficiary: { name: "Alain N.", phone: "+242 05 771 2233" },
    contact: { name: "Alain Ngouabi", email: "alain@example.com", phone: "+33 7 11 22 33 44" },
    paymentMethod: "Mobile Money",
    paymentStatus: "paid",
    amount: 54000,
    currency: "XAF",
    parcels: [
      {
        id: "p1",
        reference: "—",
        description: "AliExpress · pièces vélo (dérailleur + chaîne)",
        weightKg: 1.2,
        status: "expected",
        carrier: "AliExpress",
      },
    ],
    timeline: [
      { id: "t1", date: "2026-07-11T14:00:00Z", title: "Demande créée", type: "milestone" },
    ],
  },
  {
    id: "FS-DLS-00440",
    reference: "FS-DLS-00440",
    serviceId: "delivery",
    serviceName: "Delivery",
    serviceCode: "DLS",
    status: "in_warehouse",
    createdAt: "2026-07-12T08:30:00Z",
    updatedAt: "2026-07-13T10:00:00Z",
    route: { from: "Paris Nord", to: "Brazzaville" },
    warehouseId: "paris-nord",
    beneficiary: { name: "Grace Loko", phone: "+242 06 445 8899" },
    contact: { name: "Marie D.", email: "marie@example.com", phone: "+33 6 78 90 12 34" },
    paymentMethod: "PayPal",
    paymentStatus: "paid",
    amount: 78000,
    currency: "XAF",
    parcels: [
      {
        id: "p1",
        reference: "BRD-9022",
        description: "Fnac · livres scolaires",
        weightKg: 5.2,
        status: "expected",
        trackingNumber: "FNC7788994455",
        carrier: "Chronopost",
      },
      {
        id: "p2",
        reference: "—",
        description: "Décathlon · maillots foot enfants",
        weightKg: 1.8,
        status: "expected",
        carrier: "Colissimo",
      },
    ],
    timeline: [
      { id: "t1", date: "2026-07-12T08:30:00Z", title: "Demande créée", type: "milestone" },
      { id: "t2", date: "2026-07-12T09:00:00Z", title: "Paiement confirmé", type: "success" },
    ],
  },
];

export function getDemand(id: string): Demand | undefined {
  return DEMANDS.find((d) => d.id === id);
}

// Runtime mutable copy pour la simulation admin (réception colis).
// Les composants qui affichent l'état "vivant" doivent utiliser getRuntimeDemands().
let RUNTIME_DEMANDS: Demand[] = JSON.parse(JSON.stringify(DEMANDS));
const listeners = new Set<() => void>();

export function getRuntimeDemands(): Demand[] {
  return RUNTIME_DEMANDS;
}

export function getRuntimeDemand(id: string): Demand | undefined {
  return RUNTIME_DEMANDS.find((d) => d.id === id);
}

export function subscribeDemands(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function receiveParcel(opts: {
  demandId: string;
  parcelId: string;
  weightKg?: number;
  trackingNumber?: string;
  actor?: string;
  warehouseLabel?: string;
  note?: string;
}) {
  const d = RUNTIME_DEMANDS.find((x) => x.id === opts.demandId);
  if (!d) return;
  const p = d.parcels.find((x) => x.id === opts.parcelId);
  if (!p) return;
  p.status = "received";
  p.receivedAt = new Date().toISOString();
  if (opts.weightKg != null) p.weightKg = opts.weightKg;
  if (opts.trackingNumber && !p.trackingNumber) p.trackingNumber = opts.trackingNumber;
  if (opts.actor) p.receivedBy = opts.actor;
  d.updatedAt = new Date().toISOString();
  const allReceived = d.parcels.every((x) => x.status !== "expected");
  if (allReceived && d.status === "in_warehouse") {
    // reste "in_warehouse", en attente d'expédition
  }
  d.timeline.push({
    id: "t" + Math.random().toString(36).slice(2, 7),
    date: p.receivedAt,
    title: `Colis ${p.reference !== "—" ? p.reference : p.description.slice(0, 24)} réceptionné`,
    description: opts.warehouseLabel
      ? `Entrepôt ${opts.warehouseLabel}${opts.note ? " · " + opts.note : ""}`
      : opts.note,
    actor: opts.actor,
    type: "success",
  });
  notify();
}


export function formatMoney(amount: number, currency = "XAF") {
  return amount.toLocaleString("fr-FR").replace(/,/g, "\u202f") + " " + currency;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Europe/Paris",
    }) +
    " · " +
    d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    })
  );
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `il y a ${d} j`;
  const mo = Math.round(d / 30);
  return `il y a ${mo} mois`;
}