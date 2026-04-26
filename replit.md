# soukMA — Marketplace marocaine

Modern Moroccan e-commerce marketplace (clothing, appliances, beauty, artisanat) built as a pnpm monorepo.

## Stack
- **Frontend** (`artifacts/soukma`): React + Vite, wouter routing, TanStack Query, Tailwind, shadcn/ui. UI in French, MAD currency.
- **API** (`artifacts/api-server`): Express 5, Drizzle ORM, PostgreSQL, Replit Auth (OIDC).
- **Shared libs**: `@workspace/api-zod`, `@workspace/api-client-react` (orval generated), `@workspace/db`, `@workspace/replit-auth-web`.

## Theme
Moroccan-modern palette: terracotta primary (HSL 14 75% 48%), atlas teal secondary (184 50% 22%), saffron accent (38 92% 55%). Custom utilities: `.zellige-pattern`, `.moroccan-gradient`, `.atlas-gradient`, `.placeholder-product`.

## Features shipped
- Public: Home, Catalogue, fiche produit, panier, checkout (CMI / CIH Pay / livraison), écran de paiement simulé.
- Compte: Connexion Replit, mes commandes, détail commande.
- Vendeur: onboarding, dashboard, produits, commandes (`/vendor/...`).
- Admin: dashboard, utilisateurs (rôles), commandes, produits (`/admin/...`).
- Garde-fous: vérification du rôle DB par requête côté API; routes wouter protégées côté front.

## Conventions importantes
- **Aucune emoji** dans l'UI (Lucide icons uniquement).
- **Aucune image produit** par défaut: `imageUrl=null` + commentaire `// REMPLACER ICI` côté seed et `<ProductImage />` affiche une icône Package.
- **Paiement**: `PaymentMock` simule l'écran bancaire — bloc commenté `// REMPLACER ICI` pour brancher la vraie passerelle CMI (HMAC-SHA512) ou CIH Pay (callback IPN).
- Méthodes de paiement enum: `cmi | cih_pay | cash_on_delivery`.

## Données de seed
8 catégories, 12 produits, 1 boutique de démo, attributions de rôles cohérentes.

## Lancer en local
- `artifacts/api-server: API Server` — Express sur `PORT`, expose `/api/*`.
- `artifacts/soukma: web` — Vite dev server (base `/soukma/`), proxie `/api` vers l'API server.
- `artifacts/mockup-sandbox: Component Preview Server` — sandbox de composants.

## Variables d'environnement
- `DATABASE_URL` (PostgreSQL Replit)
- `SESSION_SECRET`
- Replit Auth: variables fournies automatiquement par la plateforme.
