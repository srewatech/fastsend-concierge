import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageOpen, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { Header, Footer, FloatingHelp, PageHero } from "@/features/landing/Landing";

export const Route = createFileRoute("/tutos")({
  head: () => ({
    meta: [
      { title: "Tutos — FastSends" },
      {
        name: "description",
        content:
          "Guides pas à pas FastSends : créer une demande, faire acheter un article, préparer un colis et suivre son expédition.",
      },
      { property: "og:title", content: "Tutos — FastSends" },
      {
        property: "og:description",
        content: "Guides pas à pas pour envoyer, acheter et suivre vos colis avec FastSends.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TutosPage,
});

const TUTOS = [
  {
    icon: PackageOpen,
    title: "Créer une demande en 3 minutes",
    steps: [
      "Renseignez vos coordonnées de contact.",
      "Choisissez le service adapté (envoi, achat, enlèvement).",
      "Complétez le formulaire, imprimez les bordereaux générés.",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Faire acheter un article",
    steps: [
      "Collez le lien produit ou décrivez l'article en magasin.",
      "Indiquez taille, couleur et quantité.",
      "Nous achetons, réceptionnons puis pesons avant facture.",
    ],
  },
  {
    icon: Truck,
    title: "Préparer un colis pour l'entrepôt",
    steps: [
      "Emballez avec du calage, fermez avec un adhésif large.",
      "Collez le bordereau FastSends bien visible sur le dessus.",
      "Déposez ou demandez un enlèvement avant la clôture du vol.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Suivre et payer",
    steps: [
      "Le colis est scanné et pesé à l'entrepôt.",
      "Vous recevez la facture après pesée.",
      "Payez (Mobile Money, carte, espèces) et suivez le départ.",
    ],
  },
];

function TutosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <PageHero
          kicker="Guides"
          title="Nos tutos pour expédier sans stress"
          intro="Des marches à suivre courtes, écrites par les équipes entrepôt, pour éviter les erreurs les plus fréquentes."
        />
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
            <div className="grid gap-4 md:grid-cols-2">
              {TUTOS.map((t) => (
                <article key={t.title} className="rounded-3xl border border-border bg-card p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <t.icon className="h-4 w-4" />
                  </span>
                  <h2 className="mt-4 font-display text-lg font-bold leading-tight">{t.title}</h2>
                  <ol className="mt-4 space-y-3">
                    {t.steps.map((s, i) => (
                      <li key={s} className="flex gap-3 text-[13px] text-muted-foreground">
                        <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-start gap-3 rounded-3xl border border-border bg-secondary/50 p-6 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">Prêt à lancer votre première demande ?</p>
              <Link
                to="/demande"
                className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Commencer
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingHelp />
    </div>
  );
}
