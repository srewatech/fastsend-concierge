import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Phone, ShoppingBag, Send, Truck, Star, Check, X, ChevronLeft, ChevronRight, CalendarCheck, PackageOpen, ArrowRight, Clock, ShieldCheck, MapPin, Package, Plane, Store, Building2, type LucideIcon } from "lucide-react";
import { SERVICES } from "@/features/wizard/services";
import type { ServiceId } from "@/features/wizard/types";
import {
  ACCESS_CARDS,
  CORRIDORS,
  OFFERS,
  OPTIONS,
  JOURNEY_PHASES,
  PROOF,
  WHY_US,
  REVIEW_SCORE,
  SECONDARY_ACCESS,
  TARIF_MODES,
  TEAM_POINTS,
  TESTIMONIALS,
  volumetricWeight,
  type OptionId,
} from "./data";
import heroImg from "@/assets/hero-courier.jpg";
import heroShoppingImg from "@/assets/hero-shopping.jpg";
import heroFretImg from "@/assets/hero-fret.jpg";
import teamImg from "@/assets/team-agency.jpg";

const NAV = [
  { href: "#acces", label: "Nos accès" },
  { href: "#services", label: "Services" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#equipe", label: "L'équipe" },
  { href: "#avis", label: "Avis" },
];

const ACCESS_ICONS = { acheter: ShoppingBag, envoyer: Send, retirer: Truck } as const;


function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{children}</span>
  );
}

