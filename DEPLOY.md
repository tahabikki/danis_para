# Guide de déploiement — Dani's Parapharmacy

## Architecture

```
Navigateur (ton site)
    │
    ├── Vercel (code HTML/JS/CSS)
    │
    └── Supabase
         ├── Database (produits, clients, ventes)
         └── Storage bucket "products" (images)
```

Le navigateur parle **directement** à Supabase. Vercel ne fait que servir les fichiers de l'app.

---

## 1. Créer le projet Supabase

1. Va sur https://supabase.com → **Start a project**
2. **Name** : `danis-para`
3. **Database Password** : choisis un mot de passe fort
4. **Region** : `EU West`
5. Clique **Create new project** et attends 1-2 minutes

---

## 2. Créer les tables (Database)

1. Menu gauche → **SQL Editor** → **New query**
2. Copie le contenu de `supabase/schema.sql` et exécute
3. Nouvel onglet → copie `supabase/seed.sql` et exécute

---

## 3. Créer le bucket Storage

1. Menu gauche → **Storage** → **New bucket**
2. **Name** : `products` (exactement, en minuscule)
3. **Public bucket** : ✅ Oui
4. **Create bucket**

### Uploader les images de démonstration

1. Dans le bucket `products`, **Upload files**
2. Sélectionne les fichiers depuis `public/products/archive/` (ou `public/products/`)
3. **Upload**

---

## 4. Configurer RLS pour les uploads d'images

Par défaut, Supabase bloque les uploads. Il faut autoriser l'insertion :

**SQL Editor → New query :**

```sql
-- Active RLS (si pas déjà fait)
alter table storage.objects enable row level security;

-- Autorise les uploads anonymes dans le bucket products
create policy "Anon can upload to products"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'products');
```

> ⚠️ Ne pas désactiver complètement RLS — cette politique est suffisante.

---

## 5. Récupérer les clés

Menu gauche → **Project Settings** → **API**

| Clé | Où la trouver | Exemple |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon public** ou **publishable key** | `eyJ...` ou `sb_publishable_...` |

---

## 6. Configurer le projet en local

```bash
cp .env.example .env.local
```

Modifie `.env.local` :

```env
NEXT_PUBLIC_DATA_MODE=cloud
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta_clé_anon_ou_publishable
```

Puis :

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000 — login : `admin@daniparasante.ma` / `demo1234`

---

## 7. Déployer sur Vercel

1. Va sur https://vercel.com → **Add New → Project**
2. Importe `danis_para`
3. Ajoute les **Environment Variables** :

| Nom | Valeur |
|---|---|
| `NEXT_PUBLIC_DATA_MODE` | `cloud` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ton-projet.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `ta_clé...` |

4. **Deploy**

---

## 8. Structure des images

| Type | Emplacement | Nom du fichier |
|---|---|---|
| Images seed (démo) | Bucket `products` | `ceinture-lombaire.jpeg` |
| Upload nouvel produit | Bucket `products` | `PR-{nom-produit}-{id}.jpeg` |
| Fichiers locaux | `public/products/archive/` | (hors git) |

- **Ajout** → upload vers Storage + sauvegarde URL en DB
- **Modification image** → supprime l'ancienne du Storage + upload nouvelle
- **Suppression produit** → supprime l'image du Storage + supprime la ligne en DB

---

## 9. Synchronisation complète

| Action | Base de données | Storage images |
|---|---|---|
| Ajouter un produit | ✅ INSERT | ✅ Upload |
| Modifier un produit | ✅ UPDATE | ✅ Remplace l'ancienne |
| Supprimer un produit | ✅ DELETE | ✅ Supprime l'image |
| Ajouter un client | ✅ INSERT | — |
| Modifier un client | ✅ UPDATE | — |
| Supprimer un client | ✅ DELETE | — |
| Vente (POS) | ✅ INSERT ventes + UPDATE client total_achats | — |

---

## 10. Dépannage

| Problème | Solution |
|---|---|
| Images ne s'affichent pas | Vérifier que le bucket `products` est **public** |
| Upload échoue "violates RLS" | Vérifier la politique INSERT pour `anon` (étape 4) |
| Table introuvable | Exécuter `supabase/schema.sql` dans SQL Editor |
| Page blanche au login | Console F12 → l'erreur s'affiche |

---

## Fichiers dans GitHub

| Fichier | Inclus ? | Raison |
|---|---|---|
| `supabase/schema.sql` | ✅ Oui | Structure des tables |
| `supabase/seed.sql` | ✅ Oui | Données de démo |
| `.env` / `.env.local` | ❌ Non | Clés secrètes |
| `public/products/` | ❌ Non | Images gérées par Storage |
| `.env.example` | ✅ Oui | Template sans valeurs |
