import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer, FloatingHelp, PageHero, Tarifs, Simulateur } from "@/features/landing/Landing";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — FastSends" },
      {
        name: "description",
        content:
          "Grille tarifaire au kilo par corridor, groupage standard ou fret express, et simulateur d'estimation des frais d'expédition.",
      },
      { property: "og:title", content: "Tarifs — FastSends" },
      {
        property: "og:description",
        content:
          "Prix au kilo sans surprise : grille standard/express et estimation de vos frais d'expédition.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TarifsPage,
});

function TarifsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <PageHero
          kicker="Tarifs"
          title="Des prix au kilo, sans surprise"
          intro="Grille standard ou fret express selon le corridor, et une estimation immédiate avant la pesée en entrepôt."
        />
        <Tarifs />

        <Simulateur />
      </main>
      <Footer />
      <FloatingHelp />
    </div>
  );
}
