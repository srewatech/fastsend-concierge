import type { ServiceDefinition } from "./types";

export const SERVICES: ServiceDefinition[] = [
  {
    id: "delivery",
    code: "DELIV",
    name: "Delivery",
    tagline: "Livrer ou déposer un colis",
    description: "Nous récupérons ou recevons votre colis puis l'expédions vers sa destination.",
    audience: ["particulier", "entreprise"],
  },
  {
    id: "shop_store",
    code: "SHOP-M",
    name: "Shop For You — Magasin",
    tagline: "Nous achetons en magasin",
    description: "Notre équipe se déplace dans les magasins pour acheter vos articles.",
    audience: ["particulier", "entreprise"],
  },
  {
    id: "shop_online",
    code: "SHOP-W",
    name: "Shop For You — En Ligne",
    tagline: "Achats en ligne pour vous",
    description: "Envoyez-nous vos liens : nous commandons puis expédions.",
    audience: ["particulier", "entreprise"],
  },
  {
    id: "pickup",
    code: "PICK",
    name: "Pick-up",
    tagline: "Enlèvement à domicile",
    description: "Nous récupérons votre colis à l'adresse de votre choix.",
    audience: ["particulier", "entreprise"],
  },
  {
    id: "air_freight",
    code: "FRET",
    name: "Fret Aérien",
    tagline: "Expédition rapide par avion",
    description: "Fret express pour colis et marchandises urgentes.",
    audience: ["particulier", "entreprise"],
  },
  {
    id: "elite_pro",
    code: "ELITE",
    name: "Elite Service Pro",
    tagline: "Solution B2B complète",
    badge: "B2B",
    description: "Accompagnement complet : fournisseurs, stockage, regroupement.",
    audience: ["entreprise"],
  },
];

export const WAREHOUSES_FR = [
  { id: "paris-cdg", label: "Paris CDG" },
  { id: "paris-nord", label: "Paris Nord" },
  { id: "marseille", label: "Marseille" },
  { id: "lyon", label: "Lyon" },
];

export const WAREHOUSES_CG = [
  { id: "brazzaville", label: "Brazzaville" },
  { id: "pointe-noire", label: "Pointe-Noire" },
  { id: "dolisie", label: "Dolisie" },
];

export const COUNTRIES = [
  { id: "FR", label: "France" },
  { id: "CG", label: "Congo" },
  { id: "BE", label: "Belgique" },
  { id: "CD", label: "RD Congo" },
];

export const PAYMENT_METHODS: { id: import("./types").PaymentMethod; label: string }[] = [
  { id: "mobile_money", label: "Mobile Money" },
  { id: "card", label: "Carte bancaire" },
  { id: "western_union", label: "Western Union" },
  { id: "paypal", label: "PayPal" },
  { id: "cash", label: "Espèces (à l'entrepôt)" },
];

export function warehousesFor(countryId: string) {
  if (countryId === "CG") return WAREHOUSES_CG;
  if (countryId === "FR") return WAREHOUSES_FR;
  return [];
}