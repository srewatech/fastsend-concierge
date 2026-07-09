export type ServiceId =
  | "delivery"
  | "shop_store"
  | "shop_online"
  | "elite_pro"
  | "pickup"
  | "air_freight";

export type AccountType = "particulier" | "entreprise";

export interface ServiceDefinition {
  id: ServiceId;
  name: string;
  tagline: string;
  description: string;
  audience: AccountType[];
  badge?: string;
  code: string;
}

export interface ContactInfo {
  isOwner: boolean;
  firstName: string;
  email: string;
  phone: string;
}

export interface Parcel {
  id: string;
  reference: string;
  description: string;
}

export interface ProductLink {
  id: string;
  url: string;
  quantity: number;
  note: string;
  estimatedPrice: string;
}

export interface ShopItem {
  id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  note: string;
}

export type DeliveryMode = "warehouse_delivery" | "self_drop";
export type ShoppingDuration = "half_day" | "full_day";
export type StorageMode = "consolidate" | "immediate";
export type Frequency = "weekly" | "biweekly" | "monthly" | "one_off";
export type PaymentMethod =
  | "card"
  | "momo_ussd"
  | "mobile_money"
  | "paypal"
  | "cash_transfer"
  | "cash";

export interface WizardState {
  accountType: AccountType;
  step: number;
  contact: ContactInfo;
  serviceId: ServiceId | null;
  // Delivery
  delivery: {
    mode: DeliveryMode;
    warehouseFrom: string;
    warehouseTo: string;
    reference: string;
    plannedDate: string;
    comments: string;
    beneficiaryName: string;
    beneficiaryPhone: string;
    parcels: Parcel[];
    parcelCount: string;
    finalDestination: string;
  };
  // Shop for you - store
  shopStore: {
    stores: string;
    items: ShopItem[];
    basketAmount: string;
    duration: ShoppingDuration;
    shoppingDate: string;
    warehouseTo: string;
  };
  // Shop for you - online
  shopOnline: {
    links: ProductLink[];
    basketAmount: string;
    transferMethod: PaymentMethod;
    insurance: boolean;
    warehouseTo: string;
  };
  // Elite Pro
  elite: {
    companyName: string;
    email: string;
    whatsapp: string;
    productTypes: string;
    hasSuppliers: boolean;
    suppliersDetails: string;
    wantsPickup: boolean;
    pickupAddress: string;
    parcelCount: string;
    totalWeight: string;
    storageMode: StorageMode;
    frequency: Frequency;
    customQuote: boolean;
    instructions: string;
  };
  // Pickup
  pickup: {
    countryFrom: string;
    countryTo: string;
    warehouseFrom: string;
    warehouseTo: string;
    address: string;
    contactName: string;
    contactPhone: string;
    plannedDate: string;
    plannedTime: string;
    description: string;
    finalDestination: string;
  };
  // Air freight
  freight: {
    countryFrom: string;
    countryTo: string;
    warehouseFrom: string;
    warehouseTo: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    value: string;
    description: string;
    grouping: boolean;
  };
  // Common
  paymentMethod: PaymentMethod;
  promoCode: string;
  referralCode: string;
}