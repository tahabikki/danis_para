"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Sale, Product } from "@/lib/types";

type Props = {
  ventes: Sale[];
  produits: Product[];
};

export function SalesChart({ ventes, produits }: Props) {
  const chartData = useMemo(() => {
    const now = new Date();
    const months: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = 0;
    }

    for (const sale of ventes) {
      const d = new Date(sale.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in months) {
        months[key] += sale.total;
      }
    }

    return Object.entries(months).map(([month, total]) => {
      const [year, m] = month.split("-");
      const date = new Date(Number(year), Number(m) - 1);
      const label = date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      return { mois: label, total };
    });
  }, [ventes]);

  if (!chartData.length) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#edf5f5" />
          <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#8ba8a8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#8ba8a8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #e2edec",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              fontSize: 13,
            }}
            formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} MAD`, "Ventes"]}
          />
          <Bar dataKey="total" fill="#246f72" radius={[8, 8, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
