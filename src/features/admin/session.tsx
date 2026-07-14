import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { WAREHOUSES, ADMIN, type Warehouse } from "./mock";
import { getRuntimeDemands, subscribeDemands, type Demand } from "../demands/data";

interface AdminSession {
  warehouseId: string; // "all" pour l'admin plateforme
  setWarehouseId: (id: string) => void;
  warehouse: Warehouse | null; // null si "all"
  isAdmin: boolean;
  actorName: string;
}

const Ctx = createContext<AdminSession | null>(null);
const STORAGE_KEY = "fs.admin.warehouseId";

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [warehouseId, setWarehouseId] = useState<string>("paris-cdg");

  // Hydrate from localStorage post-mount (avoid SSR mismatch)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setWarehouseId(stored);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, warehouseId);
    } catch {
      /* noop */
    }
  }, [warehouseId]);

  const value = useMemo<AdminSession>(() => {
    const warehouse = WAREHOUSES.find((w) => w.id === warehouseId) ?? null;
    const isAdmin = warehouseId === "all";
    return {
      warehouseId,
      setWarehouseId,
      warehouse,
      isAdmin,
      actorName: isAdmin ? ADMIN.name : (warehouse?.manager.name ?? "Manager"),
    };
  }, [warehouseId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminSession(): AdminSession {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminSession must be used within AdminSessionProvider");
  return v;
}

// Live demands (with runtime mutations from receiveParcel)
export function useLiveDemands(): Demand[] {
  const subscribe = useCallback((fn: () => void) => subscribeDemands(fn), []);
  const get = useCallback(() => getRuntimeDemands(), []);
  // getServerSnapshot returns the same base array (mutations are client-only)
  return useSyncExternalStore(subscribe, get, get);
}

// Filter demands relevant to the current warehouse (delivery only for now).
export function useWarehouseDemands(): Demand[] {
  const { warehouseId, isAdmin } = useAdminSession();
  const all = useLiveDemands();
  return useMemo(() => {
    return all.filter((d) => {
      if (d.serviceId !== "delivery") return false;
      if (isAdmin) return true;
      return d.warehouseId === warehouseId;
    });
  }, [all, warehouseId, isAdmin]);
}