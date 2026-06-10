# Guide de déploiement — Dani's Parapharmacy

Ce guide explique **pas à pas** comment faire fonctionner l'application en local avec Supabase, puis la mettre en ligne avec Vercel.

---

## Ce qui est dans GitHub (et pourquoi)

| Fichier / Dossier | Dans GitHub ? | Pourquoi ? |
|---|---|---|
| `public/products/*.jpeg` | ✅ OUI | Ce sont des **images de démonstration** fournies avec l'application (comme les logos). Elles sont nécessaires au fonctionnement. |
| `supabase/schema.sql` | ✅ OUI | C'est la **structure** des tables (pas les données). Permet de recréer la base facilement. |
| `supabase/seed.sql` | ✅ OUI | Ce sont des **données de démonstration** à insérer dans Supabase. |
| `.env` / `.env.local` | ❌ NON | Contient les **clés secrètes** (URL Supabase, clé anon). Le fichier `.env.example` montre le modèle. |
| `.next/`, `node_modules/` | ❌ NON | Dossiers générés automatiquement, pas besoin de les versionner. |

> **Les images de démonstration DOIVENT rester dans le repo.** Si vous voulez utiliser Supabase Storage pour les images uploadées par les utilisateurs, c'est une fonctionnalité à ajouter plus tard.

---

## 1. Créer un compte Supabase

1. Allez sur https://supabase.com
2. Cliquez sur **"Start your project"**
3. Connectez-vous avec GitHub (le plus simple)
4. Cliquez sur **"New project"**
5. Remplissez :
   - **Name** : `danis-para` (ou le nom que vous voulez)
   - **Database Password** : Choisissez un mot de passe fort et notez-le
   - **Region** : Choisissez `EU West` (proche du Maroc) ou `EU Central`
   - Cliquez sur **"Create new project"**
6. Attendez 1-2 minutes que la base de données soit créée

---

## 2. Configurer la base de données Supabase

Une fois le projet créé :

1. Cliquez sur **"SQL Editor"** dans le menu de gauche
2. Cliquez sur **"New query"**
3. Copiez-collez le contenu du fichier `supabase/schema.sql` (depuis votre projet)
4. Cliquez sur **"Run"** — cela crée les tables `produits`, `clients` et `ventes`
5. Ouvrez un **second onglet** "New query"
6. Copiez-collez le contenu du fichier `supabase/seed.sql`
7. Cliquez sur **"Run"** — cela ajoute les données de démonstration

### Vérification

- Cliquez sur **"Table Editor"** dans le menu de gauche
- Vous devriez voir 3 tables avec des données

---

## 3. Récupérer les clés Supabase

1. Menu de gauche → **"Project Settings"** (engrenage) → **"API"**
2. Notez ces deux valeurs :

   | Ce qu'il faut copier | Nom exact |
   |---|---|
   | **URL du projet** | `Project URL` (ex: `https://xxx.supabase.co`) |
   | **Clé anon** | `anon public` (commence par `eyJ...`) |

---

## 4. Faire fonctionner l'application en local (avec Supabase)

Avant de déployer, testez que tout marche sur votre ordinateur.

1. Dans le dossier du projet, créez un fichier `.env.local` (copie de `.env.example`) :

   ```bash
   cp .env.example .env.local
   ```

2. Ouvrez `.env.local` avec un éditeur de texte et modifiez-le :

   ```env
   NEXT_PUBLIC_DATA_MODE=cloud
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

   > Remplacez les valeurs par celles que vous avez copiées.

3. Installez les dépendances (une seule fois) :

   ```bash
   npm install
   ```

4. Lancez le serveur local :

   ```bash
   npm run dev
   ```

5. Ouvrez http://localhost:3000 dans votre navigateur
6. Connectez-vous avec `admin@daniparasante.ma` / `demo1234`

L'application utilise maintenant **Supabase** pour stocker les données. Ajoutez des produits, des clients, faites des ventes — tout est sauvegardé dans votre base Supabase.

> **Important :** Le fichier `.env.local` est dans `.gitignore`. Vos clés Supabase ne seront **jamais** pushées sur GitHub.

---

## 5. Déployer sur Vercel

### 5.1. Créer un compte Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"Sign Up"** → connectez-vous avec GitHub
3. Autorisez Vercel à accéder à vos repositories

### 5.2. Importer le projet

1. Cliquez sur **"Add New…"** → **"Project"**
2. Sélectionnez **`danis_para`** (le repo que vous avez pushé)
3. Cliquez sur **"Import"**

### 5.3. Ajouter les variables d'environnement

Avant de cliquer sur "Deploy", ouvrez la section **"Environment Variables"** et ajoutez **exactement les mêmes valeurs** que dans votre `.env.local` :

| Nom | Valeur |
|---|---|
| `NEXT_PUBLIC_DATA_MODE` | `cloud` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |

### 5.4. Lancer le déploiement

1. Cliquez sur **"Deploy"**
2. Attendez 1-2 minutes
3. Votre application est en ligne à une URL comme `https://danis-para.vercel.app`

---

## 6. Mettre à jour l'application

Quand vous modifiez le code :

```bash
git add -A
git commit -m "Description de ce qui a changé"
git push
```

Vercel détecte le push et **redéploie automatiquement** (environ 1 minute).

---

## 7. Dépannage

### L'application affiche une page blanche ou une erreur
- Vérifiez que les 3 variables d'environnement sont dans Vercel (Project → Settings → Environment Variables)
- Vérifiez que les tables Supabase sont créées (SQL Editor → Run `schema.sql`)
- Console navigateur (F12 → Console) pour voir les erreurs

### Erreur "Failed to fetch" ou "Network Error"
- Les clés Supabase sont-elles correctes ?
- RLS (Row Level Security) dans Supabase doit être désactivée : **Table Editor → Authentication → RLS disabled**

### Les images de démonstration ne s'affichent pas
- Les images dans `/public/products/` sont servies automatiquement par Vercel. Si vous voyez des images manquantes, vérifiez qu'elles sont bien dans le dossier `public/products/` du repo.

---

## Résumé du fonctionnement

```
Votre ordinateur (local)         Supabase (base de données)
         │                               │
         ├── npm run dev ────────────────┤
         │   (via .env.local)           │
         │                               │
    GitHub (code source)                 │
         │                               │
         ├── git push ─── Vercel ────────┤
         │   (via env vars de Vercel)    │
         │                               │
         └── https://danis-para.vercel.app ──┘
```

**Local et Vercel utilisent la même base Supabase** — les données sont partagées.

---

## Glossaire

| Terme | Explication simple |
|---|---|
| **Vercel** | Service qui héberge votre site web gratuitement |
| **Supabase** | Base de données en ligne (comme un classeur Excel accessible depuis Internet) |
| **GitHub** | Endroit pour stocker votre code en ligne |
| **Repository** | Votre projet, votre dossier de code |
| **Push** | Envoyer votre code local vers GitHub |
| **Variable d'environnement** | Information secrète (clé) que l'application utilise pour fonctionner |
| **.env.local** | Fichier sur votre ordinateur qui contient vos clés (jamais partagé) |
