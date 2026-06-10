create extension if not exists "pgcrypto";

create table if not exists produits (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text not null,
  prix numeric(10,2) not null,
  stock integer not null default 0,
  image_url text not null,
  categorie text not null
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  telephone text not null unique,
  total_achats numeric(10,2) not null default 0
);

create table if not exists ventes (
  id uuid primary key default gen_random_uuid(),
  produit_id uuid not null references produits(id) on delete cascade,
  quantite integer not null,
  total numeric(10,2) not null,
  date timestamptz not null default now(),
  client_id uuid references clients(id) on delete set null
);
