"use client";

import { seedData } from "@/data/seed";
import { dataMode, getStorageUrl, supabase } from "@/lib/supabase";
import { AppData, CartItem, Client, Product, Sale, categories as defaultCategories } from "@/lib/types";

const STORAGE_KEY = "danis-parapharmacy-demo";

function migrateProductImageUrl(imageUrl: string) {
  return imageUrl.endsWith(".svg") ? imageUrl.replace(".svg", ".jpeg") : imageUrl;
}

function resolveImageUrl(imageUrl: string): string {
  const migrated = migrateProductImageUrl(imageUrl);
  if (dataMode === "cloud" && migrated.startsWith("/products/")) {
    const storageUrl = getStorageUrl();
    if (storageUrl) {
      return `${storageUrl}/${migrated.replace("/products/", "")}`;
    }
  }
  return migrated;
}

function migrateDataImages(data: AppData): AppData {
  return {
    ...data,
    categories: data.categories ?? [...defaultCategories],
    produits: data.produits.map((product) => ({
      ...product,
      image_url: resolveImageUrl(product.image_url),
    })),
  };
}

function cloneSeed(): AppData {
  return migrateDataImages({
    produits: structuredClone(seedData.produits),
    clients: structuredClone(seedData.clients),
    ventes: structuredClone(seedData.ventes),
    categories: structuredClone(seedData.categories),
  });
}

function normalizeCloudData(data: {
  produits?: Product[] | null;
  clients?: Client[] | null;
  ventes?: Sale[] | null;
  categories?: string[];
}): AppData {
  return migrateDataImages({
    produits: data.produits ?? [],
    clients: data.clients ?? [],
    ventes: data.ventes ?? [],
    categories: data.categories ?? [...defaultCategories],
  });
}

export async function loadData(): Promise<AppData> {
  if (dataMode === "cloud" && supabase) {
    const [produitsRes, clientsRes, ventesRes] = await Promise.all([
      supabase.from("produits").select("*").order("nom"),
      supabase.from("clients").select("*").order("nom"),
      supabase.from("ventes").select("*").order("date", { ascending: false }),
    ]);

    const produits = produitsRes.data as Product[] | null;
    const fromProducts = [...new Set((produits ?? []).map((p) => p.categorie))];
    const merged = [...new Set([...defaultCategories, ...fromProducts])];

    return normalizeCloudData({
      produits,
      clients: clientsRes.data as Client[] | null,
      ventes: ventesRes.data as Sale[] | null,
      categories: merged,
    });
  }

  if (typeof window === "undefined") {
    return cloneSeed();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = cloneSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = migrateDataImages(JSON.parse(raw) as AppData);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  return parsed;
}

async function persistLocal(data: AppData) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export async function resetLocalData() {
  const data = cloneSeed();
  await persistLocal(data);
  return data;
}

async function uploadImage(file: File, productName: string): Promise<string | null> {
  if (dataMode !== "cloud" || !supabase) return null;
  const ext = file.name.split(".").pop() || "jpeg";
  const slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const fileName = `${slug}.${ext}`;
  const { data, error } = await supabase.storage
    .from("products")
    .upload(fileName, file, { upsert: false });
  if (error) return null;
  const storageUrl = getStorageUrl();
  return storageUrl ? `${storageUrl}/${data.path}` : null;
}

async function deleteStorageImage(imageUrl: string) {
  if (dataMode !== "cloud" || !imageUrl.startsWith(getStorageUrl() || "")) return;
  const fileName = imageUrl.split("/").pop();
  if (!fileName) return;
  try {
    await fetch("/api/delete-storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: fileName }),
    });
  } catch {
    // ignore
  }
}

export async function saveProduct(product: Product, current: AppData) {
  if (dataMode === "cloud" && supabase) {
    let image_url = product.image_url;
    const oldProduct = current.produits.find((p) => p.id === product.id);
    if (image_url.startsWith("data:")) {
      if (oldProduct) await deleteStorageImage(oldProduct.image_url);
      const blob = await (await fetch(image_url)).blob();
      const file = new File([blob], "image.jpeg", { type: "image/jpeg" });
      const uploaded = await uploadImage(file, product.nom);
      image_url = uploaded || "/assets/logo/green_logo.jpeg";
    }
    await supabase.from("produits").upsert({ ...product, image_url });
    return loadData();
  }

  const exists = current.produits.some((item) => item.id === product.id);
  const produits = exists
    ? current.produits.map((item) => (item.id === product.id ? product : item))
    : [product, ...current.produits];
  const next = { ...current, produits };
  await persistLocal(next);
  return next;
}

