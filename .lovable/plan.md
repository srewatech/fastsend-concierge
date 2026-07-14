# Hub Entrepôt (interface desktop opérateur)

En parallèle de l'app mobile `/admin/*` (scan terrain), on ajoute un **hub desktop** `/hub/*` pour la vue large : superviseurs et opérateurs qui traitent les colis en volume, préparent les valises, gèrent les départs et les arrivées.

## Architecture des routes

```text
/hub                       -> Dashboard entrepôt (KPI + raccourcis)
/hub/reception             -> Poste de réception (scan + recherche + IA/OCR)
/hub/parcels               -> Colis reçus (groupés par demande, actions lot)
/hub/valises               -> Liste des valises (préparation, en transit, livrées)
/hub/valises/$id           -> Détail valise (contenu, scellé, manifeste, tracking)
/hub/departs               -> Chargement / départ (préparation d'un vol/camion)
/hub/arrivees              -> Arrivée / contrôle destination (déballage valise)
```

Layout `/hub` : sidebar gauche fixe (logo + nav + entrepôt courant + user), header top avec breadcrumb + recherche globale + notifs, contenu principal fluide. Réutilise `AdminSessionProvider` (même contexte entrepôt que l'app mobile) pour que scan mobile et hub desktop partagent les mêmes données.

## 1. Dashboard `/hub`

- Bandeau KPI (6 cards) : Colis attendus · Reçus 24h · En attente paiement · Valises en préparation · En transit · Arrivées à contrôler
- Raccourcis gros boutons : **Réceptionner** · **Préparer une valise** · **Enregistrer un départ** · **Contrôler une arrivée**
- 2 colonnes :
  - **Activité en direct** : timeline (scan reçu, valise scellée, départ, arrivée) avec entrepôt et opérateur
  - **Alertes** : demandes bloquées, paiements en attente, colis orphelins, valises en retard
- Mini-graph : réceptions / jour sur 7 jours

## 2. Réception `/hub/reception`

Vue desktop du même flux que l'app mobile mais orientée poste de travail :
- Colonne gauche : file d'attente des colis à traiter (bordereaux photographiés depuis mobile ou uploadés)
- Colonne centre : **fiche OCR** éditable (nom, tracking, poids, transporteur) + zone drop pour uploader une photo de bordereau
- Colonne droite : **candidats de matching** (scoring identique à l'app), avec Cases A/B/C
- Actions : Confirmer réception · Créer colis orphelin · **Créer une demande** (dernier recours, si aucune demande existante — mini-form : client, service, description)
- Recherche manuelle par nom/tracking/téléphone en haut

## 3. Colis reçus `/hub/parcels`

- Tableau groupé **par demande** (accordéon) : chaque groupe = une demande avec sa progression (3/5 colis reçus)
- Colonnes : réf colis, description, poids, statut paiement, valise assignée
- Actions lot (checkbox multi-sélection) :
  - **Marquer comme payés** (lot) → mock paiement, tag "payé"
  - **Ajouter à une valise** (dropdown valises en préparation + option "Nouvelle valise")
  - **Retirer d'une valise**
- Filtres : demande, service, entrepôt, statut paiement, valise

## 4. Valises `/hub/valises` + détail

Liste : cards valise avec code (VAL-CDG-001), destination, nb colis, poids total, statut (préparation · scellée · en transit · arrivée · contrôlée).

Détail `/hub/valises/$id` :
- Header : code, destination, transporteur, date départ prévue, statut (badge + timeline)
- **Manifeste** : tableau des colis contenus (avec demande liée, client destinataire)
- Récap : poids total, valeur déclarée, nb colis
- Actions : Ajouter/retirer colis (si en préparation) · **Sceller la valise** (génère numéro de scellé, verrouille contenu) · Marquer comme partie · Ajouter tracking transporteur
- Timeline : créée → scellée → départ → en transit → arrivée → contrôlée
- Bouton "Générer manifeste PDF" (mock)

## 5. Chargement / départ `/hub/departs`

- Liste des valises **prêtes à partir** de l'entrepôt courant
- Groupement par transporteur / vol / camion (mock : AF123, Camion Bolloré-42)
- Action : **Créer un départ** (sélection multi-valises + transporteur + date + numéro de vol) → passe les valises en "en transit" et pousse un event timeline
- Historique des derniers départs (7 j)

## 6. Arrivée / contrôle `/hub/arrivees`

Vue côté entrepôt destinataire :
- Liste des valises **en transit vers cet entrepôt**
- Action **Marquer comme arrivée** (scan du scellé, date d'arrivée)
- Action **Contrôler** : ouvre le manifeste, checkbox par colis (reçu OK · manquant · abîmé), commentaire, photo. Enregistre le statut par colis et par valise (contrôlée · litige).
- Colis contrôlés OK → passent à "arrivés destination" et deviennent disponibles pour la livraison finale au client.

## Données à étendre

`src/features/demands/data.ts` — ajouter statut paiement sur `DemandParcel` (`paymentStatus: 'pending' | 'paid'`).

Nouveau `src/features/hub/valises.ts` :
- Type `Valise` (id, code, warehouseFromId, warehouseToId, carrier, flightNumber, status, sealNumber, createdAt, sealedAt, departedAt, arrivedAt, controlledAt, parcelIds[])
- Store réactif type `runtimeDemands` (mutations client + `useSyncExternalStore`)
- Actions : `createValise`, `addParcelToValise`, `removeParcelFromValise`, `sealValise`, `markDeparted`, `markArrived`, `controlValise(parcelChecks)`
- 3-4 valises mock dans divers états pour rendre la démo crédible

`src/features/hub/departs.ts` : type `Departure` (id, transporteur, vol, date, valiseIds[]) + 2-3 départs mock.

## Composants réutilisables

- `HubLayout` (sidebar + header) dans `src/features/hub/layout.tsx`
- `KpiCard`, `HubSection` — cohérents avec la palette existante
- `ValiseCard`, `ValiseStatusBadge`, `ValiseTimeline`
- `ParcelGroupRow` (accordéon par demande dans `/hub/parcels`)
- `OcrPanel` (partagé avec l'app mobile via `src/features/admin/matching.ts`)

## Design

- Layout desktop pleine largeur, sidebar 240px, contenu max-w-7xl
- Palette existante (`--background`, `--card`, `--primary`, `--muted`), pas de nouvelles couleurs
- Tables denses type "logistique" : lignes fines, monospace pour les codes, badges de statut colorés par état
- Sticky headers dans les tableaux longs
- Lien discret **App manager (mobile)** ↔ **Hub entrepôt (desktop)** dans les deux sidebars/profils

## Livrables

- `src/routes/hub.tsx` + 7 sous-routes (`hub.index`, `hub.reception`, `hub.parcels`, `hub.valises.index`, `hub.valises.$id`, `hub.valises.tsx` layout, `hub.departs`, `hub.arrivees`)
- `src/features/hub/{layout,valises,departs,ui}.tsx`
- Extension `DemandParcel.paymentStatus`
- Lien depuis `/admin/profile` vers `/hub`
