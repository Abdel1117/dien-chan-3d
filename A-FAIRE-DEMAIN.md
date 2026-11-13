# À faire demain

Mis à jour le 11 novembre 2026, en fin de séance.

## Où on en est

Fait et poussé sur `origin/dev` (dernier commit : `cc531b7`) :

- Base Supabase (schéma, sécurité RLS), compte administrateur.
- Connexion, session (JWT + refresh token dans `src/proxy.ts`), pages admin protégées, page profil.
- En-tête responsive avec menu burger sur mobile.
- Tête 3D (`public/models/head.glb`, crédits CC BY), vues Face / Profils / Arrière / Dessus.
- Éditeur de points : `/admin/points` (clic sur le visage, numéro Bùi Quốc Châu, noms fr/en/vi).
- Page `/visage` : liste des parcours, étapes, point en cours en rouge, point suivant en orange.
- Minuteur : décompte ou répétitions, pauses, tours, Précédent / Suivant, sons de début et de fin, écran maintenu allumé. Les étapes « des deux côtés » se jouent gauche puis droite.
- Parcours réel « Bộ thăng » inséré en base (`supabase/data/bo-thang.sql`).
- Le build de production passe (`npm run build`).

## 1. Chantier principal : l'éditeur de parcours

Aujourd'hui, un parcours ne peut être créé qu'en SQL. À construire dans `src/app/[locale]/admin/(protected)/parcours/` :

- Liste des parcours (publiés et brouillons), bouton « Nouveau parcours ».
- Fiche du parcours : titre, description et avertissement en fr/en/vi, catégorie (douleur / trouble), nombre de tours, slug.
- Étapes : choisir un point existant, ordre (monter / descendre), côté (gauche, droite, les deux, central), durée ou répétitions avec cadence, pause après l'étape.
- Publier / repasser en brouillon, supprimer.
- Technique fixée à « pression » (décision prise), pas de champ à l'écran.
- Lien depuis `/admin`, à côté de « Gérer les points ».

Les fonctions d'écriture existent déjà dans `src/lib/supabase/queries.ts` : `saveParcours`, `saveEtape`, `deleteParcours`, `deleteEtape`. Il manque l'interface.

## 2. À faire par toi (hors code)

- **Vérifier les 10 points du « Bộ thăng »** contre ta carte de référence et les corriger dans `/admin/points`. Leurs positions sont approximatives (calculées d'après des descriptions trouvées en ligne).
- **Écouter les sons** du minuteur et tester sur téléphone (son, écran qui reste allumé, menu burger, panneau des parcours).
- **Décider pour les points des deux côtés** : gauche puis droite (en place aujourd'hui) ou les deux en même temps.
- **Relire l'avertissement médical** du « Bộ thăng » (contre-indications reprises de sites non médicaux).
- **Faire relire le vietnamien** (`messages/vi.json` et les textes du parcours) par une personne qui parle la langue.

## 3. Nettoyer les données de test

Quand le « Bộ thăng » est vérifié, dans Supabase > SQL Editor :

```sql
delete from public.parcours where slug in ('parcours-de-demonstration', 'brouillon-de-demonstration');
delete from public.points where numero in ('T1', 'T2', 'T3');
```

Ton point 26 est conservé.

## 4. Mise en production sur Vercel

1. https://vercel.com > connexion avec GitHub > **Add New > Project** > importer `dien-chan-3d`.
2. Ajouter les deux variables d'environnement (mêmes valeurs que `.env`) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. **Deploy**. Chaque `git push` sur `dev` redéploie ensuite le site.

Côté Supabase, avant d'ouvrir au public :

- **Authentication > Sign In / Providers > Email** : décocher « Allow new users to sign up ».
- **Authentication > URL Configuration** : mettre l'adresse Vercel dans « Site URL ».
- Vérifier que le mot de passe administrateur est solide.

## 5. Idées pour plus tard

- Sur la dernière étape d'un tour, montrer en orange le premier point du tour suivant.
- Message d'erreur si `head.glb` ne se charge pas (aujourd'hui : « Chargement… » sans fin).
- Page d'inscription, si des utilisateurs non administrateurs doivent avoir un compte.
- Remplacer `THREE.Clock` (avertissement de dépréciation dans la console, sans conséquence).

## Rappels

- Ne jamais mettre la clé `sb_secret_` / `service_role` dans le projet ni dans Vercel.
- Supabase gratuit met le projet en pause après environ une semaine sans activité : le relancer depuis la console si les parcours ne s'affichent plus.
- Si tu changes de modèle de tête : relancer `scripts/prepare-head.py`, incrémenter `HEAD_MODEL_VERSION` dans `src/lib/model.ts`, et replacer tous les points.
