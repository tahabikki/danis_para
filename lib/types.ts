export const categories = [
  "MATÉRIEL MÉDICAL",
  "ORTHOPÉDIE",
  "PHYTO-AROMATHÉRAPIE",
  "COMPLÉMENT ALIMENTAIRE",
  "ESPACE BÉBÉ & MAMAN",
  "DERMOCOSMÉTIQUE",
] as const;

export type ProductCategory = (typeof categories)[number];

export type Product = {
  id: string;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  image_url: string;
  categorie: string;
};

export type Client = {
  id: string;
  nom: string;
  telephone: string;
  total_achats: number;
};

export type Sale = {
  id: string;
  produit_id: string;
  quantite: number;
  total: number;
  date: string;
  client_id?: string | null;
};

export type SaleWithRelations = Sale & {
  produit?: Product;
  client?: Client | null;
};

export type CartItem = {
  produit: Product;
  quantite: number;
};

export type AppData = {
  produits: Product[];
  clients: Client[];
  ventes: Sale[];
  categories: string[];
};
