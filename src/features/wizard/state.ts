import type { WizardState } from "./types";
import type { ServiceId } from "./types";
import { SERVICE_ID_CODES } from "./services";

export const initialWizardState: WizardState = {
  accountType: "particulier",
  step: 1,
  contact: { isOwner: true, firstName: "", email: "", phone: "" },
  serviceId: null,
  delivery: {
    mode: "warehouse_delivery",
    warehouseFrom: "",
    warehouseTo: "",
    reference: "",
    plannedDate: "",
    comments: "",
    beneficiaryName: "",
    beneficiaryPhone: "",
    parcels: [],
    parcelCount: "",
    finalDestination: "",
  },
  shopStore: {
    stores: "",
    items: [],
    basketAmount: "",
    duration: "half_day",
    shoppingDate: "",
    warehouseTo: "",
  },
  shopOnline: {
    links: [],
    basketAmount: "",
    transferMethod: "mobile_money",
    insurance: false,
    warehouseTo: "",
  },
  elite: {
    companyName: "",
    email: "",
    whatsapp: "",
    productTypes: "",
    hasSuppliers: false,
    suppliersDetails: "",
    wantsPickup: false,
    pickupAddress: "",
    parcelCount: "",
    totalWeight: "",
    storageMode: "consolidate",
    frequency: "monthly",
    customQuote: false,
    instructions: "",
  },
  pickup: {
    warehouseTo: "",
    address: "",
    contactName: "",
    contactPhone: "",
    description: "",
    wantsRedelivery: false,
  },
  freight: {
    countryFrom: "",
    countryTo: "",
    warehouseFrom: "",
    warehouseTo: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    value: "",
    description: "",
    grouping: false,
  },
  paymentMethod: "card",
  promoCode: "",
  referralCode: "",
};

export function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

// Génère un identifiant lisible de demande : FS-PUS-00042.
export function generateDemandId(serviceId: ServiceId): string {
  const code = SERVICE_ID_CODES[serviceId] ?? "GEN";
  const num = Math.floor(Math.random() * 99999) + 1;
  return `FS-${code}-${String(num).padStart(5, "0")}`;
}

// Prépare un état pré-rempli pour enchaîner sur une demande Delivery
// à partir d'un Pickup ou d'un Shop For You déjà créé.
export function chainToDelivery(prev: WizardState, parentId: string): WizardState {
  const base: WizardState = {
    ...initialWizardState,
    accountType: prev.accountType,
    contact: prev.contact,
    linkedFromId: parentId,
    linkedFromService: prev.serviceId ?? undefined,
    serviceId: "delivery",
    step: 3,
  };
  // Pré-remplir l'entrepôt de départ selon le service parent.
  if (prev.serviceId === "pickup") {
    base.delivery = {
      ...base.delivery,
      warehouseFrom: prev.pickup.warehouseTo,
      comments: `Suite au pick-up ${parentId}. ${prev.pickup.description || ""}`.trim(),
    };
  } else if (prev.serviceId === "shop_store") {
    base.delivery = {
      ...base.delivery,
      warehouseFrom: "",
      warehouseTo: prev.shopStore.warehouseTo,
      comments: `Suite au Shop For You Magasin ${parentId}.`,
    };
  } else if (prev.serviceId === "shop_online") {
    base.delivery = {
      ...base.delivery,
      warehouseFrom: "",
      warehouseTo: prev.shopOnline.warehouseTo,
      comments: `Suite au Shop For You En Ligne ${parentId}.`,
    };
  }
  return base;
}

export function estimateFor(state: WizardState): { amount: number; currency: string; note?: string } {
  const currency = "XAF";
  switch (state.serviceId) {
    case "air_freight": {
      const w = parseFloat(state.freight.weight) || 0;
      const l = parseFloat(state.freight.length) || 0;
      const wi = parseFloat(state.freight.width) || 0;
      const h = parseFloat(state.freight.height) || 0;
      const vol = (l * wi * h) / 6000;
      const billable = Math.max(w, vol);
      return {
        amount: Math.round(billable * 3500),
        currency,
        note: `Poids facturé ${billable.toFixed(1)} kg (réel ${w} kg · vol. ${vol.toFixed(1)} kg)`,
      };
    }
    case "delivery":
      return {
        amount: 0,
        currency,
        note: "Estimation après pesée en entrepôt",
      };
    case "shop_store": {
      const b = parseFloat(state.shopStore.basketAmount) || 0;
      const commission = Math.round(b * 0.12);
      const service = state.shopStore.duration === "full_day" ? 25000 : 15000;
      return { amount: commission + service, currency, note: `Commission 12% + ${state.shopStore.duration === "full_day" ? "journée" : "demi-journée"}` };
    }
    case "shop_online": {
      const b = parseFloat(state.shopOnline.basketAmount) || 0;
      const commission = Math.round(b * 0.08);
      const insurance = state.shopOnline.insurance ? Math.round(b * 0.03) : 0;
      return { amount: commission + insurance + 5000, currency, note: `Commission 8%${state.shopOnline.insurance ? " + assurance" : ""}` };
    }
    case "pickup":
      return { amount: 18000, currency, note: "Tarif pick-up standard" };
    case "elite_pro":
      return { amount: 0, currency, note: "Devis personnalisé sous 24h" };
    default:
      return { amount: 0, currency };
  }
}

export function formatMoney(amount: number, currency = "XAF") {
  return amount.toLocaleString("fr-FR").replace(/,/g, "\u202f") + " " + currency;
}