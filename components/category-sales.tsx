"use client";

import { useMemo } from "react";
import { Sale, Product } from "@/lib/types";

type Props = {
  ventes: Sale[];
  produits: Product[];
};

const BAR_COLORS = [
  "linear-gradient(90deg, #246f72, #3a9fa3)",
  "linear-gradient(90deg, #2d878b, #56b4b8)",
  "linear-gradient(90deg, #1a5c5f, #2d878b)",
  "linear-gradient(90deg, #184c4e, #246f72)",
  "linear-gradient(90deg, #3a9fa3, #6cc5c9)",
  "linear-gradient(90deg, #0f3d40, #1a5c5f)",
  "linear-gradient(90deg, #56b4b8, #89d4d7)",
  "linear-gradient(90deg, #246f72, #184c4e)",
  "linear-gradient(90deg, #2d878b, #1a5c5f)",
  "linear-gradient(90deg, #3a9fa3, #246f72)",
];

export function CategorySales({ ventes, produits }: Props) {
  const data = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const sale of ventes) {
      const product = produits.find((p) => p.id === sale.produit_id);
      if (!product) continue;
      totals[product.categorie] = (totals[product.categorie] || 0) + sale.total;
    }
    return Object.entries(totals)
      .map(([categorie, total]) => ({ categorie, total }))
      .sort((a, b) => b.total - a.total);
  }, [ventes, produits]);

  if (!data.length) return null;

  const maxTotal = Math.max(...data.map((d) => d.total));

  return (
    <div className="space-y-4">
      {data.map(({ categorie, total }, idx) => {
        const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
        return (
          <div key={categorie} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--primary-deep)]">
                {categorie}
              </span>
              <span className="text-sm font-semibold text-[var(--primary)]">
                {total.toLocaleString("fr-FR")} €
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#edf5f5]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: BAR_COLORS[idx % BAR_COLORS.length],
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] text-[var(--muted)]">
        Total des ventes par catégorie — trié du plus au moins vendu
      </p>
    </div>
  );
}
