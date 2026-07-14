import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSessionProvider } from "@/features/admin/session";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "FastSends · Hub entrepôt" },
      {
        name: "description",
        content:
          "Console desktop opérateur : réception, valises, chargement, arrivée et contrôle des colis FastSends.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AdminSessionProvider>
      <Outlet />
    </AdminSessionProvider>
  ),
});