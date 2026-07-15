import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { DEMANDS, PARCEL_STATUS_META } from "@/features/demands/data";

export default defineTool({
  name: "list_parcels",
  title: "Lister les colis",
  description:
    "Liste les colis de toutes les demandes FastSends. Filtres optionnels par statut de colis et par entrepôt d'origine (warehouseId de la demande).",
  inputSchema: {
    status: z
      .enum(["expected", "received", "shipped", "delivered", "issue"])
      .optional()
      .describe("Filtrer par statut de colis."),
    warehouseId: z
      .string()
      .optional()
      .describe("Filtrer par entrepôt de réception (ex: paris-cdg, paris-nord)."),
    limit: z.number().int().positive().optional().describe("Nombre maximum de colis (par défaut 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ status, warehouseId, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié" }], isError: true };
    }
    const max = limit ?? 100;
    const rows: Array<Record<string, unknown>> = [];
    for (const d of DEMANDS) {
      if (warehouseId && d.warehouseId !== warehouseId) continue;
      for (const p of d.parcels) {
        if (status && p.status !== status) continue;
        rows.push({
          demandId: d.id,
          demandReference: d.reference,
          warehouseId: d.warehouseId ?? null,
          parcelId: p.id,
          parcelReference: p.reference,
          description: p.description,
          weightKg: p.weightKg ?? null,
          status: p.status,
          statusLabel: PARCEL_STATUS_META[p.status].label,
          trackingNumber: p.trackingNumber ?? null,
          carrier: p.carrier ?? null,
          receivedAt: p.receivedAt ?? null,
          paymentStatus: p.paymentStatus ?? null,
          valiseId: p.valiseId ?? null,
        });
        if (rows.length >= max) break;
      }
      if (rows.length >= max) break;
    }
    return {
      content: [
        {
          type: "text",
          text:
            rows.length === 0
              ? "Aucun colis ne correspond aux filtres."
              : JSON.stringify(rows, null, 2),
        },
      ],
      structuredContent: { items: rows, count: rows.length },
    };
  },
});