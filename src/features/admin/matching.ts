import type { Demand, DemandParcel } from "../demands/data";

export interface OcrResult {
  recipientName: string;
  trackingNumber?: string;
  weightKg?: number;
  carrier?: string;
  date?: string;
  keywords?: string[];
}

export interface Candidate {
  demand: Demand;
  parcel: DemandParcel;
  score: number; // 0-100
  reasons: string[];
}

// Deux scénarios de simulation pour la maquette.
export const SCAN_SCENARIOS = {
  withTracking: (): OcrResult => ({
    recipientName: "Alain Ngouabi",
    trackingNumber: "TBA987654321FR",
    weightKg: 1.1,
    carrier: "Amazon Logistics",
    date: new Date().toISOString(),
    keywords: ["casque", "sony", "audio"],
  }),
  withoutTracking: (): OcrResult => ({
    recipientName: "Alain Ngouabi",
    weightKg: 1.3,
    carrier: "AliExpress",
    date: new Date().toISOString(),
    keywords: ["velo", "pieces", "derailleur"],
  }),
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function nameSimilarity(a: string, b: string): number {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const setA = new Set(na.split(/\s+/));
  const setB = new Set(nb.split(/\s+/));
  const inter = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return inter / union;
}

export function scoreParcel(
  ocr: OcrResult,
  demand: Demand,
  parcel: DemandParcel,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (ocr.trackingNumber && parcel.trackingNumber) {
    if (ocr.trackingNumber === parcel.trackingNumber) {
      score += 60;
      reasons.push("Numéro de suivi identique");
    }
  }

  const contactName = demand.contact?.name ?? "";
  const benefName = demand.beneficiary?.name ?? "";
  const bestName = Math.max(
    nameSimilarity(ocr.recipientName, contactName),
    nameSimilarity(ocr.recipientName, benefName),
  );
  if (bestName >= 0.99) {
    score += 25;
    reasons.push("Nom identique au demandeur");
  } else if (bestName >= 0.5) {
    score += 15;
    reasons.push("Nom partiellement similaire");
  } else if (bestName > 0) {
    score += 5;
  }

  if (ocr.weightKg != null && parcel.weightKg != null) {
    const diff = Math.abs(ocr.weightKg - parcel.weightKg);
    if (diff <= 0.5) {
      score += 10;
      reasons.push(`Poids proche (${parcel.weightKg} kg)`);
    } else if (diff <= 1.5) {
      score += 4;
    }
  }

  if (ocr.carrier && parcel.carrier) {
    if (norm(ocr.carrier) === norm(parcel.carrier)) {
      score += 8;
      reasons.push(`Transporteur ${parcel.carrier}`);
    } else if (norm(parcel.carrier).includes(norm(ocr.carrier))) {
      score += 4;
    }
  }

  const desc = norm(parcel.description);
  const kw = ocr.keywords ?? [];
  const hits = kw.filter((k) => desc.includes(norm(k))).length;
  if (hits > 0) {
    score += Math.min(10, hits * 4);
    reasons.push(`Description : ${hits} mot${hits > 1 ? "s" : ""} en commun`);
  }

  // Petit bonus fraicheur (< 30 j)
  const ageDays = (Date.now() - new Date(demand.createdAt).getTime()) / 86400000;
  if (ageDays < 30) {
    score += 3;
  }

  return { score: Math.min(100, Math.round(score)), reasons };
}

export function findCandidates(
  ocr: OcrResult,
  demands: Demand[],
  opts: { warehouseId?: string } = {},
): Candidate[] {
  const pool = demands.filter((d) => {
    if (d.serviceId !== "delivery") return false;
    if (opts.warehouseId && d.warehouseId !== opts.warehouseId) return false;
    // Colis pas encore réceptionnés uniquement
    return d.parcels.some((p) => p.status === "expected");
  });

  const candidates: Candidate[] = [];
  for (const d of pool) {
    for (const p of d.parcels) {
      if (p.status !== "expected") continue;
      const { score, reasons } = scoreParcel(ocr, d, p);
      if (score > 0) candidates.push({ demand: d, parcel: p, score, reasons });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

export function classifyMatch(candidates: Candidate[]): "certain" | "candidates" | "none" {
  if (candidates.length === 0) return "none";
  if (candidates[0].score >= 80) return "certain";
  if (candidates[0].score >= 40) return "candidates";
  return "none";
}