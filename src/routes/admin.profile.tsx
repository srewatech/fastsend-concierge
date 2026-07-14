import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, MapPin, Building2 } from "lucide-react";
import { useAdminSession } from "@/features/admin/session";
import { WAREHOUSES, ADMIN } from "@/features/admin/mock";

export const Route = createFileRoute("/admin/profile")({
  component: ProfileScreen,
});

function ProfileScreen() {
  const { warehouseId, isAdmin, warehouse, setWarehouseId, actorName } = useAdminSession();
  const email = isAdmin ? ADMIN.email : warehouse?.manager.email;

  return (
    <div className="pb-24">
      <header className="pt-10 px-5 pb-5 text-center">
        <div className="size-20 mx-auto rounded-full bg-foreground text-background grid place-items-center text-2xl font-bold">
          {isAdmin ? "AD" : (warehouse?.manager.initials ?? "??")}
        </div>
        <h1 className="mt-3 text-xl font-bold">{actorName}</h1>
        <p className="text-sm text-muted-foreground">{email}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">
          {isAdmin ? "Admin plateforme" : "Manager d'entrepôt"}
        </p>
      </header>

      <section className="px-5 space-y-2">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Entrepôt courant
        </h2>
        <div className="bg-card ring-1 ring-border rounded-xl overflow-hidden">
          {WAREHOUSES.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWarehouseId(w.id)}
              className={
                "w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border last:border-0 " +
                (w.id === warehouseId ? "bg-primary/5" : "")
              }
            >
              <MapPin className="size-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{w.name}</p>
                <p className="text-[11px] text-muted-foreground">{w.manager.name}</p>
              </div>
              {w.id === warehouseId ? (
                <span className="text-primary text-sm font-bold">Actif</span>
              ) : null}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setWarehouseId("all")}
            className={
              "w-full text-left px-4 py-3 flex items-center gap-3 border-t border-border " +
              (warehouseId === "all" ? "bg-primary/5" : "")
            }
          >
            <Building2 className="size-4 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Tous les entrepôts</p>
              <p className="text-[11px] text-muted-foreground">Vue admin plateforme</p>
            </div>
            {warehouseId === "all" ? (
              <span className="text-primary text-sm font-bold">Actif</span>
            ) : null}
          </button>
        </div>
      </section>

      <div className="px-5 mt-6 space-y-2">
        <Link
          to="/demandes"
          className="w-full bg-card ring-1 ring-border rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between"
        >
          Retour à l'app client
          <span className="text-muted-foreground">→</span>
        </Link>
        <button
          type="button"
          className="w-full bg-destructive/5 text-destructive ring-1 ring-destructive/20 rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
        >
          <LogOut className="size-4" /> Se déconnecter
        </button>
      </div>
    </div>
  );
}