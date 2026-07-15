import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDemandsTool from "./tools/list-demands";
import getDemandTool from "./tools/get-demand";
import listParcelsTool from "./tools/list-parcels";
import whoAmITool from "./tools/whoami";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "fastsends-mcp",
  title: "FastSends MCP",
  version: "0.1.0",
  instructions:
    "Outils pour la plateforme logistique FastSends. Utilise `list_demands` pour explorer les demandes de transport/livraison, `get_demand` pour le détail d'une demande (colis, timeline, itinéraire, paiement), `list_parcels` pour filtrer les colis par statut, et `whoami` pour vérifier l'utilisateur connecté.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoAmITool, listDemandsTool, getDemandTool, listParcelsTool],
});