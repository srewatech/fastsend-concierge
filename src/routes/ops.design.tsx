import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardList,
  Home,
  Package,
  ScanLine,
  Search,
  User,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge, SectionCard, KeyValue, type Tone } from "@/features/demands/ui";

export const Route = createFileRoute("/ops/design")({
  head: () => ({
    meta: [
      { title: "Design system Ops · FastSends" },
      {
        name: "description",
        content: "Fondations, composants et règles d'usage de l'app manager et du Hub entrepôt FastSends.",
      },
      { property: "og:title", content: "Design system Ops · FastSends" },
      {
        property: "og:description",
        content: "Couleurs, typographie, statuts et composants des interfaces opérationnelles FastSends.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OpsDesignSystem,
});

const COLORS: { name: string; cls: string; usage: string }[] = [
  { name: "primary", cls: "bg-primary", usage: "Action principale, scan, progression" },
  { name: "foreground", cls: "bg-foreground", usage: "Texte, boutons forts, cartes résumé" },
  { name: "background", cls: "bg-background ring-1 ring-border", usage: "Fond d'écran" },
  { name: "card", cls: "bg-card ring-1 ring-border", usage: "Cartes, listes, champs" },
  { name: "muted", cls: "bg-muted", usage: "Fonds secondaires, pistes de barre" },
  { name: "success", cls: "bg-success", usage: "Reçu, livré, contrôle OK" },
  { name: "warning", cls: "bg-warning", usage: "Paiement attendu, douane, à vérifier" },
  { name: "destructive", cls: "bg-destructive", usage: "Anomalie, annulation, écart de poids" },
];

const TONES: { tone: Tone; label: string; when: string }[] = [
  { tone: "neutral", label: "Attendu", when: "En attente, pas encore d'action" },
  { tone: "info", label: "En entrepôt", when: "En cours de traitement" },
  { tone: "warn", label: "Paiement attendu", when: "Action client / contrôle requis" },
  { tone: "success", label: "Reçu", when: "Étape validée" },
  { tone: "danger", label: "Anomalie", when: "Bloquant, intervention manager" },
];

function OpsDesignSystem() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              FastSends · Ops
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight mt-1">Design system opérationnel</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Règles communes à l'app manager (mobile) et au Hub entrepôt (desktop). Dense, lisible
              en entrepôt, statuts toujours explicites.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin" className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-bold">
              App manager
            </Link>
            <Link to="/hub" className="px-4 py-2 rounded-lg bg-card ring-1 ring-border text-xs font-bold">
              Hub
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-14">
        <Block n="01" title="Principes">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ["Lisible à bout de bras", "Textes ≥ 14px pour l'info clé, cibles tactiles ≥ 44px, contraste fort."],
              ["Le statut d'abord", "Chaque colis, demande ou valise affiche un badge de statut à droite."],
              ["Codes en mono", "Références FS-XXX-00000, tracking, poids et heures en JetBrains Mono."],
            ].map(([t, d]) => (
              <div key={t} className="bg-card ring-1 ring-border rounded-2xl p-5">
                <p className="font-bold">{t}</p>
                <p className="text-sm text-muted-foreground mt-1">{d}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block n="02" title="Couleurs">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLORS.map((c) => (
              <div key={c.name} className="bg-card ring-1 ring-border rounded-2xl overflow-hidden">
                <div className={"h-20 " + c.cls} />
                <div className="p-3">
                  <p className="font-mono text-xs font-bold">--{c.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block n="03" title="Typographie">
          <div className="bg-card ring-1 ring-border rounded-2xl divide-y divide-border">
            <TypeRow spec="Display · Bricolage 36/700" sample={<span className="font-display text-4xl font-bold tracking-tight">Suivi entrepôt</span>} />
            <TypeRow spec="Titre écran · Inter 24/700" sample={<span className="text-2xl font-bold tracking-tight">Vue opérationnelle</span>} />
            <TypeRow spec="Titre carte · Inter 14/700" sample={<span className="text-sm font-bold">Carton chaussures Nike</span>} />
            <TypeRow spec="Corps · Inter 14/400" sample={<span className="text-sm">Colis reçu et pesé à l'entrepôt de Paris.</span>} />
            <TypeRow spec="Eyebrow · Inter 10/700 caps" sample={<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Entrepôt actif</span>} />
            <TypeRow spec="Données · Mono 11" sample={<span className="font-mono text-[11px]">FS-DLV-04821 · 1Z999AA10123 · 2.4 kg</span>} />
          </div>
        </Block>

        <Block n="04" title="Statuts">
          <div className="bg-card ring-1 ring-border rounded-2xl divide-y divide-border">
            {TONES.map((t) => (
              <div key={t.tone} className="flex items-center gap-6 px-5 py-3">
                <div className="w-44"><StatusBadge tone={t.tone}>{t.label}</StatusBadge></div>
                <span className="font-mono text-[11px] text-muted-foreground w-20">{t.tone}</span>
                <span className="text-sm">{t.when}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block n="05" title="Boutons & champs">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card ring-1 ring-border rounded-2xl p-5 space-y-3">
              <button className="w-full bg-primary text-primary-foreground font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2">
                <ScanLine className="size-4" /> Scanner un bordereau
              </button>
              <button className="w-full bg-foreground text-background font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2">
                <Package className="size-3.5" /> Marquer comme reçu
              </button>
              <button className="w-full bg-card ring-1 ring-border font-bold text-xs py-2.5 rounded-lg">
                Action secondaire
              </button>
              <button className="w-full bg-destructive/10 text-destructive ring-1 ring-destructive/20 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2">
                <AlertTriangle className="size-3.5" /> Signaler une anomalie
              </button>
            </div>
            <div className="bg-card ring-1 ring-border rounded-2xl p-5 space-y-3">
              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Référence, client…" className="w-full bg-background ring-1 ring-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-1.5">
                <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-foreground text-background">Attendus</span>
                <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-card ring-1 ring-border text-muted-foreground">Reçus 24h</span>
                <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-card ring-1 ring-border text-muted-foreground">Anomalies</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full w-2/3 bg-primary" /></div>
                <span className="font-mono text-[11px] font-bold text-muted-foreground">2/3</span>
              </div>
            </div>
          </div>
        </Block>

        <Block n="06" title="Composants">
          <div className="grid md:grid-cols-3 gap-4 items-start">
            <div className="space-y-2">
              <Label>Ligne colis</Label>
              <div className="bg-card ring-1 ring-border rounded-xl p-3 flex items-start gap-3">
                <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">Carton chaussures</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">FS-DLV-04821-1 · 2.4 kg</p>
                </div>
                <StatusBadge tone="success">Reçu</StatusBadge>
              </div>
              <div className="bg-card ring-1 ring-border rounded-xl p-3 flex items-start gap-3">
                <Circle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">Sac vêtements</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">FS-DLV-04821-2</p>
                </div>
                <StatusBadge>Attendu</StatusBadge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Carte résumé</Label>
              <div className="bg-foreground text-background rounded-2xl p-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-70 mb-2">
                  <span>Paris</span><span>→</span><span>Abidjan</span>
                </div>
                <div className="pt-3 border-t border-background/10">
                  <p className="text-[10px] uppercase tracking-widest opacity-60">Progression</p>
                  <p className="font-mono text-xl font-bold">2/3 colis</p>
                </div>
              </div>
              <Label>KPI</Label>
              <div className="bg-card ring-1 ring-border rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reçus aujourd'hui</p>
                <p className="font-display text-3xl font-bold mt-1">24</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Section détail</Label>
              <SectionCard title="Bénéficiaire" aside={<StatusBadge tone="info">Vérifié</StatusBadge>}>
                <div>
                  <KeyValue label="Nom" value="Awa Koné" />
                  <KeyValue label="Ville" value="Abidjan" />
                  <KeyValue label="Tél." value={<span className="font-mono">+225 07 00 00 00</span>} />
                </div>
              </SectionCard>
            </div>
          </div>
        </Block>

        <Block n="07" title="Navigation">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mobile · barre d'onglets</Label>
              <div className="bg-card ring-1 ring-border rounded-2xl pt-8">
                <ul className="grid grid-cols-5 items-end px-2 pt-2 pb-4 border-t border-border">
                  {[Home, Package, ScanLine, ClipboardList, User].map((I, i) =>
                    i === 2 ? (
                      <li key={i} className="flex justify-center">
                        <span className="-mt-8 size-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg ring-4 ring-card"><I className="size-6" strokeWidth={2.5} /></span>
                      </li>
                    ) : (
                      <li key={i} className={"flex flex-col items-center gap-1 " + (i === 0 ? "text-foreground" : "text-muted-foreground")}>
                        <I className="size-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{["Accueil", "Colis", "", "Demandes", "Profil"][i]}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mobile · en-tête de détail</Label>
              <div className="bg-card ring-1 ring-border rounded-2xl p-4 flex items-center gap-3">
                <span className="size-9 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-4" /></span>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground">FS-DLV-04821</p>
                  <p className="text-lg font-bold tracking-tight">Moussa Diallo</p>
                </div>
              </div>
              <Label>Hub · fil d'Ariane</Label>
              <div className="bg-card ring-1 ring-border rounded-2xl px-4 py-3 text-xs font-mono text-muted-foreground">
                Hub / Valises / <span className="text-foreground font-bold">VAL-CDG-0042</span>
              </div>
            </div>
          </div>
        </Block>

        <Block n="08" title="Espacements & formes">
          <div className="bg-card ring-1 ring-border rounded-2xl p-5 grid sm:grid-cols-4 gap-4 text-sm">
            {[
              ["Marge écran", "20px (px-5)"],
              ["Écart liste", "8px (space-y-2)"],
              ["Rayon ligne / champ", "12px (rounded-xl)"],
              ["Rayon carte", "16px (rounded-2xl)"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k}</p>
                <p className="font-mono mt-1">{v}</p>
              </div>
            ))}
          </div>
        </Block>
      </main>
    </div>
  );
}

function Block({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-mono text-xs text-primary font-bold">{n}</span>
        <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function TypeRow({ spec, sample }: { spec: string; sample: ReactNode }) {
  return (
    <div className="flex items-center gap-6 px-5 py-4">
      <span className="font-mono text-[11px] text-muted-foreground w-52 shrink-0">{spec}</span>
      {sample}
    </div>
  );
}
