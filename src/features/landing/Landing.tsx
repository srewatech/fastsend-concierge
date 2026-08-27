import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SERVICES } from "@/features/wizard/services";
import type { ServiceId } from "@/features/wizard/types";
import {
  CORRIDORS,
  OFFERS,
  OPTIONS,
  PROCESS,
  PROOF,
  TESTIMONIALS,
  volumetricWeight,
  type OptionId,
} from "./data";
import heroImg from "@/assets/hero-courier.jpg";

const NAV = [
  { href: "#services", label: "Services" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#simulateur", label: "Estimation" },
  { href: "#offres", label: "Offres" },
  { href: "#methode", label: "Méthode" },
];

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
        <h2 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-tight md:text-[2.6rem]">{title}</h2>
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

function Hero() {
  return (
    <section id="top" className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.05fr_1fr] md:items-center md:py-20">
        <div>
          <Label>France · Belgique → Congo · RD Congo</Label>
          <h1 className="mt-4 text-[2.6rem] font-semibold leading-[1.03] tracking-tight md:text-6xl">
            Vos colis partent,
            <br />
            vous savez où ils sont.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Enlèvement, achats sur place, groupage et fret aérien. Chaque demande reçoit un identifiant, chaque
            carton un statut — de l'entrepôt de départ jusqu'à la remise.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/demande"
              className="rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Créer une demande
            </Link>
            <a
              href="#simulateur"
              className="rounded-md border border-border px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Estimer le coût
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-4">
            {PROOF.map((p) => (
              <div key={p.label}>
                <dt className="text-xl font-semibold tracking-tight">{p.value}</dt>
                <dd className="mt-1 text-[11px] leading-snug text-muted-foreground">{p.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative">
          <img
            src={heroImg}
            alt="Coursier FastSends chargeant des colis dans un utilitaire"
            width={1600}
            height={1200}
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
          <div className="absolute bottom-4 left-4 right-4 rounded-md border border-border bg-background/95 p-4 backdrop-blur sm:right-auto sm:w-64">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Dernier départ
            </p>
            <p className="mt-1 font-mono text-sm font-semibold">FS-DLS-00421</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Paris CDG → Brazzaville · 12 colis · en transit
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Services -------------------------------- */

function Services() {
  const [audience, setAudience] = useState<"particulier" | "entreprise">("particulier");
  const list = useMemo(() => SERVICES.filter((s) => s.audience.includes(audience)), [audience]);

  return (
    <section id="services" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHead
        index="01"
        label="Catalogue"
        title="Six services, un seul parcours"
        intro="Le catalogue s'adapte à votre profil. Chaque service ouvre un formulaire dédié — pas de champs inutiles."
        action={
          <div className="inline-flex rounded-md border border-border p-1">
            {(["particulier", "entreprise"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                className={
                  "rounded px-4 py-2 text-[12px] font-semibold capitalize transition-colors " +
                  (audience === a
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {a}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <Link
            key={s.id}
            to="/demande"
            className="group flex flex-col bg-card p-6 transition-colors hover:bg-secondary"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{s.code}</span>
              {s.badge ? (
                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                  {s.badge}
                </span>
              ) : null}
            </div>
            <h3 className="mt-6 text-lg font-semibold tracking-tight">{s.name}</h3>
            <p className="mt-1 text-[13px] font-medium text-primary">{s.tagline}</p>
            <p className="mt-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">{s.description}</p>
            <span className="mt-6 text-[12px] font-semibold text-foreground group-hover:text-primary">
              Commencer →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- Tarifs --------------------------------- */

function Tarifs() {
  return (
    <section id="tarifs" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <SectionHead
          index="02"
          label="Grille"
          title="Des prix au kilo, sans surprise"
          intro="Le montant définitif est confirmé après pesée en entrepôt. La grille ci-dessous sert de référence."
        />
        <div className="mt-10 overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="px-5 py-3 font-normal">Corridor</th>
                <th className="px-5 py-3 font-normal">Prix / kg</th>
                <th className="hidden px-5 py-3 font-normal sm:table-cell">Frais de dossier</th>
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
                  <td className="px-5 py-4 font-mono font-semibold">{c.pricePerKg.toFixed(2)} €</td>
                  <td className="hidden px-5 py-4 font-mono text-muted-foreground sm:table-cell">
                    {c.handling.toFixed(2)} €
                  </td>
                  <td className="px-5 py-4 text-right text-muted-foreground">{c.leadTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[12px] text-muted-foreground">
          Poids facturé = max(poids réel, L×l×H ÷ 6000). Groupage dégressif à partir de 30 kg.
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
            className="mt-6 rounded-md bg-primary px-4 py-3.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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

/* --------------------------------- Méthode -------------------------------- */

function Methode() {
  return (
    <section id="methode" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <SectionHead index="05" label="Méthode" title="Comment ça marche" />
      <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
        {PROCESS.map((p) => (
          <li key={p.n} className="bg-card p-6">
            <span className="font-mono text-[11px] text-primary">{p.n}</span>
            <h3 className="mt-4 text-base font-semibold tracking-tight">{p.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="bg-card p-6">
            <blockquote className="text-[14px] leading-relaxed">« {t.quote} »</blockquote>
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

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Services />
        <Tarifs />
        <Simulateur />
        <Offres />
        <Methode />
      </main>
      <Footer />
    </div>
  );
}
