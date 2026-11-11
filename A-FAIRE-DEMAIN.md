# À faire demain

Objectif : valider la phase 3 (base de données) pour pouvoir passer à la phase 4 (connexion et éditeur de points).

## 1. Créer le projet Supabase (≈ 10 min)

1. Va sur https://supabase.com et crée un compte (ou connecte-toi).
2. **New project** : choisis un nom (ex. `dien-chan-3d`), un mot de passe de base de données (garde-le dans un gestionnaire de mots de passe) et la région la plus proche (ex. Paris / Frankfurt).
3. Attends que le projet soit prêt (1 à 2 minutes).

## 2. Récupérer les clés

Dans le projet : **Project Settings > API** (ou le bouton **Connect**).

- Copie **Project URL**.
- Copie la clé **anon / publishable**.
- Ne copie **jamais** la clé `service_role` dans le projet.

## 3. Remplir le fichier `.env`

À la racine du projet :

```bash
cp .env.example .env
```

Puis renseigne :

```text
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=ta-cle-publishable
```

Le fichier `.env` est ignoré par git : il ne sera pas publié.

## 4. Appliquer la base de données

Dans la console Supabase : **SQL Editor > New query**.

1. Colle le contenu de `supabase/migrations/20261110000000_schema.sql` et clique sur **Run**. Résultat attendu : « Success ».
2. Nouvelle requête : colle le contenu de `supabase/seed.sql` et **Run**. Ce sont des données **fictives** de test.
3. Vérifie dans **Table Editor** : tu dois voir les tables `points`, `parcours`, `parcours_etapes`, `admins` et les trois tables `*_traductions`.

## 5. Créer ton compte administrateur

1. **Authentication > Users > Add user > Create new user** : saisis ton e-mail et un mot de passe. Coche **Auto Confirm User**.
2. Copie l'**UID** de l'utilisateur créé.
3. Dans **SQL Editor**, exécute :

```sql
insert into public.admins (user_id) values ('COLLE-ICI-TON-UID');
```

## 6. Me prévenir

Reviens me dire : « Supabase est prêt ». Je testerai alors :

- qu'un visiteur anonyme lit les parcours publiés et ne peut rien écrire ;
- que ton compte administrateur peut écrire.

Ensuite on passe à la phase 4.

## 7. En parallèle (facultatif)

- **Modèle 3D :** une fois le téléchargement fini, vérifie qu'il respecte : 20 000 triangles maximum, moins de 2 Mo, origine au centre de la tête, axe Y vers le haut, visage vers +Z, hauteur de tête = 1. Si ce n'est pas le cas, demande-moi le script Python pour Blender. Dépose le fichier final dans `public/models/head.glb`.
- **Relecture de la traduction vietnamienne :** fais relire `messages/vi.json` (et le texte du seed) par une personne qui parle la langue.
- **Questions ouvertes du plan** (à trancher avant la phase 4) :
  - un seul administrateur ou plusieurs praticiens ?
  - la consultation reste-t-elle publique ?
  - quelle numérotation et quelles cartes de référence pour placer les points ?
  - quelles techniques de stimulation proposer (pression, roulement, autre) ?

## Rappels

- Ne partage jamais le mot de passe de la base ni la clé `service_role`.
- Supabase gratuit met le projet en pause après environ une semaine sans activité : si le site ne charge plus les données, relance-le depuis la console.
