import { createFileRoute, Link } from "@tanstack/react-router";
import { Plane, CalendarCheck, Clock } from "lucide-react";
import { Header, Footer, FloatingHelp, PageHero } from "@/features/landing/Landing";

export const Route = createFileRoute("/vols")({
  head: () => ({
    meta: [
      { title: "Prochains vols colis — FastSends" },
      {
        name: "description",
        content:
          "Calendrier des prochains départs FastSends : dates de clôture d'entrepôt, corridors desservis et délais estimés pour vos colis.",
      },
      { property: "og:title", content: "Prochains vols colis — FastSends" },
      {
        property: "og:description",
        content: "Dates de départ, clôture d'entrepôt et délais estimés de nos prochains vols colis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VolsPage,
});

type Flight = {
  code: string;
  corridor: string;
  type: "Groupage standard" | "Fret express";
  closing: string;
  departure: string;
  eta: string;
  status: "Ouvert" | "Bientôt clos" | "Complet";
};

const FLIGHTS: Flight[] = [
  {
    code: "FS-AIR-0912",
    corridor: "Paris → Cotonou",
    type: "Fret express",
    closing: "10 sept.",
    departure: "12 sept.",
    eta: "5 à 7 jours",
    status: "Ouvert",
  },
  {
    code: "FS-AIR-0915",
    corridor: "Bruxelles → Cotonou",
    type: "Groupage standard",
    closing: "12 sept.",
    departure: "15 sept.",
    eta: "10 à 14 jours",
    status: "Bientôt clos",
  },
  {
    code: "FS-AIR-0921",
    corridor: "Guangzhou → Cotonou",
    type: "Fret express",
    closing: "18 sept.",
    departure: "21 sept.",
    eta: "7 à 9 jours",
    status: "Ouvert",
  },
  {
    code: "FS-AIR-0903",
    corridor: "Paris → Lomé",
    type: "Groupage standard",
    closing: "01 sept.",
    departure: "03 sept.",
    eta: "10 à 14 jours",
    status: "Complet",
  },
];

const STATUS_STYLE: Record<Flight["status"], string> = {
  Ouvert: "bg-primary/10 text-primary",
  "Bientôt clos": "bg-amber-500/15 text-amber-700",
  Complet: "bg-muted text-muted-foreground",
};

function VolsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <PageHero
          kicker="Départs"
          title="Les prochains vols pour vos colis"
          intro="Déposez ou faites récupérer vos colis avant la date de clôture d'entrepôt pour partir sur le vol suivant."
        />
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
            <div className="grid gap-4 md:grid-cols-2">
              {FLIGHTS.map((f) => (
                <article
                  key={f.code}
                  className="rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Plane className="h-4 w-4" />
                      </span>
                      <div>
                        <h2 className="font-display text-lg font-bold leading-tight">{f.corridor}</h2>
                        <p className="font-mono text-[11px] text-muted-foreground">{f.code}</p>
                      </div>
                    </div>
                    <span
                      className={
                        "rounded-full px-3 py-1 text-[11px] font-semibold " + STATUS_STYLE[f.status]
                      }
                    >
                      {f.status}
                    </span>
                  </div>

                  <dl className="mt-6 grid grid-cols-3 gap-3 text-[13px]">
                    <div>
                      <dt className="text-muted-foreground">Clôture</dt>
                      <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                        <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                        {f.closing}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Départ</dt>
                      <dd className="mt-1 font-semibold">{f.departure}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Délai</dt>
                      <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {f.eta}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-[12px] text-muted-foreground">{f.type}</p>
                </article>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-start gap-3 rounded-3xl border border-border bg-secondary/50 p-6 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Les dates peuvent bouger selon la compagnie. On vous prévient dès que votre colis est
                affecté à un vol.
              </p>
              <Link
                to="/demande"
                className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Réserver ma place
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
