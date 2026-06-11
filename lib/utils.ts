import { Client, Product, Sale } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatMad(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export function computeClientHistory(client: Client, sales: Sale[], products: Product[]) {
  return sales
    .filter((sale) => sale.client_id === client.id)
    .map((sale) => ({
      ...sale,
      produit: products.find((product) => product.id === sale.produit_id),
    }))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
