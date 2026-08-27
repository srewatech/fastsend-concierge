import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/features/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FastSends — Envoyer des colis vers le Congo" },
      {
        name: "description",
        content:
          "Enlèvement, achats sur place, groupage et fret aérien entre la France, la Belgique et le Congo. Estimation immédiate et suivi colis par colis.",
      },
      { property: "og:title", content: "FastSends — Envoyer des colis vers le Congo" },
      {
        property: "og:description",
        content:
          "Estimez votre expédition, choisissez votre service et suivez chaque carton jusqu'à la remise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Landing />;
}
