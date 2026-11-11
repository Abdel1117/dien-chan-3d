# Visage 3D Dien Chan

Application web qui affiche un visage en 3D, y place les points de Dien Chan et joue des parcours de stimulation. Le plan complet se trouve dans « Plan de projet — Visage 3D Dien Chan ».

> Le Dien Chan est une pratique complémentaire qui ne remplace pas un avis médical.

## Stack

TypeScript (strict), Next.js (App Router), React, Tailwind CSS, Vitest. À venir : Three.js (React Three Fiber, drei), Supabase, Serwist.

## Installation

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
cp .env.example .env   # puis renseigner les clés Supabase (phase 3)
```

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement (http://localhost:3000) |
| `npm run build` | Build de production |
| `npm start` | Lance le build de production |
| `npm test` | Tests Vitest (une exécution) |
| `npm run test:watch` | Tests Vitest en continu |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |

## Langues

Français (par défaut), anglais et vietnamien : `/fr`, `/en`, `/vi`. Les textes de l'interface sont dans `messages/*.json`. Les textes des points et des parcours sont dans les tables `*_traductions` (une ligne par langue ; le français sert de repli).

## Base de données (Supabase)

1. Créer un projet Supabase, puis renseigner `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dans `.env` (clé `anon` uniquement, jamais `service_role`).
2. Appliquer `supabase/migrations/*.sql` (CLI Supabase, ou en collant le SQL dans l'éditeur SQL de la console).
3. Facultatif : exécuter `supabase/seed.sql` (données **fictives** de test).
4. Créer un compte dans Authentication > Users, puis le déclarer administrateur depuis l'éditeur SQL :
   `insert into public.admins (user_id) values ('<uuid de l''utilisateur>');`

## Structure

```text
public/models/        head.glb (modèle définitif, ajouté plus tard)
src/app/              routes Next.js
src/three/            scène 3D (composants client)
src/lib/supabase/     clients, requêtes, types
src/i18n/             routage et navigation multilingues
messages/             traductions de l'interface (fr, en, vi)
src/lib/minutage/     calcul pur du minutage
src/components/       composants d'interface partagés
supabase/migrations/  schéma SQL et règles d'accès
```

## Avancement

Phases 1 (socle), 2 (visionneuse 3D) et 3 (base de données) : en place. Les phases suivantes sont décrites dans le plan.
