# App mobile Admin / Manager d'entrepôt

Une simulation d'application mobile pour l'admin plateforme et les managers d'entrepôt (Paris CDG, Paris Nord, Brazzaville, Pointe-Noire…), centrée sur la **réception de colis** avec matching IA sur les demandes Delivery.

## Architecture des routes

Nouvelle section `/admin/*`, rendue dans un **cadre téléphone** (mockup mobile centré sur desktop, plein écran sur mobile) pour bien signaler qu'il s'agit d'une app mobile.

```text
/admin              -> Accueil manager (dashboard entrepôt)
/admin/scan         -> Scanner un bordereau (caméra simulée + IA)
/admin/scan/match   -> Résultat matching + candidats à confirmer
/admin/parcels      -> Colis attendus / reçus (filtre par statut)
/admin/demandes     -> Demandes Delivery concernant l'entrepôt
/admin/demandes/$id -> Détail demande côté opérationnel (checklist colis)
/admin/profile      -> Manager, entrepôt courant, déconnexion
```

Navigation bas de page (tab bar iOS-like) : **Accueil · Scan · Colis · Demandes · Profil**, avec le bouton Scan surélevé au centre (action primaire).

## Contexte "manager d'entrepôt"

Un sélecteur d'entrepôt en haut de l'accueil permet de simuler différents managers :
- Paris CDG (Jean), Paris Nord (Aline), Brazzaville (Sarah), Pointe-Noire (Fabrice)
- L'admin plateforme a une option « Tous les entrepôts »

Toutes les données affichées (colis attendus, demandes, stats) sont **filtrées par entrepôt courant**. Stocké dans un contexte local (mock, pas de backend).

## 1. Accueil `/admin`

- En-tête : avatar manager, nom, entrepôt actif (tapable → switch)
- 3 KPI cards : Colis attendus aujourd'hui · Reçus (24h) · Anomalies
- Section **À réceptionner aujourd'hui** : 4-5 colis attendus avec réf, client, service, tap → détail
- Section **Activité récente** : mini-timeline des dernières réceptions
- Gros bouton flottant "Scanner un colis" → `/admin/scan`

## 2. Écran Scan `/admin/scan`

- Viseur caméra plein écran simulé (cadre pointillé animé, ligne laser)
- Boutons : Flash · Galerie · Saisie manuelle (numéro de suivi ou nom)
- Aide : "Cadrez le bordereau du colis"
- 2 boutons de simulation (visibles uniquement en mode prototype) :
  - **Simuler scan avec numéro de suivi** (match direct)
  - **Simuler scan sans numéro de suivi** (déclenche liste de candidats)

Après "scan", écran de traitement IA (2 s) : "Analyse du bordereau… Nom, poids, tracking détectés" → route vers `/admin/scan/match`.

## 3. Écran Matching `/admin/scan/match`

En haut : **carte OCR** montrant ce que l'IA a extrait du bordereau
- Nom, prénom
- Numéro de suivi (ou "non détecté")
- Poids
- Transporteur / date
- Bouton "Corriger" (édition inline si l'IA s'est trompée)

Ensuite, **3 cas** selon le score :

### Cas A — Match certain (tracking number trouvé)
Card verte "Colis identifié" avec :
- Référence demande (FS-DLS-00421)
- Client, service, entrepôt destination
- Description du colis attendu
- Bouton primaire **Confirmer la réception**
- Lien secondaire "Ce n'est pas le bon colis"

### Cas B — Candidats multiples (pas de tracking, matching sur nom)
Titre "Plusieurs demandes possibles" + explication courte "Aucun numéro de suivi. Voici les demandes ouvertes correspondant à ce nom."

Liste triée par **score de confiance** (barre visuelle 0-100 %), chaque candidat affiche :
- Référence demande + service
- Nom client + téléphone (masqué partiellement)
- Colis attendus dans cette demande, avec **surlignage de celui qui matche le mieux** (par description / poids proche)
- Score : nom (exact/partiel), ville de destination, poids proche du bordereau, date de création récente
- Tap → écran de confirmation avec un seul colis pré-sélectionné dans la demande

