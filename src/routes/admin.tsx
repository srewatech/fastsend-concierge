import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, ScanLine, Package, ClipboardList, User } from "lucide-react";
import { AdminSessionProvider } from "@/features/admin/session";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "FastSends Ops · App manager" },
      { name: "description", content: "Application mobile de réception colis pour managers d'entrepôt FastSends." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminSessionProvider>
      <div className="min-h-screen bg-muted/50 py-6 sm:py-10 px-3">
        <PhoneFrame>
          <Outlet />
          <TabBar />
        </PhoneFrame>
      </div>
    </AdminSessionProvider>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="relative bg-background rounded-[38px] ring-1 ring-border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 h-6 w-32 bg-foreground rounded-b-2xl" />
        <div className="relative h-[780px] overflow-y-auto scrollbar-none">
          {children}
        </div>
      </div>
      <p className="text-center mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Simulation · App manager FastSends
      </p>
    </div>
  );
}

const TABS = [
  { to: "/admin", label: "Accueil", icon: Home, exact: true },
  { to: "/admin/parcels", label: "Colis", icon: Package },
  { to: "/admin/scan", label: "Scan", icon: ScanLine, primary: true },
  { to: "/admin/demandes", label: "Demandes", icon: ClipboardList },
  { to: "/admin/profile", label: "Profil", icon: User },
] as const;

function TabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border">
      <ul className="grid grid-cols-5 items-end px-2 pt-2 pb-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          if (t.primary) {
            return (
              <li key={t.to} className="flex justify-center">
                <Link
                  to={t.to}
                  className="-mt-8 size-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg ring-4 ring-background active:scale-95 transition-all"
                >
                  <Icon className="size-6" strokeWidth={2.5} />
                </Link>
              </li>
            );
          }
          return (
            <li key={t.to} className="flex justify-center">
              <Link
                to={t.to}
                className={
                  "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors " +
                  (active ? "text-foreground" : "text-muted-foreground")
                }
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}