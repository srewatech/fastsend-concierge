import { useCallback, useSyncExternalStore } from "react";
import { getRuntimeDemands, subscribeDemands } from "../demands/data";

export type ValiseStatus =
  | "preparation"
  | "sealed"
  | "in_transit"
  | "arrived"
  | "controlled";

export interface Valise {
  id: string;
  code: string; // VAL-CDG-001
  warehouseFromId: string;
  warehouseToId: string;
  carrier?: string;
  flightNumber?: string;
  status: ValiseStatus;
  sealNumber?: string;
  parcelRefs: { demandId: string; parcelId: string }[];
  createdAt: string;
  sealedAt?: string;
  departedAt?: string;
  arrivedAt?: string;
  controlledAt?: string;
  note?: string;
}

export const VALISE_STATUS_META: Record<
  ValiseStatus,
  { label: string; tone: "neutral" | "info" | "warn" | "success" }
> = {
  preparation: { label: "En préparation", tone: "neutral" },
  sealed: { label: "Scellée", tone: "warn" },
  in_transit: { label: "En transit", tone: "info" },
  arrived: { label: "Arrivée", tone: "info" },
  controlled: { label: "Contrôlée", tone: "success" },
};

// Mock initial dataset — a few valises across warehouses & states.
const SEED_VALISES: Valise[] = [
  {
    id: "v1",
    code: "VAL-CDG-001",
    warehouseFromId: "paris-cdg",
    warehouseToId: "brazzaville",
    carrier: "Air France Cargo",
    flightNumber: "AF-820",
    status: "in_transit",
    sealNumber: "SEAL-778812",
    parcelRefs: [
      { demandId: "FS-DLS-00421", parcelId: "p1" },
      { demandId: "FS-DLS-00421", parcelId: "p2" },
    ],
    createdAt: "2026-07-11T09:00:00Z",
    sealedAt: "2026-07-12T15:30:00Z",
    departedAt: "2026-07-12T18:03:00Z",
  },
  {
    id: "v2",
    code: "VAL-CDG-002",
    warehouseFromId: "paris-cdg",
    warehouseToId: "pointe-noire",
    carrier: "Air France Cargo",
    status: "preparation",
    parcelRefs: [],
    createdAt: "2026-07-13T08:00:00Z",
  },
  {
    id: "v3",
    code: "VAL-NRD-014",
    warehouseFromId: "paris-nord",
    warehouseToId: "brazzaville",
    carrier: "Ethiopian Cargo",
    flightNumber: "ET-905",
    status: "sealed",
    sealNumber: "SEAL-441220",
    parcelRefs: [],
    createdAt: "2026-07-13T10:00:00Z",
    sealedAt: "2026-07-13T17:00:00Z",
  },
  {
    id: "v4",
    code: "VAL-BZV-007",
    warehouseFromId: "paris-cdg",
    warehouseToId: "brazzaville",
    carrier: "Air France Cargo",
    flightNumber: "AF-812",
    status: "arrived",
    sealNumber: "SEAL-660001",
    parcelRefs: [],
    createdAt: "2026-07-05T09:00:00Z",
    sealedAt: "2026-07-06T12:00:00Z",
    departedAt: "2026-07-06T18:00:00Z",
    arrivedAt: "2026-07-08T05:20:00Z",
  },
];

let VALISES: Valise[] = JSON.parse(JSON.stringify(SEED_VALISES));
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((f) => f());
}