Action bas d'écran : **Aucun ne correspond → Créer un colis orphelin** (mis en quarantaine, à rattacher plus tard par l'admin).

### Cas C — Aucun candidat
Écran d'aide : "Aucune demande ouverte ne correspond." Actions :
- Rechercher manuellement (par nom, téléphone, référence)
- Créer un colis orphelin (rattachement différé)

## 4. Confirmation de réception

Écran final avant enregistrement :
- Récap : demande, colis, poids mesuré (éditable), état du colis (bon / abîmé / ouvert)
- Photo optionnelle du colis (bouton "Ajouter photo")
- Note interne
- Bouton **Enregistrer la réception**
- Toast succès → retour `/admin` avec le colis passé de "Attendu" à "Reçu"

Effet secondaire (mock) : mise à jour du statut dans les données Demand, ajout d'un event dans la timeline `"Colis BRD-8842 réceptionné par [manager] à [entrepôt]"`.

## 5. Écran Colis `/admin/parcels`

Onglets : **Attendus · Reçus (24h) · Anomalies · Orphelins**
- Chaque ligne : réf bordereau, description, demande liée (ou "non rattaché"), statut, ETA
- Recherche + filtres (service, période)
- Tap → détail colis avec bouton "Réceptionner" si attendu

## 6. Écran Demandes `/admin/demandes` et détail

Vue opérationnelle des demandes Delivery concernant l'entrepôt courant :
- Filtres : En attente / En cours de réception / Complètes / En transit sortant
- Détail : checklist des colis (cochés = reçus), progression X/Y, actions "Réceptionner ce colis", "Marquer expédié", "Ajouter une note interne"

## Composants et logique de matching (mock)

Fichier `src/features/admin/matching.ts` :
- `scanBordereau(): OcrResult` — retourne un OCR simulé (2 scénarios : avec/sans tracking)
- `findCandidates(ocr, demands): Candidate[]` — score par :
  - +60 si tracking number match
  - +25 nom exact, +15 nom partiel (Levenshtein)
  - +10 poids proche (±0.5 kg)
  - +5 date de demande récente (< 30 j)
  - +5 mots-clés de description qui matchent
- Seuils : ≥ 80 = match certain (Cas A) · 40-79 = candidats (Cas B) · < 40 = aucun (Cas C)
- Une seule règle : si tracking match, on skippe la liste et on va direct au Cas A même si le nom diffère (avec avertissement "Nom différent du bordereau").

## Design system

Cohérent avec le style "rationalist logistics" du projet :
- Cadre téléphone : `max-w-[420px]` centré, ombre douce, coins 40px, notch simulé sur desktop
- Palette existante (bg, card, primary, muted), pas de nouvelles couleurs
- Tab bar fixe en bas avec fond glassmorphism `backdrop-blur`
- Icônes lucide (Home, ScanLine, Package, ClipboardList, User)
- Micro-animations : viseur pulsé, transitions de score sur les candidats

## Données

- Étendre `src/features/demands/data.ts` : ajouter `trackingNumber?: string` sur `DemandParcel`
- Ajouter 3-4 demandes Delivery supplémentaires avec colis attendus dans différents entrepôts pour rendre la démo crédible
- Ajouter `WAREHOUSES` référence (id, nom, pays, manager mock)
- Ajouter `src/features/admin/session.ts` : contexte local du manager/entrepôt courant (React context, persist localStorage côté client uniquement via `useEffect` pour éviter mismatch SSR)

## Livrables

- `src/routes/admin.tsx` (layout avec cadre téléphone + tab bar)
- `src/routes/admin.index.tsx`, `admin.scan.tsx`, `admin.scan.match.tsx`, `admin.parcels.tsx`, `admin.demandes.tsx`, `admin.demandes.$id.tsx`, `admin.profile.tsx`
- `src/features/admin/matching.ts`, `session.tsx`, `mock.ts`
- Composants réutilisables : `PhoneFrame`, `TabBar`, `CandidateCard`, `OcrResultCard`, `ScoreBar`
- Lien discret vers `/admin` depuis la page `/demandes` (bouton "Vue manager")