function SectionHead({
  index,
  label,
  title,
  intro,
  action,
}: {
  index: string;
  label: string;
  title: string;
  intro?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-t border-border pt-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">{index}</span>
          <Label>{label}</Label>
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-[2.6rem]">{title}</h2>
        {intro ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{intro}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------- Nav ---------------------------------- */

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary font-mono text-[11px] font-bold text-primary-foreground">
            FS
          </span>
          <span className="text-sm font-semibold tracking-tight">FastSends</span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/demandes"
            className="hidden rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Suivre un colis
          </Link>
          <Link
            to="/demande"
            className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Expédier
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border md:hidden"
          >
            <span className="space-y-1">
              <span className="block h-px w-4 bg-foreground" />
              <span className="block h-px w-4 bg-foreground" />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-border bg-background px-5 py-3 md:hidden">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border py-3 text-sm last:border-0"
            >
              {n.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

/* --------------------------------- Hero ---------------------------------- */

type HeroSlide = {
  image: string;
  alt: string;
  kicker: string;
  title: string;
  /** Mots ou phrases à surligner dans le titre */
  highlight: string;
  body: string;
  cta: string;
  href: string;
  badge: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    image: heroImg,
    alt: "Coursier FastSends chargeant des colis dans un utilitaire",
    kicker: "Envoi de colis",
    title: "Vos colis partent, vous savez où ils sont.",
    highlight: "où ils sont.",
    body: "Enlèvement, groupage et fret aérien. Chaque demande reçoit un identifiant, chaque carton un statut — de l'entrepôt de départ jusqu'à la remise.",
    cta: "Créer une demande",
    href: "/demande",
    badge: "Dernier départ · FS-DLS-00421 · Paris CDG → Brazzaville · 12 colis · en transit",
  },
  {
    image: heroShoppingImg,
    alt: "Assistante de magasin scannant un colis en boutique",
    kicker: "Achats en Afrique de l'Ouest",
    title: "On achète pour vous, au magasin ou en ligne.",
    highlight: "pour vous,",
    body: "Vous nous décrivez l'article, nos équipes l'achètent sur place, le photographient et l'expédient. Vous ne payez que lorsque c'est trouvé.",
    cta: "Faire acheter un article",
    href: "/demande",
    badge: "Shop For You · achats vérifiés et photographiés avant expédition",
  },
  {
    image: heroFretImg,
    alt: "Palettes de fret chargées dans un avion cargo au coucher du soleil",
    kicker: "Fret aérien express",
    title: "Vos marchandises en l'air sous 72 heures.",
    highlight: "sous 72 heures.",
    body: "Départs groupés chaque semaine vers Brazzaville, Kinshasa et Pointe-Noire. Tarif à la pesée, suivi à chaque escale.",
    cta: "Expédier en fret",
    href: "/demande",
    badge: "Prochain départ groupé · jeudi · Paris CDG → Maya-Maya",
  },
];

function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const slide = HERO_SLIDES[index];

  const renderTitle = (s: HeroSlide) => {
    const parts = s.title.split(s.highlight);
    if (parts.length < 2) return s.title;
    return (
      <>
        {parts[0]}
        <mark className="bg-primary px-1.5 text-primary-foreground rounded-sm box-decoration-clone">
          {s.highlight}
        </mark>
        {parts[1]}
      </>
    );
  };

  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      {/* Images en fond */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((s, i) => (
          <img
            key={s.kicker}
            src={s.image}
            alt={i === index ? s.alt : ""}
            aria-hidden={i !== index}
            width={1600}
            height={1200}
            fetchPriority={i === 0 ? "high" : "auto"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div
        className="relative mx-auto flex max-w-6xl flex-col justify-center px-5 py-16 md:min-h-[560px] md:py-24"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div key={index} className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-primary backdrop-blur">
            {slide.kicker}
          </span>
          <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight md:text-[4.2rem]">
            {renderTitle(slide)}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">{slide.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={slide.href}
              className="rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {slide.cta}
            </Link>
            <a
              href="#simulateur"
              className="rounded-md border border-border bg-background/70 px-6 py-3.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-secondary"
            >
              Estimer le coût
            </a>
          </div>
        </div>

        {/* Badge du slide + contrôles */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <span className="inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-background/85 px-4 py-2.5 text-[12px] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {slide.badge}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Slide précédent"
              onClick={() => setIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background/85 backdrop-blur transition-colors hover:bg-secondary"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Slide suivant"
              onClick={() => setIndex((i) => (i + 1) % HERO_SLIDES.length)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background/85 backdrop-blur transition-colors hover:bg-secondary"
            >
              <ChevronRight size={16} />
            </button>
            <div className="flex items-center gap-1.5 pl-1">
              {HERO_SLIDES.map((s, i) => (
                <button
                  key={s.kicker}
                  type="button"
                  aria-label={`Aller au slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-primary" : "w-1.5 bg-foreground/25 hover:bg-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preuves */}
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-4">
          {PROOF.map((p) => (
            <div key={p.label}>
              <dt className="text-xl font-semibold tracking-tight">{p.value}</dt>
              <dd className="mt-1 text-[11px] leading-snug text-muted-foreground">{p.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------- Barre d'accès rapide -------------------------- */

const QUICK_ACTIONS = [
  { label: "Acheter en Europe", icon: ShoppingBag, service: "shop-store", accent: false },
  { label: "Envoyer un colis", icon: Send, service: "delivery", accent: false },
  { label: "Retirer un colis", icon: PackageOpen, service: "pickup", accent: false },
  { label: "Prendre RDV", icon: CalendarCheck, service: "elite-pro", accent: true },
] as const;

function QuickBar() {
  return (
    <div className="relative z-10 mx-auto -mt-8 max-w-4xl px-5">
      <nav
        aria-label="Accès rapide"
        className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-card p-1.5 shadow-[0_18px_40px_-24px_hsl(216_88%_45%/0.45)]"
      >
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            to="/demande"
            search={{ service: a.service }}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors ${
              a.accent
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            <a.icon size={15} strokeWidth={2.2} />
            <span className="hidden sm:inline">{a.label}</span>
            <span className="sm:hidden">{a.label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

/* --------------------------------- Accès ---------------------------------- */

function Acces() {
  return (
    <section id="acces" className="border-b border-border bg-primary/[0.045]">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            Comment pouvons-nous vous aider aujourd'hui ?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Choisissez le parcours qui correspond à votre besoin — un même parcours de demande derrière.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ACCESS_CARDS.map((c) => {
            const Icon = ACCESS_ICONS[c.id as keyof typeof ACCESS_ICONS] ?? Send;
            return (
              <Link
                key={c.id}
                to="/demande"
                className="group flex flex-col rounded-2xl border border-border bg-card p-7 shadow-[0_10px_30px_-22px_hsl(216_88%_45%/0.4)] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_22px_44px_-24px_hsl(216_88%_45%/0.55)]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={20} strokeWidth={2.1} />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">{c.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">{c.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-primary">
                  {c.cta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Nos autres services
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECONDARY_ACCESS.map((s) => (
            <a
              key={s.id}
              href="#services"
              className="rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40 hover:bg-card/70"
            >
              <span className="block text-[13px] font-semibold">{s.title}</span>
              <span className="mt-0.5 block text-[12px] text-muted-foreground">{s.body}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Services -------------------------------- */


const SERVICE_ICONS: Record<string, LucideIcon> = {
  pickup: PackageOpen,
  delivery: Send,
  shop_store: Store,
  shop_online: ShoppingBag,
  air_freight: Plane,
  elite_pro: Building2,
};

function Services() {
  const [audience, setAudience] = useState<"particulier" | "entreprise">("particulier");
  const list = useMemo(() => SERVICES.filter((s) => s.audience.includes(audience)), [audience]);

  return (
    <section id="services" className="bg-primary/[0.045]">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            01 — Catalogue
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Six services, <span className="text-primary">un seul parcours</span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Le catalogue s'adapte à votre profil. Chaque service ouvre un formulaire dédié — pas de
            champs inutiles.
          </p>

          <div className="mt-7 inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
            {(["particulier", "entreprise"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                aria-pressed={audience === a}
                className={
                  "rounded-full px-5 py-2 text-[12.5px] font-semibold capitalize transition-colors " +
                  (audience === a
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => {
            const Icon = SERVICE_ICONS[s.id] ?? Package;
            return (
              <Link
                key={s.id}
                to="/demande"
                search={{ service: s.id }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-[0_10px_30px_-22px_hsl(216_88%_45%/0.4)] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_22px_44px_-24px_hsl(216_88%_45%/0.55)]"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={20} strokeWidth={2.1} />
                  </span>
                  <span className="flex items-center gap-2">
                    {s.badge ? (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                        {s.badge}
                      </span>
                    ) : null}
                    <span className="font-display text-2xl font-extrabold text-foreground/10">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">{s.name}</h3>
                <p className="mt-1 text-[13px] font-semibold text-primary">{s.tagline}</p>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-primary">
                  Commencer
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Tarifs --------------------------------- */

function Tarifs() {
  const [mode, setMode] = useState<"standard" | "express">("standard");
  const active = TARIF_MODES.find((m) => m.id === mode)!;

  return (
    <section id="tarifs" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <SectionHead
          index="02"
          label="Grille"
          title="Des prix au kilo, sans surprise"
          intro="Basculez entre groupage standard et fret express : la grille, les délais et ce qui est inclus s'ajustent."
          action={
            <div className="inline-flex rounded-full border border-border bg-card p-1">
              {TARIF_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  aria-pressed={mode === m.id}
                  className={
                    "rounded-full px-4 py-2 text-[12px] font-semibold transition-colors " +
                    (mode === m.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          }
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-5 py-3 font-normal">Corridor</th>
                  <th className="px-5 py-3 font-normal">Prix / kg</th>
                  <th className="hidden px-5 py-3 font-normal sm:table-cell">Dossier</th>
                  <th className="px-5 py-3 text-right font-normal">Délai</th>
                </tr>
              </thead>
              <tbody>
                {CORRIDORS.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <span className="text-muted-foreground">{c.from}</span>
                      <span className="mx-2 text-primary">→</span>
                      <span className="font-medium">{c.to}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold">
                      {(c.pricePerKg * active.factor).toFixed(2)} €
                    </td>
                    <td className="hidden px-5 py-4 font-mono text-muted-foreground sm:table-cell">
                      {c.handling.toFixed(2)} €
                    </td>
                    <td className="px-5 py-4 text-right text-muted-foreground">
                      {mode === "express" ? active.speed : c.leadTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
              {[
                { k: "Poids minimum facturé", v: active.minWeight },
                { k: "Poids volumétrique", v: "L×l×H ÷ 6000" },
                { k: "Dégressif groupage", v: "dès 30 kg" },
              ].map((x) => (
                <div key={x.k} className="bg-card px-5 py-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {x.k}
                  </span>
                  <span className="mt-1 block text-sm font-semibold">{x.v}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold tracking-tight">{active.label}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{active.hint}</p>
            <ul className="mt-5 space-y-3 border-t border-border pt-5">
              {active.includes.map((i) => (
                <li key={i} className="flex items-start gap-2 text-[13px]">
                  <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                  <span>{i}</span>
                </li>
              ))}
              <li className="flex items-start gap-2 text-[13px] text-muted-foreground">
                <X size={15} className="mt-0.5 shrink-0" />
                <span>Droits et taxes locaux à la charge du destinataire.</span>
              </li>
            </ul>
            <Link
              to="/demande"
              className="mt-6 block rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Créer une demande {active.id === "express" ? "express" : "standard"}
            </Link>
          </aside>
        </div>

        <p className="mt-4 text-[12px] text-muted-foreground">
          Montants indicatifs : le total est confirmé après pesée en entrepôt.
        </p>
      </div>
    </section>
  );
}


/* ------------------------------- Simulateur ------------------------------- */

const SIM_SERVICES: ServiceId[] = ["pickup", "delivery", "shop_online", "shop_store", "air_freight"];

function Simulateur() {
  const [serviceId, setServiceId] = useState<ServiceId>("delivery");
  const [corridorId, setCorridorId] = useState(CORRIDORS[0]!.id);
  const [weight, setWeight] = useState("8");
  const [dims, setDims] = useState({ l: "40", w: "30", h: "25" });
  const [basket, setBasket] = useState("150");
  const [options, setOptions] = useState<OptionId[]>([]);

  const corridor = CORRIDORS.find((c) => c.id === corridorId)!;
  const service = SERVICES.find((s) => s.id === serviceId)!;
  const isShop = serviceId === "shop_online" || serviceId === "shop_store";

  const billableWeight = Math.max(
    Number(weight) || 0,
    volumetricWeight(Number(dims.l), Number(dims.w), Number(dims.h)),
  );
  const freight = billableWeight * corridor.pricePerKg;
  const shopFee = isShop ? Math.max(15, (Number(basket) || 0) * 0.08) : 0;
  const extras = options.reduce((sum, id) => sum + (OPTIONS.find((o) => o.id === id)?.price ?? 0), 0);
  const total = freight + corridor.handling + shopFee + extras;

  const toggle = (id: OptionId) =>
    setOptions((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const field =
    "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <section id="simulateur" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHead
        index="03"
        label="Estimation"
        title="Le calcul des frais d'expédition"
        intro="Le formulaire s'ajuste au service choisi. L'estimation est indicative et reste soumise à la pesée."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Service
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {SIM_SERVICES.map((id) => {
                  const s = SERVICES.find((x) => x.id === id)!;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setServiceId(id)}
                      className={
                        "rounded-md border px-3 py-2 text-[12px] font-semibold transition-colors " +
                        (serviceId === id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground")
                      }
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="sm:col-span-2 block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Corridor
              </span>
              <select
                value={corridorId}
                onChange={(e) => setCorridorId(e.target.value)}
                className={field + " mt-2"}
              >
                {CORRIDORS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.from} → {c.to}
                  </option>
                ))}
              </select>
            </label>

            {isShop ? (
              <label className="sm:col-span-2 block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Montant du panier (€)
                </span>
                <input
                  inputMode="decimal"
                  value={basket}
                  onChange={(e) => setBasket(e.target.value)}
                  className={field + " mt-2"}
                />
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  Commission d'achat : 8 % du panier, minimum 15 €.
                </span>
              </label>
            ) : null}

            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Poids réel (kg)
              </span>
              <input
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={field + " mt-2"}
              />
            </label>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Dimensions (cm)
              </span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["l", "w", "h"] as const).map((k) => (
                  <input
                    key={k}
                    inputMode="numeric"
                    value={dims[k]}
                    onChange={(e) => setDims((d) => ({ ...d, [k]: e.target.value }))}
                    className={field}
                    aria-label={k === "l" ? "Longueur" : k === "w" ? "Largeur" : "Hauteur"}
                  />
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Options
              </span>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {OPTIONS.map((o) => {
                  const active = options.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggle(o.id)}
                      className={
                        "rounded-md border p-3 text-left transition-colors " +
                        (active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary")
                      }
                    >
                      <span className="block text-[12px] font-semibold">{o.label}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{o.hint}</span>
                      <span className="mt-2 block font-mono text-[12px] text-primary">+{o.price} €</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col rounded-lg border border-border bg-foreground p-6 text-background">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-50">Estimation</span>
          <p className="mt-3 text-4xl font-semibold tracking-tight">
            {total.toFixed(2)} <span className="text-2xl">€</span>
          </p>
          <p className="mt-1 text-[12px] opacity-60">
            {service.name} · {corridor.leadTime} · poids facturé {billableWeight.toFixed(1)} kg
          </p>

          <dl className="mt-6 space-y-2 border-t border-white/15 pt-4 text-[13px]">
            <div className="flex justify-between">
              <dt className="opacity-60">Fret ({corridor.pricePerKg.toFixed(2)} €/kg)</dt>
              <dd className="font-mono">{freight.toFixed(2)} €</dd>
            </div>
            <div className="flex justify-between">
              <dt className="opacity-60">Frais de dossier</dt>
              <dd className="font-mono">{corridor.handling.toFixed(2)} €</dd>
            </div>
            {isShop ? (
              <div className="flex justify-between">
                <dt className="opacity-60">Commission d'achat</dt>
                <dd className="font-mono">{shopFee.toFixed(2)} €</dd>
              </div>
            ) : null}
            {options.map((id) => {
              const o = OPTIONS.find((x) => x.id === id)!;
              return (
                <div key={id} className="flex justify-between">
                  <dt className="opacity-60">{o.label}</dt>
                  <dd className="font-mono">{o.price.toFixed(2)} €</dd>
                </div>
              );
            })}
          </dl>

          <Link
            to="/demande"
            className="mt-auto rounded-md bg-primary px-4 py-3.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 lg:mt-6"
          >
            Lancer cette demande
          </Link>
          <p className="mt-3 text-[11px] leading-snug opacity-50">
            Montant indicatif. Un agent FastSends confirme le total après pesée et contrôle du colis.
          </p>
        </aside>
      </div>
    </section>
  );
}

/* --------------------------------- Offres --------------------------------- */

function Offres() {
  const [active, setActive] = useState(OFFERS[0]!.id);
  const offer = OFFERS.find((o) => o.id === active)!;
  const service = SERVICES.find((s) => s.id === offer.serviceId)!;

  return (
    <section id="offres" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <SectionHead index="04" label="En ce moment" title="Nos offres actives" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
          <ul className="space-y-px overflow-hidden rounded-lg border border-border bg-border">
            {OFFERS.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => setActive(o.id)}
                  className={
                    "flex w-full items-center justify-between px-5 py-4 text-left transition-colors " +
                    (active === o.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")
                  }
                >
                  <span>
                    <span
                      className={
                        "block font-mono text-[10px] uppercase tracking-[0.2em] " +
                        (active === o.id ? "opacity-70" : "text-muted-foreground")
                      }
                    >
                      {o.eyebrow}
                    </span>
                    <span className="mt-1 block text-sm font-semibold">{o.title}</span>
                  </span>
                  <span className="text-sm">→</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-8">
            <div>
              <Label>{offer.eyebrow}</Label>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{offer.title}</h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{offer.body}</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
              <span className="rounded bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.15em] text-primary">
                {service.code}
              </span>
              <span className="text-[13px] text-muted-foreground">
                Service concerné : {service.name}
              </span>
              <Link
                to="/demande"
                className="ml-auto rounded-md bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                En profiter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Pourquoi nous choisir ------------------------- */

const WHY_ICONS = { clock: Clock, shield: ShieldCheck, heart: MessageCircle, pin: MapPin } as const;

function Pourquoi() {
  return (
    <section id="pourquoi" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Label>Pourquoi nous</Label>
        <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-[2.7rem]">
          Pourquoi choisir FastSends ?
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Comme des milliers de clients, confiez vos achats et vos colis entre l'Europe et le Congo à une
          équipe qui répond.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {WHY_US.map((w) => {
          const Icon = WHY_ICONS[w.icon];
          return (
            <article
              key={w.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-[0_14px_36px_-30px_hsl(216_88%_45%/0.6)] transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 font-display text-[17px] font-bold leading-snug tracking-tight">
                {w.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{w.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------- Méthode -------------------------------- */

function Methode() {
  const [active, setActive] = useState(JOURNEY_PHASES[0].id);

  useEffect(() => {
    const nodes = JOURNEY_PHASES.map((p) => document.getElementById(`phase-${p.id}`)).filter(
      (n): n is HTMLElement => Boolean(n),
    );
    if (!nodes.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace("phase-", ""));
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="methode" className="relative overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-16 bg-background [clip-path:ellipse(75%_100%_at_50%_0%)]"
      />
      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
            03 — Le flux réel
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-[2.7rem]">
            Comment ça marche&nbsp;?
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/80 md:text-base">
            Une seule demande, cinq phases : de votre formulaire au retrait du colis. Le prix, lui,
            n'est fixé qu'après la pesée en entrepôt.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          {/* Rail de progression */}
          <nav aria-label="Étapes du parcours" className="hidden lg:block">
            <ol className="sticky top-28 space-y-1">
              {JOURNEY_PHASES.map((p) => {
                const on = p.id === active;
                return (
                  <li key={p.id}>
                    <a
                      href={`#phase-${p.id}`}
                      className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        on ? "bg-primary-foreground/15" : "hover:bg-primary-foreground/10"
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold transition-colors ${
                          on
                            ? "bg-primary-foreground text-primary"
                            : "bg-primary-foreground/20 text-primary-foreground"
                        }`}
                      >
                        {p.step}
                      </span>
                      <span
                        className={`text-[13px] font-semibold leading-snug ${
                          on ? "" : "text-primary-foreground/70"
                        }`}
                      >
                        {p.title}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Phases */}
          <ol className="space-y-5">
            {JOURNEY_PHASES.map((p, i) => (
              <li
                key={p.id}
                id={`phase-${p.id}`}
                className="scroll-mt-28 rounded-2xl bg-card p-6 text-card-foreground shadow-[0_18px_40px_-30px_rgb(0_0_0/0.6)] md:p-8"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground font-mono text-[12px] font-bold text-background">
                    {p.step}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                    {p.actor}
                  </span>
                  {i === JOURNEY_PHASES.length - 1 && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      Fin du parcours
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold tracking-tight md:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{p.lead}</p>
                <ul className="mt-5 space-y-2.5">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-[13.5px] leading-relaxed">
                      <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                {p.note && (
                  <p className="mt-5 rounded-xl border border-dashed border-border bg-secondary/60 px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
                    {p.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/demande"
            className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-3 text-[13px] font-semibold text-primary transition-transform hover:translate-x-0.5"
          >
            Créer ma demande <ArrowRight size={15} />
          </Link>
          <Link
            to="/demandes"
            className="rounded-full border border-primary-foreground/40 px-5 py-3 text-[13px] font-semibold transition-colors hover:bg-primary-foreground/10"
          >
            Suivre une demande existante
          </Link>
        </div>
      </div>
    </section>
  );
}


/* --------------------------------- Équipe --------------------------------- */

function Equipe() {
  return (
    <section id="equipe" className="border-y border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <Label>L'équipe</Label>
          <h2 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-tight md:text-[2.4rem]">
            L'équipe FastSends à vos côtés
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Derrière chaque demande, des agents en entrepôt qui pèsent, contrôlent et confirment. Pas un
            algorithme : des personnes que vous pouvez appeler.
          </p>
          <ul className="mt-6 space-y-3">
            {TEAM_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[14px]">
                <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="tel:+33100000000"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Phone size={15} /> Nous contacter
            </a>
            <Link
              to="/demandes"
              className="rounded-md border border-border bg-card px-5 py-3 text-[13px] font-semibold transition-colors hover:bg-secondary"
            >
              Suivre un colis
            </Link>
          </div>
        </div>
        <img
          src={teamImg}
          alt="Agents FastSends remettant un colis à une cliente au comptoir de l'agence"
          width={1200}
          height={1000}
          loading="lazy"
          className="aspect-[6/5] w-full rounded-xl border border-border object-cover"
        />
      </div>
    </section>
  );
}

/* ---------------------------------- Avis ---------------------------------- */

function Avis() {
  return (
    <section id="avis" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHead index="06" label="Avis" title="Ils nous font confiance" />

      <div className="mt-8 inline-flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
        <span className="text-3xl font-semibold tracking-tight">{REVIEW_SCORE.score}</span>
        <span>
          <span className="flex gap-0.5 text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} fill="currentColor" />
            ))}
          </span>
          <span className="mt-1 block text-[12px] text-muted-foreground">
            {REVIEW_SCORE.count} {REVIEW_SCORE.source.toLowerCase()}
          </span>
        </span>
      </div>

      <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="bg-card p-6">
            <span className="flex gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </span>
            <blockquote className="mt-4 text-[14px] leading-relaxed">« {t.quote} »</blockquote>
            <figcaption className="mt-5 border-t border-border pt-4 text-[12px]">
              <span className="font-semibold">{t.name}</span>
              <span className="block text-muted-foreground">{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}


/* ---------------------------------- CTA ----------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary font-mono text-[11px] font-bold text-primary-foreground">
              FS
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-70">
              FastSends organise l'expédition de colis et l'achat sur place entre l'Europe et l'Afrique
              centrale, avec un suivi carton par carton.
            </p>
            <Link
              to="/demande"
              className="mt-6 inline-block rounded-md bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground"
            >
              Créer une demande
            </Link>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Services</p>
            <ul className="mt-4 space-y-2 text-sm opacity-80">
              {SERVICES.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Plateforme</p>
            <ul className="mt-4 space-y-2 text-sm opacity-80">
              <li>
                <Link to="/demandes">Mes demandes</Link>
              </li>
              <li>
                <Link to="/admin">Application agent</Link>
              </li>
              <li>
                <Link to="/hub">Hub entrepôt</Link>
              </li>
              <li>
                <Link to="/auth" search={{ next: "/" }}>
                  Connexion
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 font-mono text-[11px] opacity-40">
          © {new Date().getFullYear()} FastSends — France · Belgique · Congo · RD Congo
        </p>
      </div>
    </footer>
  );
}

/* ----------------------------- Bouton flottant ---------------------------- */

function FloatingHelp() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open ? (
        <div className="w-64 rounded-xl border border-border bg-card p-4 shadow-[0_18px_40px_-20px_hsl(215_32%_12%/0.5)]">
          <p className="text-[13px] font-semibold">Besoin d'aide ?</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Un agent vous répond du lundi au samedi, 8 h – 19 h.
          </p>
          <div className="mt-3 grid gap-2">
            <a
              href="https://wa.me/33100000000"
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-primary px-3 py-2.5 text-center text-[12px] font-semibold text-primary-foreground"
            >
              Écrire sur WhatsApp
            </a>
            <a
              href="tel:+33100000000"
              className="rounded-md border border-border px-3 py-2.5 text-center text-[12px] font-semibold"
            >
              Appeler le support
            </a>
            <Link
              to="/demande"
              className="rounded-md border border-border px-3 py-2.5 text-center text-[12px] font-semibold"
            >
              Créer une demande
            </Link>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Fermer l'aide" : "Ouvrir l'aide"}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-[13px] font-semibold text-primary-foreground shadow-[0_14px_30px_-12px_hsl(216_88%_45%/0.8)] transition-transform hover:scale-[1.03]"
      >
        {open ? <X size={17} /> : <MessageCircle size={17} />}
        <span className="hidden sm:inline">{open ? "Fermer" : "Aide & devis"}</span>
      </button>
    </div>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <QuickBar />
        <Acces />
        <Pourquoi />
        <Methode />
        <Services />
        <Tarifs />
        <Simulateur />
        <Offres />
        <Equipe />
        <Avis />
      </main>
      <Footer />
      <FloatingHelp />
    </div>
  );
}
