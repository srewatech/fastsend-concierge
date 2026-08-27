import type { ServiceId } from "@/features/wizard/types";

/** Grille tarifaire indicative, utilisée par la section tarifs et le simulateur. */
export interface Corridor {
  id: string;
  from: string;
  to: string;
  /** Prix au kilo en euros (fret standard). */
  pricePerKg: number;
  /** Délai indicatif en jours. */
  leadTime: string;
  /** Forfait de traitement (dossier, manutention). */
  handling: number;
}

export const CORRIDORS: Corridor[] = [
  { id: "fr-cg", from: "France", to: "Congo — Brazzaville", pricePerKg: 9.5, leadTime: "5 à 8 j", handling: 12 },
  { id: "fr-pnr", from: "France", to: "Congo — Pointe-Noire", pricePerKg: 10.2, leadTime: "6 à 9 j", handling: 12 },
  { id: "fr-cd", from: "France", to: "RD Congo — Kinshasa", pricePerKg: 11.4, leadTime: "7 à 10 j", handling: 15 },
  { id: "be-cg", from: "Belgique", to: "Congo — Brazzaville", pricePerKg: 10.8, leadTime: "6 à 9 j", handling: 14 },
];

/** Suppléments proposés dans le simulateur. */
export const OPTIONS = [
  { id: "pickup", label: "Enlèvement à domicile", price: 15, hint: "Un coursier passe chez vous" },
  { id: "insurance", label: "Assurance valeur déclarée", price: 8, hint: "Jusqu'à 500 € couverts" },
  { id: "packing", label: "Remballage renforcé", price: 6, hint: "Carton double cannelure" },
] as const;

export type OptionId = (typeof OPTIONS)[number]["id"];

/** Volume facturé : max(poids réel, poids volumétrique). */
export function volumetricWeight(l: number, w: number, h: number) {
  if (!l || !w || !h) return 0;
  return (l * w * h) / 6000;
}

export interface Offer {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  serviceId: ServiceId;
}

export const OFFERS: Offer[] = [
  {
    id: "premier-envoi",
    eyebrow: "Nouveau client",
    title: "−15 % sur le premier envoi",
    body: "Code PREMIER15 à saisir à l'étape paiement, valable sur tous les corridors France → Congo.",
    serviceId: "delivery",
  },
  {
    id: "groupage",
    eyebrow: "Groupage",
    title: "Mutualisez, payez moins",
    body: "À partir de 30 kg regroupés dans la même valise, le kilo tombe à 7,90 €.",
    serviceId: "air_freight",
  },
  {
    id: "shopping",
    eyebrow: "Shop For You",
    title: "Achats en boutique inclus",
    body: "Frais de shopping offerts pour toute commande supérieure à 300 € de panier.",
    serviceId: "shop_store",
  },
  {
    id: "b2b",
    eyebrow: "Entreprises",
    title: "Compte Elite Pro",
    body: "Stockage 30 jours offert, facturation mensuelle et un interlocuteur dédié.",
    serviceId: "elite_pro",
  },
];

export const PROCESS = [
  { n: "01", title: "Vous déposez la demande", body: "Six étapes guidées, aucun jargon logistique." },
  { n: "02", title: "Nous récupérons le colis", body: "Enlèvement à domicile ou dépôt dans l'un de nos entrepôts." },
  { n: "03", title: "Pesée et confirmation", body: "Un agent pèse, contrôle et confirme le montant final." },
  { n: "04", title: "Expédition et suivi", body: "Numéro de demande, statut colis par colis, jusqu'à la remise." },
];

export const PROOF = [
  { value: "4 200+", label: "colis expédiés en 2025" },
  { value: "7", label: "entrepôts France · Congo" },
  { value: "6,4 j", label: "délai moyen porte à porte" },
  { value: "98,2 %", label: "colis livrés sans incident" },
];

export const TESTIMONIALS = [
  {
    quote:
      "J'envoie chaque mois des pièces détachées à Pointe-Noire. Je sais exactement quel carton est parti et lequel attend en entrepôt.",
    name: "Armand N.",
    role: "Garage automobile, Marseille",
  },
  {
    quote:
      "Le Shop For You nous évite deux allers-retours par trimestre. L'équipe achète, regroupe et expédie sans qu'on ait à suivre.",
    name: "Clarisse M.",
    role: "Boutique prêt-à-porter, Brazzaville",
  },
  {
    quote: "Facturation mensuelle et un seul contact. Pour une PME, c'est ce qui change tout.",
    name: "Didier K.",
    role: "Importateur, Lyon",
  },
];

/* ------------------------- Accès rapides (landing) ------------------------ */

export interface AccessCard {
  id: string;
  title: string;
  body: string;
  cta: string;
  serviceId: ServiceId;
}

export const ACCESS_CARDS: AccessCard[] = [
  {
    id: "acheter",
    title: "Acheter en Europe",
    body: "Vous voulez un produit vu sur Amazon, Shein, une boutique de Paris ou de Bruxelles ? Nous achetons pour vous.",
    cta: "Commander un achat",
    serviceId: "shop_online",
  },
  {
    id: "envoyer",
    title: "Envoyer un colis",
    body: "Déposez ou faites enlever votre colis en France et en Belgique, nous l'acheminons jusqu'au Congo.",
    cta: "Envoyer un colis",
    serviceId: "delivery",
  },
  {
    id: "retirer",
    title: "Faire enlever un colis",
    body: "Un coursier passe à l'adresse de votre choix, récupère le carton et le dépose à l'entrepôt.",
    cta: "Demander un enlèvement",
    serviceId: "pickup",
  },
];

export const SECONDARY_ACCESS = [
  { id: "groupage", title: "Groupage 30 kg+", body: "Mutualisez vos envois, le kilo baisse." },
  { id: "fret", title: "Fret aérien express", body: "Départ prioritaire sous 48 h." },
  { id: "pro", title: "Compte Elite Pro", body: "Facturation mensuelle pour les entreprises." },
  { id: "parrainage", title: "Programme de parrainage", body: "Un code, une remise pour vous deux." },
];

/* ---------------------------------- Équipe -------------------------------- */

export const TEAM_POINTS = [
  "Un interlocuteur nommé sur chaque demande, joignable par téléphone.",
  "Des agents en entrepôt à Paris, Bruxelles, Brazzaville et Pointe-Noire.",
  "Un contrôle photo à la réception et à la remise de chaque carton.",
];

/* ----------------------------------- Avis --------------------------------- */

export const REVIEW_SCORE = { score: "4,8", count: 286, source: "Avis clients vérifiés" };

/* -------------------------- Tarifs : modes détaillés ---------------------- */

export interface TarifMode {
  id: "standard" | "express";
  label: string;
  hint: string;
  /** Multiplicateur appliqué au prix au kilo du corridor. */
  factor: number;
  /** Délai indicatif appliqué. */
  speed: string;
  minWeight: string;
  includes: string[];
}

export const TARIF_MODES: TarifMode[] = [
  {
    id: "standard",
    label: "Groupage standard",
    hint: "Départ hebdomadaire, le meilleur rapport prix / délai.",
    factor: 1,
    speed: "délai grille",
    minWeight: "1 kg",
    includes: ["Suivi carton par carton", "Stockage 7 jours offert", "Remise en entrepôt destination"],
  },
  {
    id: "express",
    label: "Fret aérien express",
    hint: "Départ prioritaire sur le premier vol disponible.",
    factor: 1.45,
    speed: "48 à 72 h",
    minWeight: "0,5 kg",
    includes: ["Départ prioritaire", "Assurance incluse jusqu'à 300 €", "Livraison à domicile possible"],
  },
];
