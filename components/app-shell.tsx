"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChartColumnBig,
  ChevronDown,
  Database,
  Info,
  Layers,
  LogOut,
  Menu,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Trash2,
  Upload,
  UserPlus,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { deleteClient, deleteProduct, loadData, processSale, resetLocalData, saveCategory, saveClient, saveProduct, deleteCategory } from "@/lib/data-service";
import { dataMode } from "@/lib/supabase";
import { type AppData, type CartItem, type Client, type Product } from "@/lib/types";
import { cn, computeClientHistory, formatDate, formatMad, isToday } from "@/lib/utils";
import { CategorySales } from "@/components/category-sales";
import { InvoiceReceipt } from "@/components/invoice-receipt";

type ViewKey = "dashboard" | "produits" | "clients" | "categories" | "pos" | "ventes" | "settings";

type DemoUser = {
  email: string;
  password: string;
  nom: string;
  role: string;
};

const DEMO_ADMIN: DemoUser = {
  email: "admin@daniparasante.ma",
  password: "demo1234",
  nom: "Administrateur Dani",
  role: "Admin Demo",
};

const SESSION_KEY = "dani-admin-session";

const navItems = [
  { key: "dashboard", label: "Tableau de bord", icon: ChartColumnBig },
  { key: "produits", label: "Produits", icon: Package },
  { key: "categories", label: "Catégories", icon: Tags },
  { key: "clients", label: "Clients", icon: Users },
  { key: "pos", label: "POS", icon: ShoppingCart },
  { key: "ventes", label: "Ventes", icon: WalletCards },
  { key: "settings", label: "Paramètres", icon: Settings },
] satisfies Array<{ key: ViewKey; label: string; icon: LucideIcon }>;

const emptyProduct: Product = {
  id: "",
  nom: "",
  description: "",
  prix: 0,
  stock: 0,
  image_url: "",
  categorie: "DERMOCOSMÉTIQUE",
  date_expiration: null,
  code_barre: null,
};

const emptyClient: Client = {
  id: "",
  nom: "",
  telephone: "",
  total_achats: 0,
};

