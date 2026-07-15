import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { DEMANDS, STATUS_META } from "@/features/demands/data";

export default defineTool({
  name: "list_demands",
  title: "Lister les demandes",
  description:
    "Liste les demandes FastSends (transport / livraison / shop-for-you / pick-up / fret). Filtres optionnels par statut et par service. Retourne un résumé (référence, service, statut, route, montant).",
  inputSchema: {
    status: z
      .enum([
        "pending_review",
        "awaiting_payment",
        "in_warehouse",
        "in_transit",
        "customs",
        "delivered",
        "cancelled",
      ])
      .optional()
      .describe("Filtrer par statut de demande."),
    serviceId: z
      .string()
      .optional()
      .describe("Filtrer par service (ex: delivery, shop_online, pickup, air_freight)."),
    limit: z.number().int().positive().optional().describe("Nombre maximum de résultats (par défaut 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ status, serviceId, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié" }], isError: true };
    }
    const max = limit ?? 50;
    const rows = DEMANDS.filter(
      (d) => (!status || d.status === status) && (!serviceId || d.serviceId === serviceId),
    )
      .slice(0, max)
      .map((d) => ({
        id: d.id,
        reference: d.reference,
        service: d.serviceName,
        status: d.status,
        statusLabel: STATUS_META[d.status].label,
        from: d.route.from,
        to: d.route.to,
        parcels: d.parcels.length,
        amount: d.amount,
        currency: d.currency,
        paymentStatus: d.paymentStatus,
        updatedAt: d.updatedAt,
      }));
    return {
      content: [
        {
          type: "text",
          text:
            rows.length === 0
              ? "Aucune demande ne correspond aux filtres."
              : JSON.stringify(rows, null, 2),
        },
      ],
      structuredContent: { items: rows, count: rows.length },
    };
  },
});