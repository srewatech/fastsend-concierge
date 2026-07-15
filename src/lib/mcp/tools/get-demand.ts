import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { DEMANDS } from "@/features/demands/data";

export default defineTool({
  name: "get_demand",
  title: "Détail d'une demande",
  description:
    "Retourne le détail complet d'une demande FastSends par identifiant ou référence (colis, timeline, itinéraire, bénéficiaire, contact, paiement, notes).",
  inputSchema: {
    id: z.string().min(1).describe("Identifiant ou référence de la demande, ex: FS-DLS-00421."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié" }], isError: true };
    }
    const needle = id.trim().toUpperCase();
    const d = DEMANDS.find(
      (x) => x.id.toUpperCase() === needle || x.reference.toUpperCase() === needle,
    );
    if (!d) {
      return {
        content: [{ type: "text", text: `Aucune demande trouvée pour "${id}".` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(d, null, 2) }],
      structuredContent: { demand: d },
    };
  },
});