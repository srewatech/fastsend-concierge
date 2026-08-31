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

/* ------------------------- Pourquoi nous choisir -------------------------- */

export interface WhyPoint {
  icon: "clock" | "shield" | "heart" | "pin";
  title: string;
  body: string;
}

export const WHY_US: WhyPoint[] = [
  {
    icon: "clock",
    title: "Vous gagnez du temps",
    body: "Une demande en ligne suffit, nous prenons le relais de bout en bout.",
  },
  {
    icon: "shield",
    title: "Vous évitez les démarches complexes",
    body: "Paiement, réception, expédition : tout est pris en charge.",
  },
  {
    icon: "heart",
    title: "Un accompagnement humain",
    body: "Une équipe joignable avant, pendant et après votre envoi.",
  },
  {
    icon: "pin",
    title: "Un suivi jusqu'à destination",
    body: "Vous savez où en est votre colis à chaque étape du trajet.",
  },
];

/* --------------------------- Comment ça marche ---------------------------- */

export interface JourneyPhase {
  id: string;
  step: string;
  title: string;
  lead: string;
  actor: "Vous" | "FastSends" | "Entrepôt";
  points: string[];
  note?: string;
}

/** Le flux réel : une seule demande, cinq phases, du formulaire au retrait. */
export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    id: "demande",
    step: "01",
    title: "Vous créez votre demande",
    lead: "Un seul formulaire, quel que soit le service choisi.",
    actor: "Vous",
    points: [
      "Vos coordonnées, puis le service : envoi, achat, enlèvement ou fret.",
      "Le formulaire s'adapte : entrepôt de dépôt, destination, nombre de colis, liens produits.",
      "Un identifiant unique est généré (ex. FS-DLS-00147) et vos bordereaux sont prêts à imprimer.",
    ],
    note: "Aucun prix n'est figé à cette étape : le tarif dépend de la pesée réelle.",
  },
  {
    id: "prise-en-charge",
    step: "02",
    title: "Le colis arrive chez nous",
    lead: "Dépôt en agence, enlèvement à domicile ou achat effectué par nos soins.",
    actor: "Vous",
    points: [
      "Vous déposez vos colis avec le bordereau collé dessus.",
      "Ou nous passons le récupérer à l'adresse indiquée lors du Pick-up.",
      "Pour un Shop For You, notre équipe achète et fait livrer à l'entrepôt.",
    ],
  },
  {
    id: "reception",
    step: "03",
    title: "Réception et pesée en entrepôt",
    lead: "Chaque colis est scanné, rattaché à votre demande, pesé et contrôlé.",
    actor: "Entrepôt",
    points: [
      "Le bordereau est scanné : le colis est associé automatiquement à votre dossier.",
      "Sans bordereau, l'agent retrouve la demande par nom, téléphone ou transporteur.",
      "Poids réel, dimensions et état sont enregistrés, photos à l'appui.",
    ],
    note: "Votre suivi passe de « attendu » à « reçu en entrepôt » en temps réel.",
  },
  {
    id: "facturation",
    step: "04",
    title: "Facture après pesée, puis paiement",
    lead: "Le prix au kilo annoncé est appliqué au poids constaté.",
    actor: "FastSends",
    points: [
      "Vous recevez le montant exact, ligne par ligne, sans frais surprise.",
      "Paiement au choix : lien carte, Mobile Money, USSD, PayPal, transfert ou espèces.",
      "Codes promo et parrainage sont déduits avant validation.",
    ],
  },
  {
    id: "expedition",
    step: "05",
    title: "Groupage, départ et retrait",
    lead: "Vos colis partent en valise scellée sur le prochain vol.",
    actor: "Entrepôt",
    points: [
      "Groupage en valise, scellé numéroté, départ enregistré avec le vol.",
      "Contrôle à l'arrivée : chaque colis est pointé avant mise à disposition.",
      "Le destinataire est prévenu et retire en agence, ou nous livrons.",
    ],
    note: "Chaque étape est horodatée dans la timeline de votre demande.",
  },
];

export interface ProcessTrack {
  id: string;
  title: string;
  steps: { title: string; body: string }[];
}


export const PROCESS_TRACKS: ProcessTrack[] = [
  {
    id: "acheter",
    title: "Pour acheter un produit",
    steps: [
      { title: "Envoyez le lien", body: "Collez l'adresse du produit qui vous intéresse." },
      { title: "Recevez votre devis", body: "Notre équipe vous communique une estimation." },
      { title: "Nous achetons", body: "Le produit est commandé et réceptionné en France." },
      { title: "Vous recevez", body: "Votre commande est acheminée jusqu'au Congo." },
    ],
  },
  {
    id: "envoyer",
    title: "Pour envoyer un colis entre la France et le Congo",
    steps: [
      { title: "Préparez votre colis", body: "Emballez soigneusement son contenu." },
      { title: "Déposez-le en agence", body: "En France ou faites-le enlever à domicile." },
      { title: "Nous expédions", body: "Express ou standard, selon votre choix." },
      { title: "Le destinataire retire", body: "Il est prévenu dès l'arrivée du colis." },
    ],
  },
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

export type FaqItem = { q: string; a: string };

export const FAQ: FaqItem[] = [
  {
    q: "Comment est calculé le prix de mon envoi ?",
    a: "Le tarif est établi après la pesée réelle en entrepôt. Nous comparons le poids réel et le poids volumétrique (L × l × H / 5000) et retenons le plus élevé. Vous recevez la facture avant l'expédition, jamais avant la pesée.",
  },
  {
    q: "Quand dois-je payer ?",
    a: "Après réception de la facture post-pesée. Vous réglez par carte (lien sécurisé), USSD Momo, Mobile Money, PayPal, transfert Western Union / Ria / MoneyGram, ou en espèces en agence.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Le groupage standard part chaque semaine selon la grille de délais du corridor. Le fret aérien express part sur le premier vol disponible, généralement sous 48 à 72 h.",
  },
  {
    q: "Puis-je suivre mes colis ?",
    a: "Oui. Chaque demande reçoit un identifiant FS-XXX-00000 et chaque colis un bordereau. La timeline de suivi se met à jour à chaque étape : prise en charge, réception, pesée, départ, arrivée, remise.",
  },
  {
    q: "Que faites-vous si je n'ai pas mon numéro de suivi ?",
    a: "Nos entrepôts rapprochent le colis par nom, poids et transporteur au moment de la réception. Il suffit que le nom du bénéficiaire soit lisible sur le carton.",
  },
  {
    q: "Vous achetez pour moi en magasin ou en ligne ?",
    a: "Oui, avec les services Shop For You Magasin et Shop For You En ligne. Vous transmettez le lien ou la description, nous validons le montant avec vous, puis le colis rejoint votre envoi.",
  },
  {
    q: "Quels objets sont interdits ?",
    a: "Produits inflammables, batteries non conformes, liquides sous pression, stupéfiants, armes, espèces et biens contrefaits. En cas de doute, contactez-nous avant le dépôt.",
  },
  {
    q: "Proposez-vous des tarifs entreprise ?",
    a: "Oui, via Elite Service Pro : volumes récurrents, facturation mensuelle, interlocuteur dédié et enlèvements planifiés.",
  },
];
