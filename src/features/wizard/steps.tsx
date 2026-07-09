import type { Dispatch, SetStateAction } from "react";
import type { WizardState, ServiceId, PaymentMethod, ShopItem, ProductLink, Parcel } from "./types";
import { SERVICES, WAREHOUSES_FR, WAREHOUSES_CG, COUNTRIES, PAYMENT_METHODS, warehousesFor } from "./services";
import { Field, TextInput, TextArea, Select, SegmentedToggle, YesNo, SectionTitle, RouteSchema } from "./ui";
import { makeId } from "./state";

type SetState = Dispatch<SetStateAction<WizardState>>;

/* --------------------------- STEP 1 : CONTACT --------------------------- */
export function ContactStep({ state, setState }: { state: WizardState; setState: SetState }) {
  const c = state.contact;
  const set = (patch: Partial<typeof c>) =>
    setState((s) => ({ ...s, contact: { ...s.contact, ...patch } }));
  return (
    <div className="space-y-6">
      <StepHeader
        title="À qui est ce colis ?"
        subtitle="Ces informations servent au suivi et à la coordination."
      />
      <div className="bg-card ring-1 ring-border rounded-2xl p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold">Le colis m'appartient</p>
            <p className="text-[11px] text-muted-foreground">On préremplit avec votre compte.</p>
          </div>
          <YesNo value={c.isOwner} onChange={(v) => set({ isOwner: v })} />
        </div>
      </div>
      <div className="space-y-4">
        <Field label="Prénom">
          <TextInput
            value={c.firstName}
            onChange={(e) => set({ firstName: e.target.value })}
            placeholder="Ex : Nadia"
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={c.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="nadia@example.com"
          />
        </Field>
        <Field label="Téléphone" hint="Format international recommandé : +242…">
          <TextInput
            value={c.phone}
            onChange={(e) => set({ phone: e.target.value })}
            placeholder="+242 06 123 4567"
          />
        </Field>
      </div>
    </div>
  );
}

/* --------------------------- STEP 2 : BESOIN --------------------------- */
export function ServiceStep({ state, setState }: { state: WizardState; setState: SetState }) {
  const filtered = SERVICES.filter((s) => s.audience.includes(state.accountType));
  return (
    <div className="space-y-6">
      <StepHeader title="Quel est votre besoin ?" subtitle="Un seul service, un formulaire adapté." />
      <div className="bg-card ring-1 ring-border rounded-2xl p-1 flex">
        <SegmentedToggle
          value={state.accountType}
          onChange={(v) => setState((s) => ({ ...s, accountType: v, serviceId: null }))}
          options={[
            { id: "particulier", label: "Particulier" },
            { id: "entreprise", label: "Entreprise" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((svc) => {
          const active = state.serviceId === svc.id;
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => setState((s) => ({ ...s, serviceId: svc.id }))}
              className={
                "relative text-left bg-card rounded-2xl p-4 transition-all active:scale-[0.98] " +
                (active ? "ring-2 ring-primary shadow-sm" : "ring-1 ring-border")
              }
            >
              {svc.badge ? (
                <span className="absolute top-3 right-3 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold uppercase tracking-tighter">
                  {svc.badge}
                </span>
              ) : null}
              <div
                className={
                  "size-12 rounded-lg mb-4 grid place-items-center " +
                  (active ? "bg-primary/10" : "bg-muted")
                }
              >
                <span
                  className={
                    "font-mono text-[9px] font-bold tracking-widest " +
                    (active ? "text-primary" : "text-muted-foreground")
                  }
                >
                  {svc.code}
                </span>
              </div>
              <h3 className={"font-bold text-sm mb-1 " + (active ? "text-primary" : "")}>{svc.name}</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">{svc.tagline}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------- STEP 3 : DETAILS --------------------------- */
export function DetailsStep({ state, setState }: { state: WizardState; setState: SetState }) {
  const svc = SERVICES.find((s) => s.id === state.serviceId);
  if (!svc) return null;
  return (
    <div className="space-y-6">
      <StepHeader title={"Détails · " + svc.name} subtitle={svc.description} />
      {state.serviceId === "delivery" && <DeliveryForm state={state} setState={setState} />}
      {state.serviceId === "shop_store" && <ShopStoreForm state={state} setState={setState} />}
      {state.serviceId === "shop_online" && <ShopOnlineForm state={state} setState={setState} />}
      {state.serviceId === "pickup" && <PickupForm state={state} setState={setState} />}
      {state.serviceId === "air_freight" && <FreightForm state={state} setState={setState} />}
      {state.serviceId === "elite_pro" && <EliteForm state={state} setState={setState} />}
    </div>
  );
}

function DeliveryForm({ state, setState }: { state: WizardState; setState: SetState }) {
  const d = state.delivery;
  const set = (patch: Partial<typeof d>) =>
    setState((s) => ({ ...s, delivery: { ...s.delivery, ...patch } }));
  const updateParcel = (id: string, patch: Partial<Parcel>) =>
    set({ parcels: d.parcels.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const setParcelCount = (raw: string) => {
    const n = Math.max(0, Math.min(50, parseInt(raw, 10) || 0));
    const current = d.parcels;
    let next = current;
    if (n > current.length) {
      const extra = Array.from({ length: n - current.length }, () => ({
        id: makeId(),
        reference: "",
        description: "",
      }));
      next = [...current, ...extra];
    } else if (n < current.length) {
      next = current.slice(0, n);
    }
    set({ parcelCount: raw === "" ? "" : String(n), parcels: next });
  };

  return (
    <div className="space-y-6">
      <SegmentedToggle
        value={d.mode}
        onChange={(v) => set({ mode: v })}
        options={[
          { id: "warehouse_delivery", label: "Livrer au dépôt" },
          { id: "self_drop", label: "Déposer moi-même" },
        ]}
      />

      <Field label="Entrepôt de réception">
        <Select
          value={d.warehouseFrom}
          onChange={(v) => set({ warehouseFrom: v })}
          options={WAREHOUSES_FR}
          placeholder="Où le colis arrive chez FastSends"
        />
      </Field>
      <Field label="Entrepôt de destination">
        <Select
          value={d.warehouseTo}
          onChange={(v) => set({ warehouseTo: v })}
          options={WAREHOUSES_CG}
          placeholder="Où FastSends livrera"
        />
      </Field>

      <RouteSchema
        from={WAREHOUSES_FR.find((w) => w.id === d.warehouseFrom)?.label || ""}
        to={WAREHOUSES_CG.find((w) => w.id === d.warehouseTo)?.label || ""}
      />

      <Field label="Date prévue de livraison">
        <TextInput
          type="date"
          value={d.plannedDate}
          onChange={(e) => set({ plannedDate: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4">
        <Field label="Bénéficiaire">
          <TextInput
            value={d.beneficiaryName}
            onChange={(e) => set({ beneficiaryName: e.target.value })}
            placeholder="Nom complet"
          />
        </Field>
        <Field label="Téléphone du bénéficiaire">
          <TextInput
            value={d.beneficiaryPhone}
            onChange={(e) => set({ beneficiaryPhone: e.target.value })}
            placeholder="+242 …"
          />
        </Field>
        <Field label="Adresse du bénéficiaire">
          <TextInput
            value={d.finalDestination}
            onChange={(e) => set({ finalDestination: e.target.value })}
            placeholder="Adresse de livraison finale"
          />
        </Field>
      </div>

      <Field label="Nombre de colis expédiés" hint="Nous générons automatiquement un bordereau par colis.">
        <TextInput
          type="number"
          min={0}
          max={50}
          value={d.parcelCount}
          onChange={(e) => setParcelCount(e.target.value)}
          placeholder="Ex : 3"
        />
      </Field>

      {d.parcels.length > 0 ? (
        <div className="space-y-3">
          <SectionTitle>Colis ({d.parcels.length})</SectionTitle>
          {d.parcels.map((p, i) => (
            <div key={p.id} className="bg-card ring-1 ring-border rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-9 shrink-0 bg-muted rounded grid place-items-center font-mono text-xs font-bold">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <TextInput
                  value={p.reference}
                  onChange={(e) => updateParcel(p.id, { reference: e.target.value })}
                  placeholder="N° bordereau"
                />
              </div>
              <TextInput
                value={p.description}
                onChange={(e) => updateParcel(p.id, { description: e.target.value })}
                placeholder="Contenu du colis"
              />
            </div>
          ))}
        </div>
      ) : null}

      <Field label="Commentaire libre">
        <TextArea rows={3} value={d.comments} onChange={(e) => set({ comments: e.target.value })} />
      </Field>
    </div>
  );
}

function ShopStoreForm({ state, setState }: { state: WizardState; setState: SetState }) {
  const d = state.shopStore;
  const set = (patch: Partial<typeof d>) =>
    setState((s) => ({ ...s, shopStore: { ...s.shopStore, ...patch } }));
  const addItem = () =>
    set({
      items: [
        ...d.items,
        { id: makeId(), name: "", size: "", color: "", quantity: 1, note: "" },
      ],
    });
  const upd = (id: string, patch: Partial<ShopItem>) =>
    set({ items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const rm = (id: string) => set({ items: d.items.filter((i) => i.id !== id) });

  return (
    <div className="space-y-6">
      <div className="p-4 bg-primary/5 ring-1 ring-primary/10 rounded-xl text-[11px] text-muted-foreground leading-relaxed">
        Le départ est fixé sur <span className="font-bold text-foreground">France</span> : nos équipes
        achètent uniquement dans nos zones de service.
      </div>

      <Field label="Magasins">
        <TextArea
          rows={2}
          value={d.stores}
          onChange={(e) => set({ stores: e.target.value })}
          placeholder="Ex : Zara Châtelet, Sephora Rivoli"
        />
      </Field>

      <div className="space-y-3">
        <SectionTitle
          aside={
            <button type="button" onClick={addItem} className="text-[11px] font-bold text-primary">
              + Ajouter un article
            </button>
          }
        >
          Articles ({d.items.length})
        </SectionTitle>
        {d.items.length === 0 ? (
          <button
            type="button"
            onClick={addItem}
            className="w-full bg-card ring-1 ring-dashed ring-border rounded-xl py-6 text-xs text-muted-foreground"
          >
            Ajoutez votre premier article
          </button>
        ) : (
          d.items.map((it, i) => (
            <div key={it.id} className="bg-card ring-1 ring-border rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">#{String(i + 1).padStart(2, "0")}</span>
                <TextInput
                  value={it.name}
                  onChange={(e) => upd(it.id, { name: e.target.value })}
                  placeholder="Nom de l'article"
                />
                <button
                  type="button"
                  onClick={() => rm(it.id)}
                  className="text-muted-foreground text-lg shrink-0 px-2"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <TextInput
                  value={it.size}
                  onChange={(e) => upd(it.id, { size: e.target.value })}
                  placeholder="Taille"
                />
                <TextInput
                  value={it.color}
                  onChange={(e) => upd(it.id, { color: e.target.value })}
                  placeholder="Couleur"
                />
                <TextInput
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) => upd(it.id, { quantity: Number(e.target.value) })}
                  placeholder="Qté"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Montant du panier (€)">
          <TextInput
            type="number"
            value={d.basketAmount}
            onChange={(e) => set({ basketAmount: e.target.value })}
            placeholder="450"
          />
        </Field>
        <Field label="Date shopping">
          <TextInput type="date" value={d.shoppingDate} onChange={(e) => set({ shoppingDate: e.target.value })} />
        </Field>
      </div>

      <Field label="Temps requis">
        <SegmentedToggle
          value={d.duration}
          onChange={(v) => set({ duration: v })}
          options={[
            { id: "half_day", label: "Demi-journée" },
            { id: "full_day", label: "Journée entière" },
          ]}
        />
      </Field>

      <Field label="Entrepôt de destination">
        <Select
          value={d.warehouseTo}
          onChange={(v) => set({ warehouseTo: v })}
          options={WAREHOUSES_CG}
          placeholder="Congo uniquement"
        />
      </Field>
    </div>
  );
}

function ShopOnlineForm({ state, setState }: { state: WizardState; setState: SetState }) {
  const d = state.shopOnline;
  const set = (patch: Partial<typeof d>) =>
    setState((s) => ({ ...s, shopOnline: { ...s.shopOnline, ...patch } }));
  const addLink = () =>
    set({
      links: [...d.links, { id: makeId(), url: "", quantity: 1, note: "", estimatedPrice: "" }],
    });
  const upd = (id: string, patch: Partial<ProductLink>) =>
    set({ links: d.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  const rm = (id: string) => set({ links: d.links.filter((l) => l.id !== id) });
  const subtotal = d.links.reduce(
    (acc, l) => acc + (parseFloat(l.estimatedPrice) || 0) * (l.quantity || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="p-4 bg-primary/5 ring-1 ring-primary/10 rounded-xl text-[11px] text-muted-foreground leading-relaxed">
        Départ France · Destination Congo. Nous commandons puis expédions vers l'entrepôt choisi.
      </div>

      <div className="space-y-3">
        <SectionTitle
          aside={
            <button type="button" onClick={addLink} className="text-[11px] font-bold text-primary">
              + Ajouter un lien
            </button>
          }
        >
          Liens produits ({d.links.length})
        </SectionTitle>
        {d.links.length === 0 ? (
          <button
            type="button"
            onClick={addLink}
            className="w-full bg-card ring-1 ring-dashed ring-border rounded-xl py-6 text-xs text-muted-foreground"
          >
            Ajoutez votre premier lien produit
          </button>
        ) : (
          d.links.map((l) => (
            <div key={l.id} className="bg-card ring-1 ring-border rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <TextInput
                  value={l.url}
                  onChange={(e) => upd(l.id, { url: e.target.value })}
                  placeholder="https://…"
                />
                <button
                  type="button"
                  onClick={() => rm(l.id)}
                  className="text-muted-foreground text-lg shrink-0 px-2"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TextInput
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => upd(l.id, { quantity: Number(e.target.value) })}
                  placeholder="Qté"
                />
                <TextInput
                  type="number"
                  value={l.estimatedPrice}
                  onChange={(e) => upd(l.id, { estimatedPrice: e.target.value })}
                  placeholder="Prix unitaire €"
                />
              </div>
              <TextInput
                value={l.note}
                onChange={(e) => upd(l.id, { note: e.target.value })}
                placeholder="Note (taille, couleur, variante)"
              />
            </div>
          ))
        )}
        {d.links.length > 0 ? (
          <div className="flex justify-between text-xs bg-muted rounded-lg px-3 py-2">
            <span className="text-muted-foreground">Sous-total indicatif</span>
            <span className="font-mono font-bold">{subtotal.toFixed(2)} €</span>
          </div>
        ) : null}
      </div>

      <Field label="Coût total du panier (€)" hint="Hors frais FastSends.">
        <TextInput
          type="number"
          value={d.basketAmount}
          onChange={(e) => set({ basketAmount: e.target.value })}
          placeholder="Ex : 320"
        />
      </Field>

      <Field label="Mode de transfert d'argent">
        <Select
          value={d.transferMethod}
          onChange={(v) => set({ transferMethod: v as PaymentMethod })}
          options={PAYMENT_METHODS.map((p) => ({ id: p.id, label: p.label }))}
        />
      </Field>

      <div className="bg-card ring-1 ring-border rounded-2xl p-4 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold">Assurance colis</p>
            <p className="text-[11px] text-muted-foreground">
              Couvre perte et casse jusqu'à la valeur déclarée. +3% du panier.
            </p>
          </div>
          <YesNo value={d.insurance} onChange={(v) => set({ insurance: v })} />
        </div>
      </div>

      <Field label="Entrepôt de destination">
        <Select value={d.warehouseTo} onChange={(v) => set({ warehouseTo: v })} options={WAREHOUSES_CG} />
      </Field>
    </div>
  );
}

function PickupForm({ state, setState }: { state: WizardState; setState: SetState }) {
  const d = state.pickup;
  const set = (patch: Partial<typeof d>) =>
    setState((s) => ({ ...s, pickup: { ...s.pickup, ...patch } }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Pays de récupération">
          <Select
            value={d.countryFrom}
            onChange={(v) => set({ countryFrom: v, warehouseFrom: "" })}
            options={COUNTRIES}
          />
        </Field>
        <Field label="Pays de destination">
          <Select
            value={d.countryTo}
            onChange={(v) => set({ countryTo: v, warehouseTo: "" })}
            options={COUNTRIES}
          />
        </Field>
      </div>

      {d.countryFrom && (
        <Field label="Entrepôt de traitement (départ)">
          <Select
            value={d.warehouseFrom}
            onChange={(v) => set({ warehouseFrom: v })}
            options={warehousesFor(d.countryFrom)}
          />
        </Field>
      )}
      {d.countryTo && (
        <Field label="Entrepôt de traitement (arrivée)">
          <Select
            value={d.warehouseTo}
            onChange={(v) => set({ warehouseTo: v })}
            options={warehousesFor(d.countryTo)}
          />
        </Field>
      )}

      <RouteSchema
        from={warehousesFor(d.countryFrom).find((w) => w.id === d.warehouseFrom)?.label || ""}
        to={warehousesFor(d.countryTo).find((w) => w.id === d.warehouseTo)?.label || ""}
      />

      <Field label="Adresse de récupération">
        <TextArea
          rows={2}
          value={d.address}
          onChange={(e) => set({ address: e.target.value })}
          placeholder="Numéro, rue, code postal, ville"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <TextInput type="date" value={d.plannedDate} onChange={(e) => set({ plannedDate: e.target.value })} />
        </Field>
        <Field label="Heure">
          <TextInput type="time" value={d.plannedTime} onChange={(e) => set({ plannedTime: e.target.value })} />
        </Field>
      </div>

      <Field label="Contact sur place">
        <TextInput value={d.contactName} onChange={(e) => set({ contactName: e.target.value })} placeholder="Nom" />
      </Field>
      <Field label="Téléphone / email de coordination">
        <TextInput value={d.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
      </Field>

      <Field label="Description du colis">
        <TextArea rows={2} value={d.description} onChange={(e) => set({ description: e.target.value })} />
      </Field>

      <Field label="Destination finale (adresse client)">
        <TextInput
          value={d.finalDestination}
          onChange={(e) => set({ finalDestination: e.target.value })}
          placeholder="Adresse de livraison finale"
        />
      </Field>
    </div>
  );
}

function FreightForm({ state, setState }: { state: WizardState; setState: SetState }) {
  const d = state.freight;
  const set = (patch: Partial<typeof d>) =>
    setState((s) => ({ ...s, freight: { ...s.freight, ...patch } }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Pays de départ">
          <Select value={d.countryFrom} onChange={(v) => set({ countryFrom: v, warehouseFrom: "" })} options={COUNTRIES} />
        </Field>
        <Field label="Pays de destination">
          <Select value={d.countryTo} onChange={(v) => set({ countryTo: v, warehouseTo: "" })} options={COUNTRIES} />
        </Field>
      </div>
      {d.countryFrom && (
        <Field label="Entrepôt de départ">
          <Select value={d.warehouseFrom} onChange={(v) => set({ warehouseFrom: v })} options={warehousesFor(d.countryFrom)} />
        </Field>
      )}
      {d.countryTo && (
        <Field label="Entrepôt d'arrivée">
          <Select value={d.warehouseTo} onChange={(v) => set({ warehouseTo: v })} options={warehousesFor(d.countryTo)} />
        </Field>
      )}

      <Field label="Description du colis">
        <TextArea rows={2} value={d.description} onChange={(e) => set({ description: e.target.value })} placeholder="Nature de la marchandise" />
      </Field>

      <Field label="Poids réel (kg)">
        <TextInput type="number" value={d.weight} onChange={(e) => set({ weight: e.target.value })} placeholder="12.5" />
      </Field>

      <Field label="Dimensions (cm)" hint="Poids volumétrique = L × l × h ÷ 6000">
        <div className="flex gap-2 items-center">
          <TextInput type="number" value={d.length} onChange={(e) => set({ length: e.target.value })} placeholder="L" className="text-center" />
          <span className="text-muted-foreground font-bold">×</span>
          <TextInput type="number" value={d.width} onChange={(e) => set({ width: e.target.value })} placeholder="l" className="text-center" />
          <span className="text-muted-foreground font-bold">×</span>
          <TextInput type="number" value={d.height} onChange={(e) => set({ height: e.target.value })} placeholder="h" className="text-center" />
        </div>
      </Field>

      <Field label="Valeur estimée (€)">
        <TextInput type="number" value={d.value} onChange={(e) => set({ value: e.target.value })} placeholder="450" />
      </Field>

      <div className="bg-card ring-1 ring-border rounded-2xl p-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold">Groupage souhaité</p>
          <p className="text-[11px] text-muted-foreground">Regroupement de plusieurs colis pour économiser.</p>
        </div>
        <YesNo value={d.grouping} onChange={(v) => set({ grouping: v })} />
      </div>
    </div>
  );
}

function EliteForm({ state, setState }: { state: WizardState; setState: SetState }) {
  const d = state.elite;
  const set = (patch: Partial<typeof d>) =>
    setState((s) => ({ ...s, elite: { ...s.elite, ...patch } }));

  return (
    <div className="space-y-6">
      <div className="p-4 bg-foreground text-background rounded-2xl">
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Elite Pro</p>
        <p className="text-sm leading-relaxed">
          Notre équipe vous contacte sous 24h avec un plan logistique personnalisé.
        </p>
      </div>

      <details open className="bg-card ring-1 ring-border rounded-2xl overflow-hidden">
        <summary className="list-none p-4 flex justify-between items-center cursor-pointer">
          <span className="text-sm font-bold">Entreprise</span>
          <span className="text-xs text-muted-foreground">1/4</span>
        </summary>
        <div className="p-4 pt-0 space-y-4 border-t border-border">
          <Field label="Nom de l'entreprise">
            <TextInput value={d.companyName} onChange={(e) => set({ companyName: e.target.value })} />
          </Field>
          <Field label="Email pro">
            <TextInput type="email" value={d.email} onChange={(e) => set({ email: e.target.value })} />
          </Field>
          <Field label="WhatsApp">
            <TextInput value={d.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
          </Field>
        </div>
      </details>

      <details className="bg-card ring-1 ring-border rounded-2xl overflow-hidden">
        <summary className="list-none p-4 flex justify-between items-center cursor-pointer">
          <span className="text-sm font-bold">Produits & fournisseurs</span>
          <span className="text-xs text-muted-foreground">2/4</span>
        </summary>
        <div className="p-4 pt-0 space-y-4 border-t border-border">
          <Field label="Types de produits">
            <TextArea rows={2} value={d.productTypes} onChange={(e) => set({ productTypes: e.target.value })} />
          </Field>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold">Fournisseurs en France</p>
            <YesNo value={d.hasSuppliers} onChange={(v) => set({ hasSuppliers: v })} />
          </div>
          {d.hasSuppliers && (
            <Field label="Détails fournisseurs">
              <TextArea rows={2} value={d.suppliersDetails} onChange={(e) => set({ suppliersDetails: e.target.value })} />
            </Field>
          )}
        </div>
      </details>

      <details className="bg-card ring-1 ring-border rounded-2xl overflow-hidden">
        <summary className="list-none p-4 flex justify-between items-center cursor-pointer">
          <span className="text-sm font-bold">Enlèvement & colis</span>
          <span className="text-xs text-muted-foreground">3/4</span>
        </summary>
        <div className="p-4 pt-0 space-y-4 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold">Demande d'enlèvement</p>
            <YesNo value={d.wantsPickup} onChange={(v) => set({ wantsPickup: v })} />
          </div>
          {d.wantsPickup && (
            <Field label="Adresse d'enlèvement">
              <TextArea rows={2} value={d.pickupAddress} onChange={(e) => set({ pickupAddress: e.target.value })} />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre de colis">
              <TextInput type="number" value={d.parcelCount} onChange={(e) => set({ parcelCount: e.target.value })} />
            </Field>
            <Field label="Poids total (kg)">
              <TextInput type="number" value={d.totalWeight} onChange={(e) => set({ totalWeight: e.target.value })} />
            </Field>
          </div>
        </div>
      </details>

      <details className="bg-card ring-1 ring-border rounded-2xl overflow-hidden">
        <summary className="list-none p-4 flex justify-between items-center cursor-pointer">
          <span className="text-sm font-bold">Stockage & fréquence</span>
          <span className="text-xs text-muted-foreground">4/4</span>
        </summary>
        <div className="p-4 pt-0 space-y-4 border-t border-border">
          <Field label="Stockage">
            <SegmentedToggle
              value={d.storageMode}
              onChange={(v) => set({ storageMode: v })}
              options={[
                { id: "consolidate", label: "Regroupement" },
                { id: "immediate", label: "Expédition immédiate" },
              ]}
            />
          </Field>
          <Field label="Fréquence d'envoi">
            <Select
              value={d.frequency}
              onChange={(v) => set({ frequency: v as typeof d.frequency })}
              options={[
                { id: "weekly", label: "Hebdomadaire" },
                { id: "biweekly", label: "Bimensuelle" },
                { id: "monthly", label: "Mensuelle" },
                { id: "one_off", label: "Ponctuelle" },
              ]}
            />
          </Field>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold">Devis personnalisé</p>
            <YesNo value={d.customQuote} onChange={(v) => set({ customQuote: v })} />
          </div>
          <Field label="Instructions spéciales">
            <TextArea rows={2} value={d.instructions} onChange={(e) => set({ instructions: e.target.value })} />
          </Field>
        </div>
      </details>
    </div>
  );
}

/* --------------------------- STEP 4 : PAIEMENT --------------------------- */
export function PaymentStep({ state, setState }: { state: WizardState; setState: SetState }) {
  return (
    <div className="space-y-6">
      <StepHeader title="Paiement & code promo" subtitle="Choisissez comment régler votre expédition." />

      <div className="space-y-2">
        {PAYMENT_METHODS.map((p) => {
          const active = state.paymentMethod === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setState((s) => ({ ...s, paymentMethod: p.id }))}
              className={
                "w-full text-left flex items-center justify-between p-4 rounded-2xl bg-card transition-all " +
                (active ? "ring-2 ring-primary" : "ring-1 ring-border")
              }
            >
              <span className="text-sm font-bold">{p.label}</span>
              <span
                className={
                  "size-4 rounded-full border-4 " +
                  (active ? "border-primary bg-background" : "border-border bg-background")
                }
              />
            </button>
          );
        })}
      </div>

      <Field label="Code promo" hint="Optionnel">
        <TextInput
          value={state.promoCode}
          onChange={(e) => setState((s) => ({ ...s, promoCode: e.target.value }))}
          placeholder="Ex : FSNEW10"
        />
      </Field>
    </div>
  );
}

/* --------------------------- STEP 5 : RECAP --------------------------- */
export function SummaryStep({
  state,
  onEdit,
}: {
  state: WizardState;
  onEdit: (step: number) => void;
}) {
  const svc = SERVICES.find((s) => s.id === state.serviceId);
  return (
    <div className="space-y-6">
      <StepHeader title="Vérification finale" subtitle="Confirmez les détails avant l'expédition." />

      <div className="divide-y divide-border ring-1 ring-border rounded-2xl overflow-hidden bg-card">
        <RecapRow label="Contact" value={state.contact.firstName || "—"} onEdit={() => onEdit(1)} />
        <RecapRow label="Service" value={svc?.name ?? "—"} onEdit={() => onEdit(2)} />
        <RecapRow label="Détails" value={detailSummary(state)} onEdit={() => onEdit(3)} />
        <RecapRow
          label="Paiement"
          value={PAYMENT_METHODS.find((p) => p.id === state.paymentMethod)?.label ?? "—"}
          onEdit={() => onEdit(4)}
        />
        <RecapRow
          label="Code promo"
          value={state.promoCode || "Aucun"}
          onEdit={() => onEdit(4)}
        />
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Le montant final peut varier après vérification réelle en entrepôt (pesée, mesures, conformité).
      </p>
    </div>
  );
}

function detailSummary(s: WizardState): string {
  switch (s.serviceId) {
    case "delivery":
      return `${s.delivery.parcels.length} colis · ${s.delivery.reference || "sans réf."}`;
    case "shop_store":
      return `${s.shopStore.items.length} articles · ${s.shopStore.basketAmount || 0} €`;
    case "shop_online":
      return `${s.shopOnline.links.length} liens · ${s.shopOnline.basketAmount || 0} €`;
    case "pickup":
      return `${s.pickup.address || "adresse à préciser"}`;
    case "air_freight":
      return `${s.freight.weight || 0} kg · ${s.freight.length}×${s.freight.width}×${s.freight.height} cm`;
    case "elite_pro":
      return `${s.elite.companyName || "entreprise"} · ${s.elite.frequency}`;
    default:
      return "—";
  }
}

function RecapRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="p-4 flex justify-between items-center gap-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">{label}</p>
        <p className="text-sm font-bold truncate">{value}</p>
      </div>
      <button type="button" onClick={onEdit} className="text-xs font-bold text-primary shrink-0">
        Modifier
      </button>
    </div>
  );
}

/* --------------------------- Reusable header --------------------------- */
export function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="animate-[fadeIn_0.4s_ease-out_both]">
      <h1 className="text-2xl font-extrabold tracking-tight text-balance mb-1">{title}</h1>
      {subtitle ? (
        <p className="text-muted-foreground text-sm text-pretty leading-relaxed">{subtitle}</p>
      ) : null}
    </header>
  );
}

/* --------------------------- Confirmation --------------------------- */
export function ConfirmationStep({ state }: { state: WizardState }) {
  const svc = SERVICES.find((s) => s.id === state.serviceId);
  return (
    <div className="space-y-8 py-8 text-center">
      <div className="mx-auto size-20 rounded-full bg-primary/10 grid place-items-center">
        <span className="text-primary font-mono text-2xl font-bold">✓</span>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Demande envoyée</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Votre demande <span className="font-mono font-bold text-foreground">{svc?.code}</span> a été
          transmise à FastSends. Vous recevrez une confirmation par email et WhatsApp.
        </p>
      </div>
      <div className="bg-card ring-1 ring-border rounded-2xl p-4 mx-auto max-w-xs">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
          Numéro de suivi
        </p>
        <p className="font-mono text-lg font-bold">
          FS-{Math.random().toString(36).slice(2, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
}