"use client";

import { useRef } from "react";
import { CartItem, Client } from "@/lib/types";
import { formatMad } from "@/lib/utils";

type Props = {
  cart: CartItem[];
  client?: Client | null;
  onClose: () => void;
};

export function InvoiceReceipt({ cart, client, onClose }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const total = cart.reduce((sum, item) => sum + item.quantite * item.produit.prix, 0);
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Facture - Dani's Parapharmacy</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 13px; padding: 24px; color: #1a1a1a; max-width: 320px; margin: 0 auto; }
            h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #ccc; padding-bottom: 12px; }
            .header p { margin: 2px 0; color: #666; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; color: #666; padding-bottom: 6px; }
            td { padding: 4px 0; }
            .right { text-align: right; }
            .total-row td { border-top: 2px solid #333; font-weight: bold; padding-top: 8px; font-size: 15px; }
            .footer { text-align: center; margin-top: 24px; border-top: 1px dashed #ccc; padding-top: 12px; font-size: 11px; color: #888; }
            .client-info { margin-bottom: 12px; padding: 8px; background: #f5f5f5; border-radius: 8px; font-size: 11px; }
            .no-print { display: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Dani's Parapharmacy</h1>
            <p>Logiciel de démonstration</p>
            <p>${date}</p>
          </div>
          ${client ? `<div class="client-info"><strong>Client:</strong> ${client.nom}<br><strong>Tél:</strong> ${client.telephone}</div>` : ""}
          <table>
            <tr><th>Article</th><th class="right">Qté</th><th class="right">Prix</th></tr>
            ${cart.map(item => `
              <tr>
                <td>${item.produit.nom}</td>
                <td class="right">${item.quantite}</td>
                <td class="right">${formatMad(item.quantite * item.produit.prix)}</td>
              </tr>
            `).join("")}
            <tr class="total-row"><td colspan="2">Total</td><td class="right">${formatMad(total)}</td></tr>
          </table>
          <div class="footer">
            <p>Merci de votre confiance</p>
            <p>Dani's Parapharmacy — Démo</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-[30px] bg-white p-6 shadow-2xl">
        <div ref={receiptRef}>
          <div className="text-center border-b border-dashed border-[var(--border)] pb-4">
            <h2 className="text-lg font-bold text-[var(--primary-deep)]">Dani&apos;s Parapharmacy</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Logiciel de démonstration</p>
            <p className="text-xs text-[var(--muted)]">{date}</p>
          </div>

          {client && (
            <div className="mt-3 rounded-2xl bg-[#f4f8f7] p-3 text-xs text-[var(--primary-deep)]">
              <strong>Client:</strong> {client.nom}<br />
              <strong>Tél:</strong> {client.telephone}
            </div>
          )}

          <div className="mt-4 space-y-2">
            {cart.map((item) => (
              <div key={item.produit.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--primary-deep)]">{item.produit.nom}</p>
                  <p className="text-xs text-[var(--muted)]">{item.produit.categorie}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="font-semibold text-[var(--primary)]">{formatMad(item.quantite * item.produit.prix)}</p>
                  <p className="text-xs text-[var(--muted)]">x{item.quantite}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t-2 border-[var(--primary-deep)] pt-3 flex items-center justify-between">
            <span className="text-base font-bold text-[var(--primary-deep)]">Total</span>
            <span className="text-xl font-bold text-[var(--primary)]">{formatMad(total)}</span>
          </div>

          <p className="mt-4 text-center text-xs text-[var(--muted)] border-t border-dashed border-[var(--border)] pt-4">
            Merci de votre confiance — Dani&apos;s Parapharmacy
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 cursor-pointer rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-deep)]"
          >
            Imprimer / PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[#f5f5f5]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