export function AppShell() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState(DEMO_ADMIN.email);
  const [loginPassword, setLoginPassword] = useState(DEMO_ADMIN.password);
  const [loginError, setLoginError] = useState("");
  const [view, setView] = useState<ViewKey>("dashboard");
  const [data, setData] = useState<AppData | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productForm, setProductForm] = useState<Product>(emptyProduct);
  const [clientForm, setClientForm] = useState<Client>(emptyClient);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryAddQuery, setCategoryAddQuery] = useState("");
  const [categoryAddOpen, setCategoryAddOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [produitsTab, setProduitsTab] = useState<"liste" | "nouveau">("liste");
  const [clientsTab, setClientsTab] = useState<"liste" | "nouveau">("liste");
  const [venteClientFilter, setVenteClientFilter] = useState("Tous");
  const [venteDateFilter, setVenteDateFilter] = useState("");

  useEffect(() => {
    const session = window.sessionStorage.getItem(SESSION_KEY);
    if (session === "connected") {
      setIsLoggedIn(true);
    }
    loadData().then(setData);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    const value = query.toLowerCase();
    return data.produits.filter((product) => {
      const matchesSearch =
        product.nom.toLowerCase().includes(value) ||
        product.categorie.toLowerCase().includes(value);
      const matchesCategory = categoryFilter === "Toutes" || product.categorie === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [data, query, categoryFilter]);

  const posProducts = useMemo(() => {
    if (!data) return [];
    const value = barcodeQuery.trim().toLowerCase();
    if (!value) return data.produits;
    return data.produits.filter(
      (product) =>
        product.code_barre?.toLowerCase().includes(value) ||
        product.nom.toLowerCase().includes(value),
    );
  }, [data, barcodeQuery]);

  const filteredClients = useMemo(() => {
    if (!data) return [];
    const value = clientSearch.toLowerCase();
    return data.clients.filter(
      (client) =>
        client.nom.toLowerCase().includes(value) || client.telephone.includes(value),
    );
  }, [data, clientSearch]);

  const categoryStats = useMemo(() => {
    if (!data) return [];
    return data.categories.map((cat) => {
      const prods = data.produits.filter((p) => p.categorie === cat);
      const totalStock = prods.reduce((s, p) => s + p.stock, 0);
      const totalValue = prods.reduce((s, p) => s + p.prix * p.stock, 0);
      return { categorie: cat, count: prods.length, totalStock, totalValue };
    });
  }, [data]);

  const filteredVentes = useMemo(() => {
    if (!data) return [];
    return data.ventes.filter((sale) => {
      if (venteClientFilter !== "Tous" && sale.client_id !== venteClientFilter) return false;
      if (venteDateFilter) {
        const saleDate = sale.date.split("T")[0];
        if (saleDate !== venteDateFilter) return false;
      }
      return true;
    });
  }, [data, venteClientFilter, venteDateFilter]);

  const dashboardStats = useMemo(() => {
    if (!data) return null;

    const totalProducts = data.produits.length;
    const totalStock = data.produits.reduce((sum, product) => sum + product.stock, 0);
    const dailySales = data.ventes
      .filter((sale) => isToday(sale.date))
      .reduce((sum, sale) => sum + sale.total, 0);
    const lowStock = data.produits.filter((product) => product.stock <= 10);
    const topProducts = [...data.ventes].reduce<Record<string, number>>((acc, sale) => {
      acc[sale.produit_id] = (acc[sale.produit_id] ?? 0) + sale.quantite;
      return acc;
    }, {});

    return {
      totalProducts,
      totalStock,
      dailySales,
      lowStock,
      topProducts: Object.entries(topProducts)
        .map(([produitId, quantity]) => ({
          produit: data.produits.find((product) => product.id === produitId),
          quantity,
        }))
        .filter((item) => item.produit)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 4),
    };
  }, [data]);

  function handleLogin() {
    if (
      loginEmail.trim().toLowerCase() === DEMO_ADMIN.email &&
      loginPassword === DEMO_ADMIN.password
    ) {
      window.sessionStorage.setItem(SESSION_KEY, "connected");
      setIsLoggedIn(true);
      setLoginError("");
      return;
    }

    setLoginError("Identifiants invalides. Utilisez le compte de démonstration affiché.");
  }

  function handleLogout() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
  }

  async function handleSeedSupabase() {
    setSeeding(true);
    setSeedStatus(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSeedStatus({ ok: true, msg: `✓ ${json.categories} catégories, ${json.produits} produits, ${json.clients} clients, ${json.ventes} ventes importés` });
        const fresh = await loadData();
        setData(fresh);
      } else {
        setSeedStatus({ ok: false, msg: json.error || "Erreur lors du seed" });
      }
    } catch {
      setSeedStatus({ ok: false, msg: "Erreur réseau — vérifie que le serveur est lancé" });
    } finally {
      setSeeding(false);
    }
  }

  async function handleReset() {
    const next = await resetLocalData();
    setData(next);
    setCart([]);
    setSelectedClientId("");
  }

  async function handleSaveProduct() {
    if (!data || !productForm.nom.trim() || productForm.prix <= 0) return;
    setSavingProduct(true);
    setSaveFeedback(null);
    try {
      const product = { ...productForm, id: productForm.id || crypto.randomUUID() };
      const next = await saveProduct(product, data);
      setData(next);
      setProductForm(emptyProduct);
      setEditingProductId(null);
      setSaveFeedback("✓ Produit enregistré");
    } catch {
      setSaveFeedback("✗ Erreur lors de l'enregistrement");
    } finally {
      setSavingProduct(false);
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  }

  function handleEditProduct(product: Product) {
    setProductForm(product);
    setEditingProductId(product.id);
    setProduitsTab("nouveau");
  }

  async function handleDeleteProduct(productId: string) {
    if (!data) return;
    const next = await deleteProduct(productId, data);
    setData(next);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProductForm((current) => ({ ...current, image_url: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function handleDownloadVentesPDF() {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !data) return;
    const rows = filteredVentes.map((sale) => {
      const product = data.produits.find((item) => item.id === sale.produit_id);
      const client = data.clients.find((item) => item.id === sale.client_id);
      return `<tr>
        <td style="padding:8px 12px;border-top:1px solid #e2edec">${product?.nom ?? "Produit"}</td>
        <td style="padding:8px 12px;border-top:1px solid #e2edec;text-align:center">${sale.quantite}</td>
        <td style="padding:8px 12px;border-top:1px solid #e2edec">${client ? `${client.nom} (${client.telephone})` : "Sans client"}</td>
        <td style="padding:8px 12px;border-top:1px solid #e2edec">${new Date(sale.date).toLocaleDateString("fr-FR")}</td>
        <td style="padding:8px 12px;border-top:1px solid #e2edec;text-align:right;font-weight:600">${formatMad(sale.total)}</td>
      </tr>`;
    }).join("");
    const total = formatMad(filteredVentes.reduce((s, v) => s + v.total, 0));
    const dateLabel = venteDateFilter ? new Date(venteDateFilter).toLocaleDateString("fr-FR") : "Toutes les dates";
    const clientLabel = venteClientFilter === "Tous" ? "Tous les clients" : (data.clients.find((c) => c.id === venteClientFilter)?.nom ?? venteClientFilter);
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Historique des ventes - Dani's Parapharmacy</title><style>
      body{font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:32px;color:#1a1a1a;max-width:900px;margin:0 auto}
      h1{font-size:20px;margin:0 0 4px;color:#184c4e}
      .filters{font-size:12px;color:#666;margin-bottom:20px}
      table{width:100%;border-collapse:collapse}
      th{text-align:left;font-size:11px;text-transform:uppercase;color:#666;padding:8px 12px;border-bottom:2px solid #184c4e}
      td{font-size:13px}
      .total-row td{border-top:2px solid #184c4e;font-weight:bold;padding-top:10px;font-size:15px;color:#184c4e}
      .footer{text-align:center;margin-top:32px;font-size:11px;color:#999;border-top:1px dashed #ccc;padding-top:16px}
    </style></head><body>
      <h1>Dani&apos;s Parapharmacy</h1>
      <p style="font-size:12px;color:#666;margin:2px 0 4px">Historique des ventes</p>
      <div class="filters">${clientLabel} · ${dateLabel} · ${filteredVentes.length} vente${filteredVentes.length !== 1 ? "s" : ""}</div>
      <table><thead><tr><th>Produit</th><th style="text-align:center">Qté</th><th>Client</th><th>Date</th><th style="text-align:right">Total</th></tr></thead><tbody>${rows}</tbody></table>
      <table style="margin-top:0"><tr class="total-row"><td colspan="4">Total général</td><td style="text-align:right">${total}</td></tr></table>
      <div class="footer">Généré par Dani's Parapharmacy — Logiciel de démonstration</div>
    </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  async function handleSaveClient() {
    if (!data || !clientForm.nom.trim() || !clientForm.telephone.trim()) return;
    const client = { ...clientForm, id: clientForm.id || crypto.randomUUID() };
    const next = await saveClient(client, data);
    setData(next);
    setClientForm(emptyClient);
    setEditingClientId(null);
    setSelectedClientId(client.id);
  }

  function handleEditClient(client: Client) {
    setClientForm(client);
    setEditingClientId(client.id);
  }

  async function handleDeleteClient(clientId: string) {
    if (!data) return;
    const next = await deleteClient(clientId, data);
    setData(next);
    if (selectedClientId === clientId) {
      setSelectedClientId("");
    }
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.produit.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.produit.id === product.id
            ? { ...item, quantite: Math.min(product.stock, item.quantite + 1) }
            : item,
        );
      }
      return [...current, { produit: product, quantite: 1 }];
    });
    setView("pos");
  }

  async function validateSale() {
    if (!data || !cart.length) return;
    const next = await processSale(cart, data, selectedClientId || null);
    setData(next);
    setShowInvoice(true);
  }

  function closeInvoice() {
    setShowInvoice(false);
    setCart([]);
    setSelectedClientId("");
    setView("ventes");
  }

  if (!data || !dashboardStats) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-card flex w-full max-w-md flex-col items-center rounded-[32px] p-10 text-center">
          <Image
            src="/assets/logo/green_logo.jpeg"
            alt="Dani's Parapharmacy"
            width={88}
            height={88}
            className="mb-4 h-24 w-24 rounded-3xl object-cover"
          />
          <p className="text-lg font-semibold text-[var(--primary-deep)]">
            Chargement de Dani&apos;s Parapharmacy...
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Initialisation du mode {dataMode === "cloud" ? "cloud Supabase" : "local hors ligne"}.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-y-auto px-4 py-4 sm:py-8 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(254,238,177,0.85),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(36,111,114,0.25),transparent_32%),linear-gradient(135deg,#f8faf8_0%,#edf5f3_100%)]" />
        <div className="glass-card relative grid w-full max-w-6xl overflow-hidden rounded-3xl sm:rounded-[40px] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative p-5 text-white sm:p-8 md:p-12" style={{ background: "linear-gradient(160deg, #0f3d40 0%, #246f72 56%, #2d878b 100%)" }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(254,238,177,0.22),transparent_26%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.12),transparent_20%)]" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <Image src="/assets/logo/green_logo.jpeg" alt="Logo" width={70} height={70} className="h-14 w-14 rounded-2xl object-cover shadow-2xl sm:h-18 sm:w-18 sm:rounded-3xl" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/70 sm:text-xs">Back Office</p>                </div>
              </div>
              <h1 className="mt-4 max-w-xl text-xl font-semibold leading-tight sm:mt-8 sm:text-2xl lg:mt-10 lg:text-4xl">
                Espace administrateur de la démo parapharmacie
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/78 sm:mt-4 sm:text-base">
                Connectez-vous pour gérer le stock, enregistrer des ventes, suivre les clients et présenter un vrai logiciel à votre client.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-8 sm:grid sm:grid-cols-3 sm:gap-4 lg:mt-10">
                <FeatureChip label="POS complet" />
                <FeatureChip label="Stock en direct" />
                <FeatureChip label="Clients & ventes" />
              </div>
            </div>
          </section>

          <section className="p-5 sm:p-8 md:p-12">
            <div className="mx-auto max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--primary-deep)]">
                <ShieldCheck className="h-4 w-4" />
                Connexion administrateur
              </div>
              <h2 className="section-title mt-4 text-xl font-semibold sm:mt-6 sm:text-2xl lg:text-3xl">Accéder au tableau de gestion</h2>
              <p className="mt-2 text-sm text-[var(--muted)] sm:mt-3">
                Démo simple: pas de sécurité avancée, juste une vraie entrée admin convaincante.
              </p>

              <div className="mt-4 space-y-3 sm:mt-8 sm:space-y-4">
                <Input label="Email" value={loginEmail} onChange={setLoginEmail} />
                <Input label="Mot de passe" type="password" value={loginPassword} onChange={setLoginPassword} />
                {loginError ? (
                  <div className="rounded-2xl border border-[#f3c3bf] bg-[#fff1ef] px-4 py-3 text-sm text-[var(--danger)]">
                    {loginError}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full cursor-pointer rounded-2xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-deep)] sm:py-3 sm:text-base"
                >
                  Se connecter
                </button>
              </div>

              <div className="mt-4 rounded-[28px] border border-[var(--border)] bg-white/80 p-5 sm:mt-8">
                <p className="text-sm font-semibold text-[var(--primary-deep)]">Compte de démonstration</p>
                <p className="mt-3 text-sm text-[var(--muted)]">Email: {DEMO_ADMIN.email}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Mot de passe: {DEMO_ADMIN.password}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  Mode {dataMode === "cloud" ? "cloud" : "local"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const saleTotal = cart.reduce((sum, item) => sum + item.quantite * item.produit.prix, 0);
  const selectedClient = data.clients.find((client) => client.id === selectedClientId);

  return (
    <div className="relative flex h-screen overflow-hidden">
      <div className="mx-auto flex w-full max-w-[1600px] gap-4 px-4 md:px-6">
        {/* ── Desktop sidebar (lg+) ── */}
        <aside
          className="hidden w-[300px] shrink-0 flex-col overflow-y-auto rounded-[34px] p-6 text-white shadow-[0_24px_70px_rgba(15,61,64,0.28)] lg:mb-6 lg:mt-6 lg:flex"
          style={{ background: "linear-gradient(180deg, #113c3f 0%, #19585b 44%, #246f72 100%)", height: "calc(100vh - 3rem)" }}
        >
          <div className="flex items-center gap-3">
            <Image src="/assets/logo/white_logo.jpeg" alt="Logo Dani's Parapharmacy" width={60} height={60} className="h-15 w-15 rounded-2xl object-cover" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/68">Admin Panel</p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/8 p-4">
            <p className="text-sm text-white/70">Connecté en tant que</p>
            <p className="mt-2 text-lg font-semibold">{DEMO_ADMIN.nom}</p>
            <p className="text-sm text-white/65">{DEMO_ADMIN.role}</p>
          </div>

          <nav className="mt-6 flex-1 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setView(item.key)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium transition",
                    view === item.key
                      ? "bg-white text-[var(--primary-deep)] shadow-lg"
                      : "bg-white/6 text-white hover:bg-white/14",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </aside>

        {/* ── Main content area ── */}
        <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 sm:px-6 md:gap-4 md:px-8 md:py-6">
          {/* ── Mobile top navbar (< lg) ── */}
          <div className="flex items-center justify-between rounded-[34px] bg-white p-3 shadow-sm lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex cursor-pointer items-center justify-center rounded-2xl bg-[var(--primary)] p-2.5 text-white transition hover:bg-[var(--primary-deep)]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-[var(--primary-deep)]">
              {view === "dashboard" && "Tableau de bord"}
              {view === "produits" && "Produits"}
              {view === "categories" && "Catégories"}
              {view === "clients" && "Clients"}
              {view === "pos" && "Point de vente"}
              {view === "ventes" && "Ventes"}
              {view === "settings" && "Paramètres"}
            </h1>
            <div className="w-10" />
          </div>

          {/* ── Mobile menu overlay (< lg) ── */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
              <div className="absolute inset-y-0 left-0 flex w-[280px] flex-col p-4 text-white shadow-2xl"
                style={{ background: "linear-gradient(180deg, #113c3f 0%, #19585b 44%, #246f72 100%)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Image src="/assets/logo/white_logo.jpeg" alt="Logo" width={36} height={36} className="h-9 w-9 rounded-xl object-cover" />
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">Menu</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="flex cursor-pointer items-center justify-center rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <nav className="mt-6 flex-1 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => { setView(item.key); setSidebarOpen(false); }}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition",
                          view === item.key
                            ? "bg-white text-[var(--primary-deep)] shadow-lg"
                            : "bg-white/6 text-white hover:bg-white/14",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}

          {/* ── Page header (desktop) ── */}
          <header className="hidden rounded-[34px] bg-white p-6 shadow-sm lg:block">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                  {view === "dashboard" && "Dani's Parapharmacy"}
                  {view === "produits" && "Gestion du catalogue"}
                  {view === "categories" && "Catégories"}
                  {view === "clients" && "Gestion des clients"}
                  {view === "pos" && "Point de vente"}
                  {view === "ventes" && "Historique"}
                  {view === "settings" && "Paramètres"}
                </p>
                <h1 className="section-title mt-2 text-3xl font-semibold">
                  {view === "dashboard" && "Logiciel de démonstration parapharmacie"}
                  {view === "produits" && "Catalogue produits"}
                  {view === "categories" && "Vue par catégorie"}
                  {view === "clients" && "Fidélisation & suivi"}
                  {view === "pos" && "Encaissement rapide"}
                  {view === "ventes" && "Ventes réalisées"}
                  {view === "settings" && "Configuration de l'application"}
                </h1>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {view === "dashboard" && "Stock, ventes, clients et pilotage quotidien dans une interface claire et rapide à comprendre."}
                  {view === "produits" && "Ajoutez, modifiez ou supprimez des produits. Importez vos propres images."}
                  {view === "categories" && "Consultez la répartition des produits par catégorie et les statistiques associées."}
                  {view === "clients" && "Recherchez, ajoutez et consultez l'historique d'achats de vos clients."}
                  {view === "pos" && "Cliquez sur un produit pour l'ajouter au panier et validez la vente."}
                  {view === "ventes" && "L'ensemble des transactions enregistrées, en un coup d'oeil."}
                  {view === "settings" && "Informations système et actions de maintenance."}
                </p>
              </div>
              {view === "dashboard" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <QuickAction
                    title="Nouvelle vente"
                    subtitle="Accéder au POS"
                    onClick={() => setView("pos")}
                  />
                  <QuickAction
                    title="Ajouter produit"
                    subtitle="Mettre à jour le catalogue"
                    onClick={() => setView("produits")}
                  />
                </div>
              ) : null}
            </div>
          </header>

          {view === "dashboard" && (
            <section className="space-y-4">
              <div className="overflow-hidden rounded-[30px] text-white" style={{ background: "linear-gradient(135deg, #1a5c5f 0%, #2d878b 50%, #3a9fa3 100%)" }}>
                <div className="relative px-4 py-4 md:px-6 md:py-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_30%)]" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/75">
                        {new Date().getHours() < 12 ? "Bonjour" : new Date().getHours() < 18 ? "Bon après-midi" : "Bonsoir"}
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold">Tableau de bord</h2>
                      <p className="mt-1 text-sm text-white/70">
                        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm md:px-4 md:py-3">
                        <p className="text-lg font-bold md:text-2xl">{dashboardStats.totalProducts}</p>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/70 md:text-[11px]">Produits</p>
                      </div>
                      <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm md:px-4 md:py-3">
                        <p className="text-lg font-bold md:text-2xl">{dashboardStats.lowStock.length}</p>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/70 md:text-[11px]">Alertes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4 md:gap-4">
                <StatCard title="Produits" value={dashboardStats.totalProducts.toString()} subtitle="Références actives" />
                <StatCard title="Stock total" value={dashboardStats.totalStock.toString()} subtitle="Unités en rayon" />
                <StatCard title="Ventes du jour" value={formatMad(dashboardStats.dailySales)} subtitle="Chiffre d'affaires" />
                <StatCard title="Alertes stock" value={dashboardStats.lowStock.length.toString()} subtitle="Articles à surveiller" />
              </div>

              <div className="rounded-[30px] bg-white p-4 shadow-sm transition-all hover:shadow-md md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5f5]">
                      <Package className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h2 className="section-title text-xl font-semibold">Top produits</h2>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        Les meilleures rotations
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setView("ventes")}
                    className="cursor-pointer rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-all hover:bg-[var(--accent)]"
                  >
                    Voir ventes
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {dashboardStats.topProducts.map((item, idx) => (
                    <div key={item.produit?.id} className="group flex items-center gap-4 rounded-[26px] border border-[var(--border)] bg-white/75 p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--primary)]/20 hover:shadow-md">
                      <div className="relative">
                        <img
                          loading="lazy" decoding="async"
                          src={item.produit?.image_url ?? "/assets/logo/green_logo.jpeg"}
                          alt={item.produit?.nom ?? ""}
                          width={64}
                          height={64}
                          onError={(e) => { (e.target as HTMLImageElement).src = "/assets/logo/green_logo.jpeg" }}
                          className="h-16 w-16 rounded-2xl border border-[var(--border)] bg-white object-contain p-2 transition-all group-hover:scale-105"
                        />
                        <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white shadow-sm">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--primary-deep)]">{item.produit?.nom}</p>
                        <p className="text-sm text-[var(--muted)]">{item.produit?.categorie}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#edf5f5]">
                            <div
                              className="h-full rounded-full bg-[var(--primary)] transition-all"
                              style={{ width: `${Math.min(100, (item.quantity / 5) * 100)}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-xs font-semibold text-[var(--primary)]">{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] bg-white p-4 shadow-sm transition-all hover:shadow-md md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5f5]">
                    <WalletCards className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h2 className="section-title text-xl font-semibold">Ventes par catégorie</h2>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">Répartition du chiffre d&apos;affaires.</p>
                  </div>
                </div>
                <div className="mt-4">
                  <CategorySales ventes={data.ventes} produits={data.produits} />
                </div>
              </div>

              <div className="rounded-[30px] bg-white p-4 shadow-sm transition-all hover:shadow-md md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ef]">
                      <ChartColumnBig className="h-5 w-5 text-[var(--danger)]" />
                    </div>
                    <div>
                      <h2 className="section-title text-xl font-semibold">Alerte stock faible</h2>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {dashboardStats.lowStock.length} produit{dashboardStats.lowStock.length > 1 ? "s" : ""} sous le seuil
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {dashboardStats.lowStock.map((product) => (
                    <div key={product.id} className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/72 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-[var(--danger)]/30 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          product.stock <= 5 ? "bg-[var(--danger)]" : "bg-[#b8860b]",
                        )} />
                        <div>
                          <p className="font-medium text-[var(--primary-deep)]">{product.nom}</p>
                          <p className="text-xs text-[var(--muted)]">{product.categorie}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        product.stock <= 5 ? "bg-[#fff0ef] text-[var(--danger)]" : "bg-[#fff8e5] text-[#b8860b]",
                      )}>
                        {product.stock} en stock
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {view === "produits" && (
            <section className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setProduitsTab("liste")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition-all md:gap-2 md:px-5 md:py-2.5 md:text-sm",
                    produitsTab === "liste"
                      ? "bg-[var(--primary)] text-white shadow-md"
                      : "border border-[var(--border)] bg-white text-[var(--primary-deep)] hover:border-[var(--primary)]/30 hover:bg-[#f5fafa]"
                  )}
                >
                  <Package className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="truncate">Tous les produits</span>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px] font-bold">{filteredProducts.length}</span>
                </button>
                <button
                  onClick={() => { setProduitsTab("nouveau"); setProductForm(emptyProduct); setEditingProductId(null); }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition-all md:gap-2 md:px-5 md:py-2.5 md:text-sm",
                    produitsTab === "nouveau"
                      ? "bg-[var(--primary)] text-white shadow-md"
                      : "border border-[var(--border)] bg-white text-[var(--primary-deep)] hover:border-[var(--primary)]/30 hover:bg-[#f5fafa]"
                  )}
                >
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {editingProductId ? "Modifier produit" : "Nouveau produit"}
                </button>
              </div>

              {produitsTab === "liste" && (
                <div className="rounded-[30px] bg-white p-4 shadow-sm md:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 md:h-16 md:w-16">
                      <Package className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold tracking-tight text-[var(--primary-deep)] md:text-2xl">Tous les produits</h2>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-0.5 text-xs font-semibold text-[var(--primary)] md:text-sm">
                          {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
                        </span>
                        <span className="hidden text-sm text-[var(--muted)] sm:inline">— cliquez sur un produit pour l&apos;ajouter au panier</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative order-1 md:order-none md:flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher un produit..."
                        className="w-full rounded-2xl border border-[var(--border)] bg-white/80 py-3.5 pl-11 pr-10 text-sm text-[var(--primary-deep)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-white focus:shadow-[0_0_0_4px_var(--accent)] md:w-56"
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => setQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-[var(--muted)] transition-colors hover:text-[var(--danger)]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="group relative order-2 md:order-none md:min-w-[220px]">
                      <Layers className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)] transition-colors group-hover:text-[var(--primary)]" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full appearance-none cursor-pointer rounded-2xl border border-[var(--border)] bg-white/80 py-3.5 pl-11 pr-10 text-sm font-medium text-[var(--primary-deep)] outline-none transition-all focus:border-[var(--primary)] focus:bg-white focus:shadow-[0_0_0_4px_var(--accent)] hover:border-[var(--primary)]/40"
                      >
                        <option value="Toutes">Toutes les catégories</option>
                        {data?.categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)] transition-colors group-hover:text-[var(--primary)]" />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredProducts.map((product, idx) => (
                      <article key={product.id} className="group rounded-[28px] border border-[var(--border)] bg-white/75 transition hover:shadow-lg">
                        <div className="relative overflow-hidden rounded-t-[28px] bg-[linear-gradient(180deg,#f8fbfa_0%,#f0f6f3_100%)]">
                          {idx < 4 ? (
                            <img fetchPriority="high" src={product.image_url} alt={product.nom} width={440} height={280} onError={(e) => { (e.target as HTMLImageElement).src = "/assets/logo/green_logo.jpeg" }} className="h-48 w-full object-contain p-6 transition duration-300 group-hover:scale-105" />
                          ) : (
                            <img loading="lazy" decoding="async" src={product.image_url} alt={product.nom} width={440} height={280} onError={(e) => { (e.target as HTMLImageElement).src = "/assets/logo/green_logo.jpeg" }} className="h-48 w-full object-contain p-6 transition duration-300 group-hover:scale-105" />
                          )}
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--primary-deep)] shadow-sm backdrop-blur-sm">
                            {product.categorie}
                          </span>
                          <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product)}
                              className="cursor-pointer rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--primary)] shadow-sm transition hover:bg-[var(--accent)]"
                              title="Modifier"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="cursor-pointer rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--danger)] shadow-sm transition hover:bg-[#fff0ef]"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold text-[var(--primary-deep)]">{product.nom}</h3>
                            <span className="shrink-0 text-base font-bold text-[var(--primary)]">{formatMad(product.prix)}</span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-sm text-[var(--muted)]">{product.description}</p>
                          <div className="mt-4 flex items-center justify-between gap-2">
                            <span className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              product.stock <= 5
                                ? "bg-[#fff0ef] text-[var(--danger)]"
                                : product.stock <= 15
                                  ? "bg-[#fff8e5] text-[#b8860b]"
                                  : "bg-[#edf5f5] text-[var(--primary)]",
                            )}>
                                {product.stock <= 5 ? "Stock critique" : product.stock <= 15 ? "Stock moyen" : "En stock"}: {product.stock}
                            </span>
                            {product.date_expiration && new Date(product.date_expiration) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                              <span className={cn(
                                "rounded-full px-3 py-1 text-xs font-semibold",
                                new Date(product.date_expiration) < new Date() ? "bg-[#fff0ef] text-[var(--danger)]" : "bg-[#fff8e5] text-[#b8860b]",
                              )}>
                                {new Date(product.date_expiration) < new Date() ? "Périmé" : `Exp. ${new Date(product.date_expiration).toLocaleDateString("fr-FR")}`}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="cursor-pointer rounded-xl bg-[var(--primary)] p-2 text-white transition hover:bg-[var(--primary-deep)]"
                              title="Ajouter au panier"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="col-span-full rounded-3xl border border-dashed border-[var(--border)] bg-white/55 p-12 text-center text-sm text-[var(--muted)]">
                        Aucun produit trouvé. Essayez un autre mot-clé ou ajoutez un nouveau produit.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {produitsTab === "nouveau" && (
                <div className="glass-card rounded-[30px] p-6">
                  <div
                    className="-mx-6 -mt-6 mb-6 flex items-center justify-between rounded-t-[30px] px-6 py-4 text-white"
                    style={{ backgroundColor: "#246f72" }}
                  >
                    <h2 className="text-lg font-bold">
                      {editingProductId ? "Modifier le produit" : "Nouveau produit"}
                    </h2>
                    {editingProductId ? (
                      <button
                        type="button"
                        onClick={() => { setProductForm(emptyProduct); setEditingProductId(null); }}
                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/30"
                      >
                        <X className="h-3.5 w-3.5" />
                        Annuler
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {editingProductId ? "Modifiez les champs ci-dessous et enregistrez." : "Ajoutez un produit au catalogue en remplissant les champs."}
                  </p>
                  <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input label="Nom" value={productForm.nom} onChange={(value) => setProductForm((current) => ({ ...current, nom: value }))} />
                      <Input label="Prix (€)" type="number" value={String(productForm.prix)} onChange={(value) => setProductForm((current) => ({ ...current, prix: Number(value) }))} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-[var(--primary-deep)]">
                        Code-barres
                        <input
                          type="text"
                          value={productForm.code_barre ?? ""}
                          onChange={(e) => setProductForm((current) => ({ ...current, code_barre: e.target.value || null }))}
                          placeholder="Ex: 3598765432105"
                          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                        />
                      </label>
                      <label className="block text-sm font-medium text-[var(--primary-deep)]">
                        Date d&apos;expiration
                        <input
                          type="date"
                          value={productForm.date_expiration ?? ""}
                          onChange={(e) => setProductForm((current) => ({ ...current, date_expiration: e.target.value || null }))}
                          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                        />
                      </label>
                    </div>
                    <label className="block text-sm font-medium text-[var(--primary-deep)]">
                      Description
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm((current) => ({ ...current, description: e.target.value }))}
                        rows={3}
                        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
                      />
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-[var(--primary-deep)]">
                        Stock
                        <input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm((current) => ({ ...current, stock: Number(e.target.value) }))}
                          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                        />
                      </label>
                      <label className="block text-sm font-medium text-[var(--primary-deep)]">
                        Catégorie
                        <select
                          value={productForm.categorie}
                          onChange={(e) =>
                            setProductForm((current) => ({
                              ...current,
                              categorie: e.target.value as Product["categorie"],
                            }))
                          }
                          className="mt-2 w-full cursor-pointer rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                        >
                          {data.categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="block text-sm font-medium text-[var(--primary-deep)]">
                      Image du produit
                      <div className="mt-2 flex items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 transition hover:bg-[#f5f5f5]">
                          <Upload className="h-4 w-4 text-[var(--muted)]" />
                          <span className="text-sm text-[var(--muted)]">
                            {productForm.image_url.startsWith("data:") ? "Image chargée" : "Choisir un fichier"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <Image
                          src={productForm.image_url || "/assets/logo/green_logo.jpeg"}
                          alt={productForm.nom || "Logo"}  
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-xl border border-[var(--border)] bg-white object-contain p-1"
                        />
                      </div>
                    </label>
                    {saveFeedback && (
                      <div className={cn(
                        "rounded-2xl px-4 py-3 text-center text-sm font-semibold",
                        saveFeedback.startsWith("✓") ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#ffebee] text-[#c62828]",
                      )}>
                        {saveFeedback}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveProduct}
                      disabled={savingProduct}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingProduct ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {savingProduct ? "Enregistrement..." : editingProductId ? "Mettre à jour" : "Ajouter au catalogue"}
                    </button>
                  </div>
                </div>
              )}


            </section>
          )}

          {view === "categories" && (
            <section className="space-y-4">
              {!selectedCategory ? (
                <>
                  <div className="overflow-hidden rounded-[30px] text-white" style={{ background: "linear-gradient(135deg, #1a5c5f 0%, #2d878b 50%, #3a9fa3 100%)" }}>
                    <div className="relative px-6 py-5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(254,238,177,0.18),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.08),transparent_25%)]" />
                      <div className="relative flex flex-wrap items-center gap-3 sm:flex-nowrap sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Layers className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/75">Catalogue</p>
                            <h2 className="mt-1 text-2xl font-bold">Catégories</h2>
                            <p className="mt-1 text-sm text-white/70">
                              {data.categories.length} catégorie{data.categories.length !== 1 ? "s" : ""} · {data.produits.length} produits
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter" && newCategoryName.trim()) {
                                const next = await saveCategory(newCategoryName, data);
                                setData(next);
                                setNewCategoryName("");
                              }
                            }}
                            placeholder="Nouvelle catégorie..."
                            className="w-36 rounded-2xl bg-white/15 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/50 backdrop-blur-sm transition focus:w-44 focus:bg-white/25 sm:w-40 sm:focus:w-52"
                          />
                          <button
                            type="button"
                            disabled={!newCategoryName.trim()}
                            onClick={async () => {
                              if (!newCategoryName.trim()) return;
                              const next = await saveCategory(newCategoryName, data);
                              setData(next);
                              setNewCategoryName("");
                            }}
                            className="flex cursor-pointer items-center gap-1.5 rounded-2xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40 backdrop-blur-sm"
                          >
                            <Plus className="h-4 w-4" />
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryStats.map((cat, idx) => {
                      const accent = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                      return (
                        <div
                          key={cat.categorie}
                          className="group relative cursor-pointer overflow-hidden rounded-[28px] border-2 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl border-transparent shadow-sm"
                          onClick={() => setSelectedCategory(cat.categorie)}
                        >
                          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 transition-all group-hover:scale-150" style={{ backgroundColor: accent }} />
                          <div className="relative">
                            <div className="flex items-start justify-between">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: accent }}>
                                <Layers className="h-6 w-6" />
                              </div>
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const next = await deleteCategory(cat.categorie, data);
                                  setData(next);
                                }}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--danger)] opacity-0 transition hover:bg-[#fff0ef] group-hover:opacity-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-[var(--primary-deep)]">{cat.categorie}</h3>
                            <div className="mt-3 flex items-center gap-3">
                              <span className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold" style={{ backgroundColor: accent + "18", color: accent }}>
                                {cat.count} produit{cat.count !== 1 ? "s" : ""}
                              </span>
                              <span className="text-xs text-[var(--muted)]">{cat.totalStock} unités</span>
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--muted)]">Stock</span>
                                <span className="font-semibold text-[var(--primary)]">{formatMad(cat.totalValue)}</span>
                              </div>
                              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#edf5f5]">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${data && data.produits.length ? (cat.count / data.produits.length) * 100 : 0}%`, backgroundColor: accent }}
                                />
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                              <span>Prix moyen</span>
                              <span className="font-semibold text-[var(--primary-deep)]">{formatMad(Math.round(cat.totalValue / cat.count))}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="overflow-hidden rounded-[30px] text-white" style={{ background: "linear-gradient(135deg, #1a5c5f 0%, #2d878b 50%, #3a9fa3 100%)" }}>
                    <div className="relative px-6 py-5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(254,238,177,0.18),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.08),transparent_25%)]" />
                      <div className="relative flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(null)}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                          <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/75">Catégorie</p>
                          <h2 className="mt-1 text-2xl font-bold">{selectedCategory}</h2>
                          <p className="mt-1 text-sm text-white/70">
                            {data.produits.filter((p) => p.categorie === selectedCategory).length} produit
                            {data.produits.filter((p) => p.categorie === selectedCategory).length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.produits
                      .filter((p) => p.categorie === selectedCategory)
                      .map((product) => (
                        <div key={product.id} className="group/card flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/75 p-3 transition-all hover:border-[var(--primary)]/20 hover:shadow-md">
                          <div className="relative shrink-0">
                            <img loading="lazy" decoding="async" src={product.image_url} alt={product.nom} width={48} height={48} onError={(e) => { (e.target as HTMLImageElement).src = "/assets/logo/green_logo.jpeg" }} className="h-12 w-12 rounded-xl bg-white object-contain p-1 transition-all group-hover/card:scale-105" />
                            {product.stock <= 5 && (
                              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[var(--danger)]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[var(--primary-deep)]">{product.nom}</p>
                            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                              <span>{formatMad(product.prix)}</span>
                              <span>·</span>
                              <span className={product.stock <= 5 ? "text-[var(--danger)] font-semibold" : ""}>{product.stock} en stock</span>
                            </div>
                            {product.date_expiration && new Date(product.date_expiration) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                              <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold", new Date(product.date_expiration) < new Date() ? "bg-[#fff0ef] text-[var(--danger)]" : "bg-[#fff8e5] text-[#b8860b]")}>
                                {new Date(product.date_expiration) < new Date() ? "Périmé" : `Exp. ${new Date(product.date_expiration).toLocaleDateString("fr-FR")}`}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              const updated = { ...product, categorie: "NON CLASSÉ" };
                              const next = await saveProduct(updated, data);
                              setData(next);
                            }}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--danger)] opacity-0 transition hover:bg-[#fff0ef] group-hover/card:opacity-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    {data.produits.filter((p) => p.categorie === selectedCategory).length === 0 && (
                      <p className="col-span-full py-8 text-center text-sm text-[var(--muted)]">
                        Aucun produit dans cette catégorie. Modifiez un produit pour lui attribuer cette catégorie.
                      </p>
                    )}
                  </div>

                  <div className="rounded-[30px] bg-white p-6 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setCategoryAddOpen(!categoryAddOpen)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-5 py-3.5 text-white transition hover:opacity-90"
                      style={{ backgroundColor: "#246f72" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-semibold">Ajouter des produits à cette catégorie</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", categoryAddOpen && "rotate-180")} />
                    </button>
                    {categoryAddOpen && (
                      <div className="mt-3">
                        <input
                          value={categoryAddQuery}
                          onChange={(e) => setCategoryAddQuery(e.target.value)}
                          placeholder="Rechercher un produit..."
                          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                        />
                        <div className="mt-3 grid max-h-48 gap-1.5 overflow-y-auto rounded-2xl border border-[var(--border)] bg-white/60 p-2">
                          {data.produits
                            .filter((p) => p.categorie !== selectedCategory && (!categoryAddQuery || p.nom.toLowerCase().includes(categoryAddQuery.toLowerCase())))
                            .slice(0, 20)
                            .map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={async () => {
                                  const updated = { ...product, categorie: selectedCategory };
                                  const next = await saveProduct(updated, data);
                                  setData(next);
                                }}
                                className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--primary-deep)] transition hover:bg-[var(--accent)]"
                              >
                                <Plus className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                                <span className="truncate">{product.nom}</span>
                              </button>
                            ))}
                          {data.produits.filter((p) => p.categorie !== selectedCategory && (!categoryAddQuery || p.nom.toLowerCase().includes(categoryAddQuery.toLowerCase()))).length === 0 && (
                            <p className="py-4 text-center text-xs text-[var(--muted)]">Aucun produit trouvé</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {view === "clients" && (
            <section className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setClientsTab("liste")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition-all md:gap-2 md:px-5 md:py-2.5 md:text-sm",
                    clientsTab === "liste"
                      ? "bg-[var(--primary)] text-white shadow-md"
                      : "border border-[var(--border)] bg-white text-[var(--primary-deep)] hover:border-[var(--primary)]/30 hover:bg-[#f5fafa]"
                  )}
                >
                  <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Tous les clients
                </button>
                <button
                  onClick={() => { setClientsTab("nouveau"); setClientForm(emptyClient); setEditingClientId("new"); setSelectedClientId(""); }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition-all md:gap-2 md:px-5 md:py-2.5 md:text-sm",
                    clientsTab === "nouveau"
                      ? "bg-[var(--primary)] text-white shadow-md"
                      : "border border-[var(--border)] bg-white text-[var(--primary-deep)] hover:border-[var(--primary)]/30 hover:bg-[#f5fafa]"
                  )}
                >
                  <UserPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {editingClientId === "new" ? "Nouveau client" : "Modifier client"}
                </button>
              </div>

              {clientsTab === "liste" && (
                <>
                  <div className="glass-card rounded-[30px] p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 md:h-16 md:w-16">
                          <Users className="h-6 w-6 md:h-7 md:w-7" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold tracking-tight text-[var(--primary-deep)] md:text-2xl">Clients</h2>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setClientForm(emptyClient); setEditingClientId("new"); setSelectedClientId(""); setClientsTab("nouveau"); }}
                        className="cursor-pointer rounded-2xl bg-[var(--primary)] p-3 text-white transition hover:bg-[var(--primary-deep)]"
                      >
                        <UserPlus className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    </div>
                    <label className="mt-5 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                      <Search className="h-4 w-4 text-[var(--muted)]" />
                      <input
                        value={clientSearch}
                        onChange={(e) => { setClientSearch(e.target.value); setSelectedClientId(""); }}
                        placeholder="Rechercher par nom ou téléphone"
                        className="w-full border-0 bg-transparent outline-none"
                      />
                    </label>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className={cn(
                            "group relative cursor-pointer rounded-2xl border-2 px-4 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
                            selectedClientId === client.id
                              ? "border-[var(--primary)] bg-[#eef6f5] shadow-sm"
                              : "border-transparent bg-white/75 shadow-sm hover:border-[var(--primary)]/20",
                          )}
                          onClick={() => { setSelectedClientId(prev => prev === client.id ? "" : client.id); setEditingClientId(null); }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-[var(--primary-deep)]">{client.nom}</p>
                              <p className="truncate text-xs text-[var(--muted)]">{client.telephone}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary-deep)]">
                              {formatMad(client.total_achats)}
                            </span>
                          </div>
                          <div className="mt-3 flex justify-end gap-1.5 opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleEditClient(client); setClientsTab("nouveau"); }}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--primary)] transition hover:bg-[var(--accent)]"
                              title="Modifier"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}
                              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--danger)] transition hover:bg-[#fff0ef]"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedClient && (
                    <div className="glass-card rounded-[30px] p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ background: "linear-gradient(135deg, #246f72 0%, #1a4d4f 100%)" }}>
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-[var(--primary-deep)]">{selectedClient.nom}</h2>
                            <p className="text-sm text-[var(--muted)]">{selectedClient.telephone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--muted)]">Total achats</p>
                          <p className="text-lg font-bold text-[var(--primary)]">{formatMad(selectedClient.total_achats)}</p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {computeClientHistory(selectedClient, data.ventes, data.produits).map((sale) => (
                          <div key={sale.id} className="rounded-3xl border border-[var(--border)] bg-white/75 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-semibold text-[var(--primary-deep)]">{sale.produit?.nom ?? "Produit"}</p>
                                <p className="text-sm text-[var(--muted)]">{formatDate(sale.date)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-[var(--primary)]">{formatMad(sale.total)}</p>
                                <p className="text-sm text-[var(--muted)]">Qté: {sale.quantite}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {clientsTab === "nouveau" && (
                <div className="glass-card rounded-[30px] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 md:h-16 md:w-16">
                        <UserPlus className="h-6 w-6 md:h-7 md:w-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[var(--primary-deep)] md:text-2xl">
                          {editingClientId === "new" ? "Nouveau client" : "Modifier le client"}
                        </h2>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {editingClientId === "new" ? "Ajoutez un nouveau client à votre base." : "Modifiez les informations du client."}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setClientForm(emptyClient); setEditingClientId(null); setClientsTab("liste"); }}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-white transition hover:bg-[#f5f5f5]"
                    >
                      <X className="h-4 w-4 text-[var(--muted)]" />
                    </button>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--primary-deep)]">Nom</label>
                      <input
                        value={clientForm.nom}
                        onChange={(e) => setClientForm((current) => ({ ...current, nom: e.target.value }))}
                        placeholder="Entrez le nom du client"
                        className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--primary-deep)]">Téléphone</label>
                      <input
                        value={clientForm.telephone}
                        onChange={(e) => setClientForm((current) => ({ ...current, telephone: e.target.value }))}
                        placeholder="06 XX XX XX XX"
                        className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveClient}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--primary-deep)]"
                    >
                      <Plus className="h-4 w-4" />
                      {editingClientId === "new" ? "Ajouter le client" : "Mettre à jour le client"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {view === "pos" && (
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="glass-card rounded-[30px] p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="section-title text-xl font-semibold">POS / Encaissement</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Cliquez sur un produit pour l&apos;ajouter au panier.
                      </p>
                    </div>
                  </div>
                  <label className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 transition focus-within:border-[var(--primary)]">
                    <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                    <input
                      value={barcodeQuery}
                      onChange={(e) => setBarcodeQuery(e.target.value)}
                      placeholder="Rechercher par nom ou code-barres"
                      className="w-full border-0 bg-transparent outline-none"
                    />
                    {barcodeQuery && (
                      <button
                        type="button"
                        onClick={() => setBarcodeQuery("")}
                        className="cursor-pointer text-[var(--muted)] hover:text-[var(--primary-deep)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </label>
                </div>
                <div className="mt-5 grid max-h-[520px] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2">
                  {posProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="cursor-pointer rounded-[26px] border border-[var(--border)] bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          loading="lazy" decoding="async"
                          src={product.image_url}
                          alt={product.nom}
                          width={72}
                          height={72}
                          onError={(e) => { (e.target as HTMLImageElement).src = "/assets/logo/green_logo.jpeg" }}
                          className="h-18 w-18 shrink-0 rounded-2xl border border-[var(--border)] bg-[#f9fcfb] p-2 object-contain"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[var(--primary-deep)]">{product.nom}</p>
                          <p className="text-sm text-[var(--muted)]">{product.categorie}</p>
                          {product.code_barre && (
                            <p className="mt-0.5 font-mono text-[10px] text-[var(--muted)]">#{product.code_barre}</p>
                          )}
                          <p className="mt-2 text-sm font-medium text-[var(--primary)]">
                            {formatMad(product.prix)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-[30px] p-6">
                <h2 className="section-title text-xl font-semibold">Panier</h2>
                <label className="mt-4 block text-sm font-medium text-[var(--primary-deep)]">
                  Client associé (optionnel)
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none sm:mt-2 sm:py-3"
                  >
                    <option value="">Aucun client</option>
                    {data.clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nom} - {client.telephone}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-5 space-y-3">
                  {cart.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">Ajoutez un produit pour commencer une vente.</p>
                  ) : null}
                  {cart.map((item) => (
                    <div key={item.produit.id} className="rounded-3xl border border-[var(--border)] bg-white/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[var(--primary-deep)]">{item.produit.nom}</p>
                          <p className="text-sm text-[var(--muted)]">
                            {formatMad(item.produit.prix)} l&apos;unité
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-xl border border-[var(--border)]">
                            <button
                              type="button"
                              onClick={() =>
                                setCart((current) =>
                                  current
                                    .map((row) =>
                                      row.produit.id === item.produit.id
                                        ? { ...row, quantite: Math.max(1, row.quantite - 1) }
                                        : row,
                                    )
                                    .filter((row) => row.quantite > 0),
                                )
                              }
                              className="cursor-pointer px-2.5 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--primary-deep)]"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-[var(--primary-deep)]">
                              {item.quantite}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setCart((current) =>
                                  current.map((row) =>
                                    row.produit.id === item.produit.id
                                      ? {
                                          ...row,
                                          quantite: Math.min(item.produit.stock, row.quantite + 1),
                                        }
                                      : row,
                                  ),
                                )
                              }
                              disabled={item.quantite >= item.produit.stock}
                              className="cursor-pointer px-2.5 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCart((current) =>
                                current.filter((row) => row.produit.id !== item.produit.id),
                              )
                            }
                            className="cursor-pointer rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--danger)] transition hover:bg-[#fff0ef]"
                            title="Retirer du panier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-3xl bg-[var(--accent)] p-5 text-[var(--primary-deep)]">
                  <p className="text-sm uppercase tracking-[0.2em]">Total ticket</p>
                  <p className="mt-2 text-3xl font-semibold">{formatMad(saleTotal)}</p>
                </div>
                <button
                  type="button"
                  disabled={!cart.length}
                  onClick={validateSale}
                  className="mt-5 w-full cursor-pointer rounded-2xl bg-[var(--primary)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Valider la vente
                </button>
              </div>
            </section>
          )}

          {view === "ventes" && (
            <section className="glass-card rounded-[30px] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="section-title text-xl font-semibold">Historique des ventes</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {filteredVentes.length} vente{filteredVentes.length !== 1 ? "s" : ""} enregistrée{filteredVentes.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="group relative">
                    <select
                      value={venteClientFilter}
                      onChange={(e) => setVenteClientFilter(e.target.value)}
                      className="appearance-none cursor-pointer rounded-2xl border border-[var(--border)] bg-white/80 py-2 pl-3 pr-8 text-xs font-medium text-[var(--primary-deep)] outline-none transition-all focus:border-[var(--primary)] focus:bg-white sm:text-sm"
                    >
                      <option value="Tous">Tous les clients</option>
                      {data.clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.nom}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--muted)] sm:h-3.5 sm:w-3.5" />
                  </div>
                  <input
                    type="date"
                    value={venteDateFilter}
                    onChange={(e) => setVenteDateFilter(e.target.value)}
                    className="rounded-2xl border border-[var(--border)] bg-white/80 py-2 px-3 text-xs text-[var(--primary-deep)] outline-none transition-all focus:border-[var(--primary)] focus:bg-white sm:text-sm"
                  />
                  {venteDateFilter && (
                    <button
                      type="button"
                      onClick={() => setVenteDateFilter("")}
                      className="cursor-pointer rounded-2xl border border-[var(--border)] bg-white/80 px-2.5 py-2 text-xs text-[var(--muted)] transition hover:bg-[#f5f5f5] sm:text-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDownloadVentesPDF}
                    className="flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--primary-deep)] sm:px-4 sm:text-sm"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    PDF
                  </button>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[var(--accent)] px-4 py-2 sm:inline-block">
                <span className="text-xs text-[var(--muted)]">Total filtré: </span>
                <span className="text-base font-bold text-[var(--primary-deep)]">{formatMad(filteredVentes.reduce((s, v) => s + v.total, 0))}</span>
              </div>
              <div className="mt-4 overflow-x-auto rounded-[26px] border border-[var(--border)]">
                <table className="min-w-full bg-white/80 text-left">
                  <thead className="bg-[#f4f8f7] text-sm text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Produit</th>
                      <th className="px-4 py-3 font-medium">Quantité</th>
                      <th className="px-4 py-3 font-medium">Client</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVentes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-[var(--muted)]">
                          Aucune vente trouvée pour les filtres sélectionnés.
                        </td>
                      </tr>
                    ) : (
                      filteredVentes.map((sale) => {
                        const product = data.produits.find((item) => item.id === sale.produit_id);
                        const client = data.clients.find((item) => item.id === sale.client_id);
                        return (
                          <tr key={sale.id} className="border-t border-[var(--border)] transition hover:bg-[#f8fbfa]">
                            <td className="px-4 py-4 font-medium text-[var(--primary-deep)]">{product?.nom ?? "Produit"}</td>
                            <td className="px-4 py-4">{sale.quantite}</td>
                            <td className="px-4 py-4">{client ? `${client.nom} (${client.telephone})` : "Sans client"}</td>
                            <td className="px-4 py-4 text-sm text-[var(--muted)]">{formatDate(sale.date)}</td>
                            <td className="px-4 py-4 font-semibold text-[var(--primary)]">{formatMad(sale.total)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {view === "settings" && (
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="glass-card rounded-[30px] p-6">
                  <h2 className="section-title text-xl font-semibold">Informations système</h2>
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-[var(--primary)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--primary-deep)]">Mode de données</p>
                          <p className="text-xs text-[var(--muted)]">Source de stockage active</p>
                        </div>
                      </div>
                      <span className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        dataMode === "cloud" ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#fff8e1] text-[#f57f17]",
                      )}>
                        {dataMode === "cloud" ? "Cloud Supabase" : "Local (navigateur)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-[var(--primary)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--primary-deep)]">Produits</p>
                          <p className="text-xs text-[var(--muted)]">Références actives</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[var(--primary-deep)]">{data.produits.length}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-[var(--primary)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--primary-deep)]">Clients</p>
                          <p className="text-xs text-[var(--muted)]">Fichier client actif</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[var(--primary-deep)]">{data.clients.length}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <WalletCards className="h-5 w-5 text-[var(--primary)]" />
                        <div>
                          <p className="text-sm font-medium text-[var(--primary-deep)]">Ventes</p>
                          <p className="text-xs text-[var(--muted)]">Transactions enregistrées</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[var(--primary-deep)]">{data.ventes.length}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-[30px] p-6">
                  <h2 className="section-title text-xl font-semibold">Actions</h2>
                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={dataMode === "cloud"}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-3 text-left transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw className="h-5 w-5 text-[var(--primary)]" />
                      <div>
                        <p className="text-sm font-medium text-[var(--primary-deep)]">Réinitialiser les données</p>
                        <p className="text-xs text-[var(--muted)]">Remet le jeu de données de démonstration par défaut</p>
                      </div>
                    </button>
                    {dataMode === "cloud" && (
                      <>
                        <button
                          type="button"
                          onClick={handleSeedSupabase}
                          disabled={seeding}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[var(--primary)]/20 bg-white/75 px-4 py-3 text-left transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Upload className={cn("h-5 w-5 text-[var(--primary)]", seeding && "animate-spin")} />
                          <div>
                            <p className="text-sm font-medium text-[var(--primary-deep)]">
                              {seeding ? "Importation..." : "Importer les données seed"}
                            </p>
                            <p className="text-xs text-[var(--muted)]">10 catégories, 50 produits, 20 clients, 3 ventes</p>
                          </div>
                        </button>
                        {seedStatus && (
                          <div className={cn(
                            "rounded-2xl px-4 py-3 text-sm",
                            seedStatus.ok ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#ffebee] text-[#c62828]",
                          )}>
                            {seedStatus.msg}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-card rounded-[30px] p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]">
                      <Info className="h-6 w-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h2 className="section-title text-xl font-semibold">À propos</h2>
                    </div>
                  </div>
                  <div className="mt-5 space-y-4 text-sm text-[var(--muted)]">
                    <p>
                      <strong className="text-[var(--primary-deep)]">Dani&apos;s Parapharmacy</strong> est un logiciel
                      de démonstration professionnel pour la gestion de parapharmacie.
                    </p>
                    <p>
                      Application construite avec <strong className="text-[var(--primary-deep)]">Next.js</strong>,{" "}
                      <strong className="text-[var(--primary-deep)]">Tailwind CSS</strong> et{" "}
                      <strong className="text-[var(--primary-deep)]">Supabase</strong>.
                    </p>
                    <div className="rounded-2xl border border-[var(--border)] bg-white/55 p-4">
                      <p className="font-medium text-[var(--primary-deep)]">Version</p>
                      <p className="mt-1">1.0.0 — Démo commerciale</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-white/55 p-4">
                      <p className="font-medium text-[var(--primary-deep)]">Design</p>
                      <p className="mt-1">Interface pensée pour la clarté et la rapidité en situation de démonstration client.</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-[30px] p-6">
                  <h2 className="section-title text-lg font-semibold">Stockage</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-[#edf5f5] px-4 py-3">
                      <span className="text-sm text-[var(--primary-deep)]">Mode</span>
                      <span className="text-sm font-semibold text-[var(--primary)]">{dataMode === "cloud" ? "Cloud" : "Local"}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-[#edf5f5] px-4 py-3">
                      <span className="text-sm text-[var(--primary-deep)]">Stockage des images</span>
                      <span className="text-sm font-semibold text-[var(--primary)]">Base64 / Dossier public</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-[#edf5f5] px-4 py-3">
                      <span className="text-sm text-[var(--primary-deep)]">Authentification</span>
                      <span className="text-sm font-semibold text-[var(--primary)]">Session (démo)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {showInvoice && (
        <InvoiceReceipt
          cart={cart}
          client={selectedClient}
          onClose={closeInvoice}
        />
      )}
    </div>
  );
}

function FeatureChip({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white sm:px-4 sm:py-3 sm:text-sm">
      {label}
    </div>
  );
}

function QuickAction({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[26px] border border-[var(--border)] bg-white/70 px-5 py-4 text-left transition hover:bg-white"
    >
      <p className="font-semibold text-[var(--primary-deep)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
    </button>
  );
}



const CATEGORY_COLORS = [
  "#246f72",
  "#d9675d",
  "#b8860b",
  "#2d8b57",
  "#5b6abf",
  "#c77dba",
  "#e8914a",
  "#4aa3a8",
  "#8b6f4a",
  "#a05d8a",
];

const statIcons: Record<string, LucideIcon> = {
  "Produits": Package,
  "Stock total": Layers,
  "Ventes du jour": WalletCards,
  "Alertes stock": ChartColumnBig,
};

const statAccents: Record<string, string> = {
  "Produits": "#246f72",
  "Stock total": "#2d878b",
  "Ventes du jour": "#1a5c5f",
  "Alertes stock": "#c0392b",
};

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  const Icon = statIcons[title] ?? Package;
  const accent = statAccents[title] ?? "#246f72";
  return (
    <div className="group cursor-pointer rounded-2xl bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5 sm:rounded-[28px]" style={{ borderLeft: "3px solid " + accent }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] sm:text-xs">{title}</p>
          <p className="mt-1 text-xl font-semibold sm:mt-3 sm:text-3xl" style={{ color: accent }}>{value}</p>
          <p className="mt-0.5 text-[11px] text-[var(--muted)] sm:mt-2 sm:text-sm">{subtitle}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl opacity-60 transition-all group-hover:scale-110 group-hover:opacity-100 sm:h-12 sm:w-12 sm:rounded-2xl" style={{ backgroundColor: accent + "18" }}>
          <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-[13px] font-medium text-[var(--primary-deep)] sm:text-sm">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none sm:mt-2 sm:py-3"
      />
    </label>
  );
}
