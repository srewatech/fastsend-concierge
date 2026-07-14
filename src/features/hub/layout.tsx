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
    <div className="min-h-screen flex flex-col bg-muted/40 text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-foreground text-background">
        <div className="w-full px-6 py-3 flex items-center gap-6">
          <Link to="/hub" className="shrink-0">
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              FastSends
            </p>
            <p className="text-base font-bold leading-tight">Hub entrepôt</p>
          </Link>

          <nav className="hidden md:flex flex-1 min-w-0 overflow-x-auto">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => {
                const Icon = n.icon;
                const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                return (
                  <li key={n.to}>
                    <Link
                      to={n.to}
                      className={
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors " +
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

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="hidden sm:block bg-background/10 text-background text-xs rounded-md px-2 py-1.5 ring-1 ring-background/20 focus:outline-none focus:ring-primary"
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
            <Link
              to="/admin"
              title="Vue mobile scan"
              className="hidden sm:grid size-9 place-items-center rounded-lg bg-background/10 text-background/70 hover:text-background hover:bg-background/20"
            >
              <Smartphone className="size-4" />
            </Link>
            <button className="size-9 rounded-lg bg-background/10 text-background/80 grid place-items-center relative">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
            </button>
            <div className="hidden md:flex items-center gap-2 pl-2 ml-1 border-l border-background/10">
              <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
                {isAdmin ? "AD" : warehouse?.manager.initials}
              </div>
              <div className="min-w-0 max-w-[140px]">
                <p className="text-xs font-bold truncate">{actorName}</p>
                <p className="text-[10px] opacity-60 truncate">
                  {isAdmin ? "Admin plateforme" : warehouse?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb / title bar */}
      <div className="sticky top-[60px] z-30 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="w-full px-6 py-4 flex items-center gap-4">
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
          {actions}
        </div>
      </div>

      <main className="flex-1 w-full px-6 py-6">{children}</main>
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