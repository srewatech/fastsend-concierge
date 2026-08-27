import { createFileRoute } from "@tanstack/react-router";
import { Wizard } from "@/features/wizard/Wizard";

export const Route = createFileRoute("/demande")({
  head: () => ({
    meta: [
      { title: "Créer une demande d'expédition — FastSends" },
      {
        name: "description",
        content:
          "Déposez votre demande FastSends en six étapes guidées : contact, service, détails, paiement, récapitulatif et confirmation.",
      },
      { property: "og:title", content: "Créer une demande d'expédition — FastSends" },
      {
        property: "og:description",
        content: "Pick-up, delivery, Shop For You, fret aérien : déposez votre demande en quelques minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemandePage,
});

function DemandePage() {
  return <Wizard />;
}