export async function processSale(
  cart: CartItem[],
  current: AppData,
  clientId?: string | null,
) {
  if (!cart.length) {
    return current;
  }

  const ventes: Sale[] = [];
  const produits = [...current.produits];
  const clients = [...current.clients];

  for (const item of cart) {
    const productIndex = produits.findIndex((product) => product.id === item.produit.id);
    if (productIndex < 0) {
      continue;
    }

    const total = item.quantite * item.produit.prix;
    produits[productIndex] = {
      ...produits[productIndex],
      stock: Math.max(0, produits[productIndex].stock - item.quantite),
    };

    ventes.push({
      id: crypto.randomUUID(),
      produit_id: item.produit.id,
      quantite: item.quantite,
      total,
      date: new Date().toISOString(),
      client_id: clientId ?? null,
    });
  }

  if (clientId) {
    const totalClient = ventes.reduce((sum, sale) => sum + sale.total, 0);
    const clientIndex = clients.findIndex((client) => client.id === clientId);
    if (clientIndex >= 0) {
      clients[clientIndex] = {
        ...clients[clientIndex],
        total_achats: clients[clientIndex].total_achats + totalClient,
      };
    }
  }

  if (dataMode === "cloud" && supabase) {
    for (const product of produits) {
      await supabase.from("produits").update({ stock: product.stock }).eq("id", product.id);
    }
    if (ventes.length) {
      await supabase.from("ventes").insert(ventes);
    }
    if (clientId) {
      const updated = clients.find((client) => client.id === clientId);
      if (updated) {
        await supabase
          .from("clients")
          .update({ total_achats: updated.total_achats })
          .eq("id", clientId);
      }
    }
    return loadData();
  }

  const next = {
    produits,
    clients,
    ventes: [...ventes, ...current.ventes],
    categories: current.categories,
  };
  await persistLocal(next);
  return next;
}

export async function deleteProduct(productId: string, current: AppData) {
  if (dataMode === "cloud" && supabase) {
    const product = current.produits.find((p) => p.id === productId);
    if (product) await deleteStorageImage(product.image_url);
    await supabase.from("produits").delete().eq("id", productId);
    return loadData();
  }

  const produits = current.produits.filter((item) => item.id !== productId);
  const next = { ...current, produits };
  await persistLocal(next);
  return next;
}

export async function saveClient(client: Client, current: AppData) {
  if (dataMode === "cloud" && supabase) {
    await supabase.from("clients").upsert(client);
    return loadData();
  }

  const exists = current.clients.some((item) => item.id === client.id);
  const clients = exists
    ? current.clients.map((item) => (item.id === client.id ? client : item))
    : [client, ...current.clients];
  const next = { ...current, clients };
  await persistLocal(next);
  return next;
}

export async function deleteClient(clientId: string, current: AppData) {
  if (dataMode === "cloud" && supabase) {
    await supabase.from("clients").delete().eq("id", clientId);
    return loadData();
  }

  const clients = current.clients.filter((item) => item.id !== clientId);
  const next = { ...current, clients };
  await persistLocal(next);
  return next;
}

export async function saveCategory(name: string, current: AppData) {
  const trimmed = name.trim().toUpperCase();
  if (!trimmed || current.categories.includes(trimmed)) return current;
  const next = { ...current, categories: [...current.categories, trimmed] };
  if (dataMode !== "cloud") await persistLocal(next);
  return next;
}

export async function deleteCategory(name: string, current: AppData) {
  const produits = current.produits.map((p) =>
    p.categorie === name ? { ...p, categorie: "NON CLASSÉ" } : p,
  );

  if (dataMode === "cloud" && supabase) {
    await supabase
      .from("produits")
      .update({ categorie: "NON CLASSÉ" })
      .eq("categorie", name);
    return loadData();
  }

  const next = { ...current, produits, categories: current.categories.filter((c) => c !== name) };
  await persistLocal(next);
  return next;
}
