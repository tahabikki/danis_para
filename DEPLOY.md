# Guide de déploiement — Dani's Parapharmacy

Ce guide explique **pas à pas** comment mettre votre application en ligne gratuitement avec **Vercel** (hébergement) et **Supabase** (base de données).

---

## 1. Créer un compte Supabase

1. Allez sur https://supabase.com
2. Cliquez sur **"Start your project"**
3. Connectez-vous avec GitHub (le plus simple)
4. Cliquez sur **"New project"**
5. Remplissez :
   - **Name** : `danis-para` (ou le nom que vous voulez)
   - **Database Password** : Choisissez un mot de passe fort et notez-le
   - **Region** : Choisissez `EU West` (Europe) ou `EU Central` — le plus proche de vous
   - Cliquez sur **"Create new project"**
6. Attendez 1-2 minutes que la base de données soit créée

---

## 2. Configurer la base de données Supabase

Une fois le projet créé, vous allez voir un menu à gauche.

1. Cliquez sur l'icône **"SQL Editor"** (icône de base de données avec un `< >`)
2. Cliquez sur **"New query"**
3. **Copiez-collez** le contenu du fichier `supabase/schema.sql` du projet
4. Cliquez sur **"Run"** — cela crée les tables `produits`, `clients` et `ventes`
5. Ouvrez un **second onglet** "New query"
6. **Copiez-collez** le contenu du fichier `supabase/seed.sql`
7. Cliquez sur **"Run"** — cela ajoute des données de démonstration

### Vérification

- Cliquez sur **"Table Editor"** dans le menu de gauche
- Vous devriez voir 3 tables : `produits`, `clients`, `ventes`
- Cliquez sur chaque table pour voir les données

---

## 3. Récupérer les clés Supabase

1. Dans le menu de gauche, cliquez sur **"Project Settings"** (icône engrenage)
2. Cliquez sur **"API"** dans la section "Configuration"
3. Vous verrez deux informations importantes :

   | Ce qu'il faut copier | Ça s'appelle comment |
   |---|---|
   | **URL du projet** | `Project URL` (ex: `https://xxx.supabase.co`) |
   | **Clé anon** | `anon public` (commence par `eyJ...`) |

4. **Copiez ces deux valeurs** dans un fichier texte temporaire, vous en aurez besoin

---

## 4. Déployer sur Vercel

### 4.1. Créer un compte Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"Sign Up"** et connectez-vous avec **GitHub**
3. Autorisez Vercel à accéder à vos repositories GitHub

### 4.2. Importer le projet

1. Cliquez sur **"Add New…"** → **"Project"**
2. Sélectionnez votre repository **`danis_para`** (celui que vous venez de push)
3. Cliquez sur **"Import"**

### 4.3. Configurer les variables d'environnement

Avant de cliquer sur "Deploy", vous devez ajouter des variables. Dans l'écran de configuration :

1. Cliquez sur **"Environment Variables"**
2. Ajoutez ces 3 variables :

   | Nom | Valeur |
   |---|---|
   | `NEXT_PUBLIC_DATA_MODE` | `cloud` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` (l'URL que vous avez copiée) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (la clé anon que vous avez copiée) |

3. Cliquez sur **"Deploy"**
4. Attendez 1-2 minutes que le déploiement se termine
5. **Bravo !** Votre application est en ligne. Vercel vous donne une URL comme `https://danis-para.vercel.app`

---

## 5. Mode local vs Cloud

- **Mode local** (`NEXT_PUBLIC_DATA_MODE=local`) : les données sont stockées dans le navigateur (localStorage). Pas besoin de base de données.
- **Mode cloud** (`NEXT_PUBLIC_DATA_MODE=cloud`) : les données sont stockées dans Supabase. Nécessite les clés Supabase.

Pour le déploiement sur Vercel, on utilise le **mode cloud**.

---

## 6. Mettre à jour l'application

Quand vous faites des modifications dans le code :

```bash
git add -A
git commit -m "Description de ce qui a changé"
git push
```

Vercel détecte automatiquement le push et **redéploie** l'application (ça prend environ 1 minute).

Vous pouvez aussi voir les déploiements sur https://vercel.com/tahabikki/danis-para/deployments

---

## 7. Dépannage

### L'application affiche une page blanche ou une erreur
- Vérifiez que les 3 variables d'environnement sont bien définies dans Vercel
- Vérifiez que les tables ont été créées dans Supabase (SQL Editor → Run schema.sql)
- Vérifiez la console navigateur (F12 → Console) pour les messages d'erreur

### Les images ne s'affichent pas
- En mode cloud, les chemins d'images sont relatifs (`/products/...`). Vercel sert les fichiers du dossier `public/` automatiquement, donc les images devraient fonctionner.

### Erreur "Failed to fetch" ou "Network Error"
- Vérifiez que les clés Supabase sont correctes
- Vérifiez que les règles de sécurité Row Level Security (RLS) dans Supabase sont désactivées (Table Editor → Authentication → RLS disabled) ou configurées pour permettre l'accès public en lecture/écriture

---

## Glossaire pour les non-initiés

| Terme | Explication simple |
|---|---|
| **Vercel** | Un service qui héberge votre site web gratuitement |
| **Supabase** | Une base de données en ligne, comme un classeur Excel accessible depuis Internet |
| **GitHub** | Un endroit pour stocker votre code en ligne |
| **Repository** | Votre projet, votre dossier de code |
| **Push** | Envoyer votre code local vers GitHub |
| **Variable d'environnement** | Une information secrète (comme une clé) que l'application utilise pour fonctionner |
| **Déploiement** | Action de mettre votre site en ligne |
