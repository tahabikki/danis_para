"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChartColumnBig,
  Database,
  Info,
  Layers,
  LogOut,
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
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productForm, setProductForm] = useState<Product>(emptyProduct);
  const [clientForm, setClientForm] = useState<Client>(emptyClient);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

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
    return data.produits.filter(
      (product) =>
        product.nom.toLowerCase().includes(value) ||
        product.categorie.toLowerCase().includes(value),
    );
  }, [data, query]);

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

  async function handleReset() {
    const next = await resetLocalData();
    setData(next);
    setCart([]);
    setSelectedClientId("");
  }

  async function handleSaveProduct() {
    if (!data || !productForm.nom.trim() || !productForm.prix) return;
    const product = { ...productForm, id: productForm.id || crypto.randomUUID() };
    const next = await saveProduct(product, data);
    setData(next);
    setProductForm(emptyProduct);
    setEditingProductId(null);
  }

  function handleEditProduct(product: Product) {
    setProductForm(product);
    setEditingProductId(product.id);
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(254,238,177,0.85),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(36,111,114,0.25),transparent_32%),linear-gradient(135deg,#f8faf8_0%,#edf5f3_100%)]" />
        <div className="glass-card relative grid w-full max-w-6xl overflow-hidden rounded-[40px] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative p-8 text-white md:p-12" style={{ background: "linear-gradient(160deg, #0f3d40 0%, #246f72 56%, #2d878b 100%)" }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(254,238,177,0.22),transparent_26%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.12),transparent_20%)]" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <Image src="/assets/logo/green_logo.jpeg" alt="Logo" width={70} height={70} className="h-18 w-18 rounded-3xl object-cover shadow-2xl" />
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">Back Office</p>
                  <Image src="/assets/logo/logo_text.png" alt="Dani's Parapharmacy" width={220} height={48} className="mt-2 h-11 w-auto object-contain brightness-0 invert" />
                </div>
              </div>
              <h1 className="mt-10 max-w-xl text-4xl font-semibold leading-tight">
                Espace administrateur de la démo parapharmacie
              </h1>
              <p className="mt-4 max-w-xl text-base text-white/78">
                Connectez-vous pour gérer le stock, enregistrer des ventes, suivre les clients et présenter un vrai logiciel à votre client.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <FeatureChip label="POS complet" />
                <FeatureChip label="Stock en direct" />
                <FeatureChip label="Clients & ventes" />
              </div>
            </div>
          </section>

          <section className="p-8 md:p-12">
            <div className="mx-auto max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--primary-deep)]">
                <ShieldCheck className="h-4 w-4" />
                Connexion administrateur
              </div>
              <h2 className="section-title mt-6 text-3xl font-semibold">Accéder au tableau de gestion</h2>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Démo simple: pas de sécurité avancée, juste une vraie entrée admin convaincante.
              </p>

              <div className="mt-8 space-y-4">
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
                  className="w-full cursor-pointer rounded-2xl bg-[var(--primary)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--primary-deep)]"
                >
                  Se connecter
                </button>
              </div>

              <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-white/80 p-5">
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
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid max-w-[1600px] gap-4 lg:grid-cols-[300px_1fr]">
        <aside
          className="rounded-[34px] p-6 text-white shadow-[0_24px_70px_rgba(15,61,64,0.28)]"
          style={{ background: "linear-gradient(180deg, #113c3f 0%, #19585b 44%, #246f72 100%)" }}
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

          <nav className="mt-6 space-y-3">
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

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/65">Mode actif</p>
            <p className="mt-2 text-lg font-semibold">
              {dataMode === "cloud" ? "Cloud Supabase" : "Local hors ligne"}
            </p>
            <p className="mt-2 text-sm text-white/70">
              Même interface, bascule uniquement via l&apos;environnement.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={dataMode === "cloud"}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser les seeds
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-[var(--primary-deep)] transition hover:bg-[#f9fbfa]"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="space-y-4">
          <header className="glass-card rounded-[34px] p-6">
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
            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard title="Produits" value={dashboardStats.totalProducts.toString()} subtitle="Références actives" />
                  <StatCard title="Stock total" value={dashboardStats.totalStock.toString()} subtitle="Unités en rayon" />
                  <StatCard title="Ventes du jour" value={formatMad(dashboardStats.dailySales)} subtitle="Chiffre d'affaires" />
                  <StatCard title="Alertes stock" value={dashboardStats.lowStock.length.toString()} subtitle="Articles à surveiller" />
                </div>

                <div className="glass-card rounded-[30px] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="section-title text-xl font-semibold">Top produits</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Les meilleures rotations visibles en un coup d&apos;oeil.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setView("ventes")}
                      className="cursor-pointer rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)]"
                    >
                      Voir ventes
                    </button>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {dashboardStats.topProducts.map((item) => (
                      <div key={item.produit?.id} className="rounded-[26px] border border-[var(--border)] bg-white/75 p-4">
                        <div className="flex items-center gap-4">
                          <Image
                            src={item.produit?.image_url ?? "/products/creme-hydratante.jpeg"}
                            alt={item.produit?.nom ?? ""}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-2xl border border-[var(--border)] bg-white object-contain p-2"
                          />
                          <div>
                            <p className="font-semibold text-[var(--primary-deep)]">{item.produit?.nom}</p>
                            <p className="text-sm text-[var(--muted)]">{item.produit?.categorie}</p>
                            <p className="mt-1 text-sm font-medium text-[var(--success)]">
                              {item.quantity} unités vendues
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-card rounded-[30px] p-6">
                  <h2 className="section-title text-xl font-semibold">Alerte stock faible</h2>
                  <div className="mt-4 space-y-3">
                    {dashboardStats.lowStock.map((product) => (
                      <div key={product.id} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/72 px-4 py-3">
                        <div>
                          <p className="font-medium text-[var(--primary-deep)]">{product.nom}</p>
                          <p className="text-sm text-[var(--muted)]">{product.categorie}</p>
                        </div>
                        <span className="rounded-full bg-[#fff0ef] px-3 py-1 text-sm font-semibold text-[var(--danger)]">
                          {product.stock} en stock
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-[30px] p-6">
                  <h2 className="section-title text-xl font-semibold">Actions rapides</h2>
                  <div className="mt-4 grid gap-3">
                    <MiniAction title="Ouvrir le POS" description="Encaisser une vente maintenant" onClick={() => setView("pos")} />
                    <MiniAction title="Consulter les clients" description="Recherche par téléphone et historique" onClick={() => setView("clients")} />
                    <MiniAction title="Gérer le catalogue" description="Produits, stock et ajout rapide" onClick={() => setView("produits")} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === "produits" && (
            <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
              <div className="glass-card rounded-[30px] p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="section-title text-xl font-semibold">Tous les produits</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""} — cliquez sur un produit pour l&apos;ajouter au panier
                    </p>
                  </div>
                  <label className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 transition focus-within:border-[var(--primary)]">
                    <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher produit ou catégorie"
                      className="w-48 border-0 bg-transparent outline-none md:w-64"
                    />
                  </label>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <article key={product.id} className="group rounded-[28px] border border-[var(--border)] bg-white/75 transition hover:shadow-lg">
                      <div className="relative overflow-hidden rounded-t-[28px] bg-[linear-gradient(180deg,#f8fbfa_0%,#f0f6f3_100%)]">
                        <Image src={product.image_url} alt={product.nom} width={440} height={280} className="h-48 w-full object-contain p-6 transition duration-300 group-hover:scale-105" />
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

              <div className="space-y-4">
                <div className="glass-card rounded-[30px] p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="section-title text-xl font-semibold">
                      {editingProductId ? "Modifier le produit" : "Nouveau produit"}
                    </h2>
                    {editingProductId ? (
                      <button
                        type="button"
                        onClick={() => { setProductForm(emptyProduct); setEditingProductId(null); }}
                        className="cursor-pointer rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[#f5f5f5]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {editingProductId ? "Modifiez les champs ci-dessous et enregistrez." : "Ajoutez un produit au catalogue en remplissant les champs."}
                  </p>
                  <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Nom" value={productForm.nom} onChange={(value) => setProductForm((current) => ({ ...current, nom: value }))} />
                      <Input label="Prix (MAD)" type="number" value={String(productForm.prix)} onChange={(value) => setProductForm((current) => ({ ...current, prix: Number(value) }))} />
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
                    <div className="grid grid-cols-2 gap-3">
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
                    <button
                      type="button"
                      onClick={handleSaveProduct}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--primary-deep)]"
                    >
                      <Plus className="h-4 w-4" />
                      {editingProductId ? "Mettre à jour" : "Ajouter au catalogue"}
                    </button>
                  </div>
                </div>

                <div className="glass-card rounded-[30px] p-6">
                  <h2 className="section-title text-lg font-semibold">Aperçu rapide</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-[#edf5f5] px-4 py-3">
                      <span className="text-sm text-[var(--primary-deep)]">Total produits</span>
                      <span className="font-semibold text-[var(--primary)]">{data.produits.length}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-[#edf5f5] px-4 py-3">
                      <span className="text-sm text-[var(--primary-deep)]">Stock total</span>
                      <span className="font-semibold text-[var(--primary)]">{data.produits.reduce((s, p) => s + p.stock, 0)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-[#edf5f5] px-4 py-3">
                      <span className="text-sm text-[var(--primary-deep)]">Alertes stock</span>
                      <span className="font-semibold text-[var(--danger)]">{data.produits.filter((p) => p.stock <= 5).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === "categories" && (
            <section className="space-y-4">
              <div className="glass-card rounded-[30px] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="section-title text-xl font-semibold">Gérer les catégories</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {data.categories.length} catégorie{data.categories.length !== 1 ? "s" : ""} — cliquez pour voir les produits
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && newCategoryName.trim()) {
                          const next = await saveCategory(newCategoryName, data);
                          setData(next);
                          setNewCategoryName("");
                        }
                      }}
                      placeholder="Nouvelle catégorie"
                      className="w-44 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
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
                      className="cursor-pointer rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryStats.map((cat) => (
                  <div
                    key={cat.categorie}
                    className={cn(
                      "group cursor-pointer rounded-[30px] p-6 text-left transition",
                      selectedCategory === cat.categorie
                        ? "border-2 border-[var(--primary)] bg-[#eef6f5] shadow-lg"
                        : "glass-card border-2 border-transparent hover:shadow-lg",
                    )}
                    onClick={() => setSelectedCategory(selectedCategory === cat.categorie ? null : cat.categorie)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]">
                          <Layers className="h-6 w-6 text-[var(--primary)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--primary-deep)]">{cat.categorie}</h3>
                          <p className="text-sm text-[var(--muted)]">{cat.count} produit{cat.count !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const next = await deleteCategory(cat.categorie, data);
                          setData(next);
                          if (selectedCategory === cat.categorie) setSelectedCategory(null);
                        }}
                        className="cursor-pointer rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--danger)] opacity-0 transition hover:bg-[#fff0ef] group-hover:opacity-100"
                        title="Supprimer la catégorie"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--muted)]">Stock total</span>
                        <span className="font-semibold text-[var(--primary)]">{cat.totalStock} unités</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--muted)]">Valeur stock</span>
                        <span className="font-semibold text-[var(--primary-deep)]">{formatMad(cat.totalValue)}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="h-2 overflow-hidden rounded-full bg-[#edf5f5]">
                        <div
                          className="h-full rounded-full bg-[var(--primary)] transition-all"
                          style={{ width: `${data && data.produits.length ? (cat.count / data.produits.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedCategory && (
                <div className="glass-card rounded-[30px] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="section-title text-xl font-semibold">{selectedCategory}</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Produits dans cette catégorie — {data.produits.filter((p) => p.categorie === selectedCategory).length} produit
                        {data.produits.filter((p) => p.categorie === selectedCategory).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.produits
                      .filter((p) => p.categorie === selectedCategory)
                      .map((product) => (
                        <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/75 p-3">
                          <Image src={product.image_url} alt={product.nom} width={48} height={48} className="h-12 w-12 rounded-xl bg-white object-contain p-1" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[var(--primary-deep)]">{product.nom}</p>
                            <p className="text-xs text-[var(--muted)]">{formatMad(product.prix)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              const updated = { ...product, categorie: "NON CLASSÉ" };
                              const next = await saveProduct(updated, data);
                              setData(next);
                            }}
                            className="cursor-pointer rounded-xl border border-[var(--border)] bg-white p-1.5 text-[var(--danger)] transition hover:bg-[#fff0ef]"
                            title="Retirer de la catégorie"
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
                  <div className="mt-5 border-t border-[var(--border)] pt-5">
                    <p className="mb-3 text-sm font-medium text-[var(--primary-deep)]">Ajouter des produits à cette catégorie</p>
                    <div className="flex flex-wrap gap-2">
                      {data.produits
                        .filter((p) => p.categorie !== selectedCategory)
                        .map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={async () => {
                              const updated = { ...product, categorie: selectedCategory };
                              const next = await saveProduct(updated, data);
                              setData(next);
                            }}
                            className="cursor-pointer rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--primary-deep)] transition hover:bg-[var(--accent)]"
                          >
                            + {product.nom}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-card rounded-[30px] p-6">
                <h2 className="section-title text-xl font-semibold">Répartition du catalogue</h2>
                <div className="mt-5 space-y-4">
                  {categoryStats.map((cat) => (
                    <div key={cat.categorie} className="flex items-center gap-4">
                      <span className="w-48 shrink-0 text-sm font-medium text-[var(--primary-deep)]">{cat.categorie}</span>
                      <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-[#edf5f5]">
                        <div
                          className="h-full rounded-full bg-[var(--primary)] transition-all"
                          style={{ width: `${data && data.produits.length ? (cat.count / data.produits.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-24 text-right text-sm font-semibold text-[var(--primary)]">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {view === "clients" && (
            <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="glass-card rounded-[30px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="section-title text-xl font-semibold">Clients</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Recherche par téléphone et total d&apos;achats.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setClientForm(emptyClient); setEditingClientId("new"); setSelectedClientId(""); }}
                    className="cursor-pointer rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-deep)]"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
                <label className="mt-5 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                  <Search className="h-4 w-4 text-[var(--muted)]" />
                  <input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Rechercher par nom ou téléphone"
                    className="w-full border-0 bg-transparent outline-none"
                  />
                </label>
                <div className="mt-5 space-y-3">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={cn(
                        "flex items-center justify-between rounded-3xl border px-4 py-4 transition",
                        selectedClientId === client.id
                          ? "border-[var(--primary)] bg-[#eef6f5]"
                          : "border-[var(--border)] bg-white/75",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => { setSelectedClientId(client.id); setEditingClientId(null); }}
                        className="flex flex-1 cursor-pointer items-center justify-between gap-4 text-left"
                      >
                        <div>
                          <p className="font-semibold text-[var(--primary-deep)]">{client.nom}</p>
                          <p className="text-sm text-[var(--muted)]">{client.telephone}</p>
                        </div>
                        <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-sm font-semibold text-[var(--primary-deep)]">
                          {formatMad(client.total_achats)}
                        </span>
                      </button>
                      <div className="ml-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClient(client)}
                          className="cursor-pointer rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--primary)] transition hover:bg-[var(--accent)]"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(client.id)}
                          className="cursor-pointer rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--danger)] transition hover:bg-[#fff0ef]"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-[30px] p-6">
                {editingClientId ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="section-title text-xl font-semibold">
                        {editingClientId === "new" ? "Ajouter un client" : "Modifier le client"}
                      </h2>
                      <button
                        type="button"
                        onClick={() => { setClientForm(emptyClient); setEditingClientId(null); }}
                        className="cursor-pointer rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[#f5f5f5]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-5 space-y-3">
                      <Input label="Nom" value={clientForm.nom} onChange={(value) => setClientForm((current) => ({ ...current, nom: value }))} />
                      <Input label="Téléphone" value={clientForm.telephone} onChange={(value) => setClientForm((current) => ({ ...current, telephone: value }))} />
                      <button
                        type="button"
                        onClick={handleSaveClient}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--primary-deep)]"
                      >
                        <Plus className="h-4 w-4" />
                        {editingClientId === "new" ? "Ajouter le client" : "Mettre à jour le client"}
                      </button>
                    </div>
                  </>
                ) : selectedClient ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h2 className="section-title text-xl font-semibold">Historique client</h2>
                    </div>
                    <div className="mt-4">
                      <div
                        className="rounded-3xl p-5 text-white"
                        style={{ background: "linear-gradient(135deg, #246f72 0%, #1a4d4f 100%)" }}
                      >
                        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Client sélectionné</p>
                        <h3 className="mt-2 text-2xl font-semibold">{selectedClient.nom}</h3>
                        <p className="mt-1 text-white/70">{selectedClient.telephone}</p>
                        <p className="mt-4 text-sm">
                          Total achats:{" "}
                          <span className="font-semibold text-[var(--accent)]">
                            {formatMad(selectedClient.total_achats)}
                          </span>
                        </p>
                      </div>
                      <div className="mt-5 space-y-3">
                        {computeClientHistory(selectedClient, data.ventes, data.produits).map((sale) => (
                          <div key={sale.id} className="rounded-3xl border border-[var(--border)] bg-white/75 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-semibold text-[var(--primary-deep)]">
                                  {sale.produit?.nom ?? "Produit"}
                                </p>
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
                  </div>
                ) : (
                  <div className="mt-4 rounded-3xl border border-dashed border-[var(--border)] bg-white/55 p-8 text-sm text-[var(--muted)]">
                    Sélectionnez un client pour afficher son historique d&apos;achats ou ajoutez-en un nouveau.
                  </div>
                )}
              </div>
            </section>
          )}

          {view === "pos" && (
            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="glass-card rounded-[30px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="section-title text-xl font-semibold">POS / Encaissement</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Cliquez sur un produit pour l&apos;ajouter au panier.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {data.produits.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="cursor-pointer rounded-[26px] border border-[var(--border)] bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={product.image_url}
                          alt={product.nom}
                          width={72}
                          height={72}
                          className="h-18 w-18 rounded-2xl border border-[var(--border)] bg-[#f9fcfb] p-2 object-contain"
                        />
                        <div>
                          <p className="font-semibold text-[var(--primary-deep)]">{product.nom}</p>
                          <p className="text-sm text-[var(--muted)]">{product.categorie}</p>
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
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none"
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="section-title text-xl font-semibold">Historique des ventes</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {data.ventes.length} vente{data.ventes.length !== 1 ? "s" : ""} enregistrée{data.ventes.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-right">
                  <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Total général</p>
                  <p className="text-lg font-bold text-[var(--primary-deep)]">{formatMad(data.ventes.reduce((s, v) => s + v.total, 0))}</p>
                </div>
              </div>
              <div className="mt-5 overflow-hidden rounded-[26px] border border-[var(--border)]">
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
                    {data.ventes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-[var(--muted)]">
                          Aucune vente enregistrée pour le moment.
                        </td>
                      </tr>
                    ) : (
                      data.ventes.map((sale) => {
                        const product = data.produits.find((item) => item.id === sale.produit_id);
                        const client = data.clients.find((item) => item.id === sale.client_id);

                        return (
                          <tr key={sale.id} className="border-t border-[var(--border)] transition hover:bg-[#f8fbfa]">
                            <td className="px-4 py-4 font-medium text-[var(--primary-deep)]">
                              {product?.nom ?? "Produit"}
                            </td>
                            <td className="px-4 py-4">{sale.quantite}</td>
                            <td className="px-4 py-4">
                              {client ? `${client.nom} (${client.telephone})` : "Sans client"}
                            </td>
                            <td className="px-4 py-4 text-sm text-[var(--muted)]">
                              {formatDate(sale.date)}
                            </td>
                            <td className="px-4 py-4 font-semibold text-[var(--primary)]">
                              {formatMad(sale.total)}
                            </td>
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
            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
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
    </div>
  );
}

function FeatureChip({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white">
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

function MiniAction({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-[var(--border)] bg-white/78 px-4 py-4 text-left transition hover:bg-white"
    >
      <p className="font-semibold text-[var(--primary-deep)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
    </button>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="glass-card rounded-[28px] p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--primary-deep)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
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
    <label className="block text-sm font-medium text-[var(--primary-deep)]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none"
      />
    </label>
  );
}
