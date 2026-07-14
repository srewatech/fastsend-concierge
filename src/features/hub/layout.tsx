import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import {
  LayoutDashboard,
  PackageSearch,
  Package,
  Briefcase,
  Plane,
  Warehouse,
  Search,
  Bell,
  Smartphone,
} from "lucide-react";
import { useAdminSession } from "@/features/admin/session";
import { WAREHOUSES } from "@/features/admin/mock";

type NavItem = {
  to:
    | "/hub"
    | "/hub/reception"
    | "/hub/parcels"
    | "/hub/valises"
    | "/hub/departs"
    | "/hub/arrivees";
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/hub", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/hub/reception", label: "Réception", icon: PackageSearch },
  { to: "/hub/parcels", label: "Colis reçus", icon: Package },
  { to: "/hub/valises", label: "Valises", icon: Briefcase },
  { to: "/hub/departs", label: "Chargement · Départ", icon: Plane },
  { to: "/hub/arrivees", label: "Arrivée · Contrôle", icon: Warehouse },
];

export function HubShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { warehouseId, setWarehouseId, isAdmin, warehouse, actorName } = useAdminSession();

  return (
    <div className="min-h-screen flex bg-muted/40 text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col bg-foreground text-background sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-background/10">
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
            FastSends
          </p>
          <p className="text-lg font-bold">Hub entrepôt</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
                      (active
                        ? "bg-primary text-primary-foreground"
                        : "text-background/70 hover:text-background hover:bg-background/10")
                    }
                  >
                    <Icon className="size-4" />
                    <span>{n.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-background/10 p-3 space-y-2">
          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
              Entrepôt
            </span>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="mt-1 w-full bg-background/10 text-background text-sm rounded-md px-2 py-1.5 ring-1 ring-background/20 focus:outline-none focus:ring-primary"
            >
              {WAREHOUSES.map((w) => (
                <option key={w.id} value={w.id} className="text-foreground">
                  {w.name}
                </option>
              ))}
              <option value="all" className="text-foreground">
                Tous les entrepôts
              </option>
            </select>
          </label>
          <Link
            to="/admin"
            className="w-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-background/60 hover:text-background px-2 py-1"
          >
            <Smartphone className="size-3.5" /> Vue mobile scan
          </Link>
          <div className="flex items-center gap-2 px-2 pt-2">
            <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
              {isAdmin ? "AD" : warehouse?.manager.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{actorName}</p>
              <p className="text-[10px] opacity-60 truncate">
                {isAdmin ? "Admin plateforme" : warehouse?.name}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {isAdmin ? "Tous les entrepôts" : (warehouse?.name ?? "Entrepôt")}
              </p>
              <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
              {subtitle ? (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              ) : null}
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-72">
              <Search className="size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher demande, tracking, client…"
                className="bg-transparent focus:outline-none text-sm w-full"
              />
            </div>
            <button className="size-9 rounded-lg bg-muted grid place-items-center relative">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
            </button>
            {actions}
          </div>
        </header>

        <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

// Small primitives ---------------------------------------------------------

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "neutral" | "warn" | "info" | "success" | "danger";
}) {
  const toneCls =
    tone === "warn"
      ? "text-amber-700"
      : tone === "success"
        ? "text-emerald-700"
        : tone === "danger"
          ? "text-destructive"
          : tone === "info"
            ? "text-primary"
            : "text-foreground";
  return (
    <div className="bg-card ring-1 ring-border rounded-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={"font-mono text-3xl font-bold mt-1 " + toneCls}>{value}</p>
      {hint ? <p className="text-[11px] text-muted-foreground mt-1">{hint}</p> : null}
    </div>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "warn" | "info" | "success" | "danger";
}) {
  const cls =
    tone === "warn"
      ? "bg-amber-100 text-amber-800 ring-amber-200"
      : tone === "success"
        ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
        : tone === "danger"
          ? "bg-destructive/10 text-destructive ring-destructive/20"
          : tone === "info"
            ? "bg-primary/10 text-primary ring-primary/20"
            : "bg-muted text-muted-foreground ring-border";
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full ring-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
        cls
      }
    >
      {label}
    </span>
  );
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-card ring-1 ring-border rounded-xl">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}