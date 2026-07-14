export interface Warehouse {
  id: string;
  name: string;
  country: "FR" | "CG";
  city: string;
  manager: { name: string; initials: string; email: string };
}

export const WAREHOUSES: Warehouse[] = [
  {
    id: "paris-cdg",
    name: "Paris CDG",
    country: "FR",
    city: "Roissy",
    manager: { name: "Jean Mabika", initials: "JM", email: "jean@fastsends.co" },
  },
  {
    id: "paris-nord",
    name: "Paris Nord",
    country: "FR",
    city: "Saint-Denis",
    manager: { name: "Aline Bouiti", initials: "AB", email: "aline@fastsends.co" },
  },
  {
    id: "brazzaville",
    name: "Brazzaville",
    country: "CG",
    city: "Brazzaville",
    manager: { name: "Sarah Loko", initials: "SL", email: "sarah@fastsends.co" },
  },
  {
    id: "pointe-noire",
    name: "Pointe-Noire",
    country: "CG",
    city: "Pointe-Noire",
    manager: { name: "Fabrice Nzila", initials: "FN", email: "fabrice@fastsends.co" },
  },
];

export const ADMIN = {
  id: "admin",
  name: "Admin plateforme",
  initials: "AD",
  email: "admin@fastsends.co",
};

export function getWarehouse(id: string): Warehouse | undefined {
  return WAREHOUSES.find((w) => w.id === id);
}