export function getValises(): Valise[] {
  return VALISES;
}
export function getValise(id: string): Valise | undefined {
  return VALISES.find((v) => v.id === id);
}
export function subscribeValises(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function rid(prefix = "v") {
  return prefix + Math.random().toString(36).slice(2, 8);
}

export function createValise(opts: {
  warehouseFromId: string;
  warehouseToId: string;
  carrier?: string;
}): Valise {
  const count = VALISES.filter((v) => v.warehouseFromId === opts.warehouseFromId).length + 1;
  const prefix =
    opts.warehouseFromId === "paris-cdg"
      ? "CDG"
      : opts.warehouseFromId === "paris-nord"
        ? "NRD"
        : opts.warehouseFromId === "brazzaville"
          ? "BZV"
          : "PNR";
  const v: Valise = {
    id: rid(),
    code: `VAL-${prefix}-${String(count).padStart(3, "0")}`,
    warehouseFromId: opts.warehouseFromId,
    warehouseToId: opts.warehouseToId,
    carrier: opts.carrier,
    status: "preparation",
    parcelRefs: [],
    createdAt: new Date().toISOString(),
  };
  VALISES = [v, ...VALISES];
  notify();
  return v;
}

export function addParcelToValise(valiseId: string, ref: { demandId: string; parcelId: string }) {
  const v = VALISES.find((x) => x.id === valiseId);
  if (!v || v.status !== "preparation") return;
  if (v.parcelRefs.some((r) => r.demandId === ref.demandId && r.parcelId === ref.parcelId)) return;
  // remove from other prep valises
  for (const other of VALISES) {
    if (other.id === valiseId) continue;
    if (other.status !== "preparation") continue;
    other.parcelRefs = other.parcelRefs.filter(
      (r) => !(r.demandId === ref.demandId && r.parcelId === ref.parcelId),
    );
  }
  v.parcelRefs.push(ref);
  const demands = getRuntimeDemands();
  const d = demands.find((x) => x.id === ref.demandId);
  const p = d?.parcels.find((x) => x.id === ref.parcelId);
  if (p) p.valiseId = valiseId;
  notify();
}

export function removeParcelFromValise(valiseId: string, ref: { demandId: string; parcelId: string }) {
  const v = VALISES.find((x) => x.id === valiseId);
  if (!v || v.status !== "preparation") return;
  v.parcelRefs = v.parcelRefs.filter(
    (r) => !(r.demandId === ref.demandId && r.parcelId === ref.parcelId),
  );
  const d = getRuntimeDemands().find((x) => x.id === ref.demandId);
  const p = d?.parcels.find((x) => x.id === ref.parcelId);
  if (p && p.valiseId === valiseId) p.valiseId = undefined;
  notify();
}

export function sealValise(valiseId: string, actor?: string) {
  const v = VALISES.find((x) => x.id === valiseId);
  if (!v || v.status !== "preparation") return;
  v.status = "sealed";
  v.sealedAt = new Date().toISOString();
  v.sealNumber = "SEAL-" + Math.floor(100000 + Math.random() * 900000);
  // Add timeline events on linked demands
  const demands = getRuntimeDemands();
  for (const ref of v.parcelRefs) {
    const d = demands.find((x) => x.id === ref.demandId);
    if (!d) continue;
    d.timeline.push({
      id: "t" + Math.random().toString(36).slice(2, 7),
      date: v.sealedAt!,
      title: `Colis chargé dans la valise ${v.code}`,
      description: `Scellé ${v.sealNumber}`,
      actor,
      type: "info",
    });
    d.updatedAt = v.sealedAt!;
  }
  notify();
}

export function markDeparted(valiseId: string, opts: { flightNumber?: string; carrier?: string; actor?: string }) {
  const v = VALISES.find((x) => x.id === valiseId);
  if (!v || (v.status !== "sealed" && v.status !== "preparation")) return;
  if (opts.flightNumber) v.flightNumber = opts.flightNumber;
  if (opts.carrier) v.carrier = opts.carrier;
  v.status = "in_transit";
  v.departedAt = new Date().toISOString();
  const demands = getRuntimeDemands();
  for (const ref of v.parcelRefs) {
    const d = demands.find((x) => x.id === ref.demandId);
    const p = d?.parcels.find((x) => x.id === ref.parcelId);
    if (p) p.status = "shipped";
    if (d) {
      d.status = "in_transit";
      d.timeline.push({
        id: "t" + Math.random().toString(36).slice(2, 7),
        date: v.departedAt!,
        title: `Départ ${v.code}${v.flightNumber ? " · " + v.flightNumber : ""}`,
        actor: opts.actor,
        type: "info",
      });
      d.updatedAt = v.departedAt!;
    }
  }
  notify();
}

export function markArrived(valiseId: string, actor?: string) {
  const v = VALISES.find((x) => x.id === valiseId);
  if (!v || v.status !== "in_transit") return;
  v.status = "arrived";
  v.arrivedAt = new Date().toISOString();
  notify();
}

export function controlValise(
  valiseId: string,
  checks: Record<string, "ok" | "missing" | "damaged">,
  actor?: string,
) {
  const v = VALISES.find((x) => x.id === valiseId);
  if (!v || v.status !== "arrived") return;
  v.status = "controlled";
  v.controlledAt = new Date().toISOString();
  const demands = getRuntimeDemands();
  for (const ref of v.parcelRefs) {
    const d = demands.find((x) => x.id === ref.demandId);
    const p = d?.parcels.find((x) => x.id === ref.parcelId);
    if (!d || !p) continue;
    const key = ref.demandId + ":" + ref.parcelId;
    const state = checks[key] ?? "ok";
    p.arrivalCheck = state;
    if (state === "ok") {
      p.status = "delivered";
    } else {
      p.status = "issue";
    }
    d.timeline.push({
      id: "t" + Math.random().toString(36).slice(2, 7),
      date: v.controlledAt!,
      title:
        state === "ok"
          ? `Colis contrôlé à l'arrivée`
          : state === "missing"
            ? `Colis manquant à l'arrivée`
            : `Colis abîmé à l'arrivée`,
      description: `Valise ${v.code}`,
      actor,
      type: state === "ok" ? "success" : "warning",
    });
    d.updatedAt = v.controlledAt!;
  }
  notify();
}

export function markParcelsPaid(refs: { demandId: string; parcelId: string }[]) {
  const demands = getRuntimeDemands();
  for (const ref of refs) {
    const d = demands.find((x) => x.id === ref.demandId);
    const p = d?.parcels.find((x) => x.id === ref.parcelId);
    if (p) p.paymentStatus = "paid";
  }
  notify();
}

export function useValises(): Valise[] {
  const sub = useCallback((fn: () => void) => {
    const a = subscribeValises(fn);
    const b = subscribeDemands(fn);
    return () => {
      a();
      b();
    };
  }, []);
  const get = useCallback(() => getValises(), []);
  return useSyncExternalStore(sub, get, get);
}