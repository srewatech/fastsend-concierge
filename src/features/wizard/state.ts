import type { WizardState } from "./types";

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
    countryFrom: "",
    countryTo: "",
    warehouseFrom: "",
    warehouseTo: "",
    address: "",
    contactName: "",
    contactPhone: "",
    plannedDate: "",
    plannedTime: "",
    description: "",
    finalDestination: "",
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
  paymentMethod: "mobile_money",
  promoCode: "",
};

export function makeId() {
  return Math.random().toString(36).slice(2, 10);
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
    case "delivery": {
      const count = Math.max(1, state.delivery.parcels.length);
      return { amount: count * 12000, currency, note: `${count} colis · tarif indicatif` };
    }
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