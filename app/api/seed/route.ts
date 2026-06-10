import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { seedData } from "@/data/seed";

const UUID_PRODUITS = [
  "10000000-0000-0000-0000-000000000001",
  "10000000-0000-0000-0000-000000000002",
  "20000000-0000-0000-0000-000000000003",
  "20000000-0000-0000-0000-000000000004",
  "30000000-0000-0000-0000-000000000005",
  "40000000-0000-0000-0000-000000000006",
  "50000000-0000-0000-0000-000000000007",
  "50000000-0000-0000-0000-000000000008",
  "60000000-0000-0000-0000-000000000009",
  "60000000-0000-0000-0000-000000000010",
  "40000000-0000-0000-0000-000000000011",
  "30000000-0000-0000-0000-000000000012",
  "50000000-0000-0000-0000-000000000013",
  "50000000-0000-0000-0000-000000000014",
  "50000000-0000-0000-0000-000000000040",
  "40000000-0000-0000-0000-000000000015",
  "40000000-0000-0000-0000-000000000016",
  "40000000-0000-0000-0000-000000000041",
  "30000000-0000-0000-0000-000000000017",
  "30000000-0000-0000-0000-000000000018",
  "30000000-0000-0000-0000-000000000042",
  "20000000-0000-0000-0000-000000000019",
  "20000000-0000-0000-0000-000000000020",
  "20000000-0000-0000-0000-000000000021",
  "60000000-0000-0000-0000-000000000022",
  "60000000-0000-0000-0000-000000000023",
  "60000000-0000-0000-0000-000000000043",
  "10000000-0000-0000-0000-000000000024",
  "10000000-0000-0000-0000-000000000025",
  "10000000-0000-0000-0000-000000000044",
  "70000000-0000-0000-0000-000000000026",
  "70000000-0000-0000-0000-000000000027",
  "70000000-0000-0000-0000-000000000028",
  "70000000-0000-0000-0000-000000000029",
  "70000000-0000-0000-0000-000000000045",
  "80000000-0000-0000-0000-000000000030",
  "80000000-0000-0000-0000-000000000031",
  "80000000-0000-0000-0000-000000000032",
  "80000000-0000-0000-0000-000000000033",
  "80000000-0000-0000-0000-000000000046",
  "90000000-0000-0000-0000-000000000034",
  "90000000-0000-0000-0000-000000000035",
  "90000000-0000-0000-0000-000000000036",
  "90000000-0000-0000-0000-000000000047",
  "90000000-0000-0000-0000-000000000048",
  "a0000000-0000-0000-0000-000000000037",
  "a0000000-0000-0000-0000-000000000038",
  "a0000000-0000-0000-0000-000000000039",
  "a0000000-0000-0000-0000-000000000049",
  "a0000000-0000-0000-0000-000000000050",
];

const UUID_CLIENTS = [
  "e0000000-0000-0000-0000-000000000001",
  "e0000000-0000-0000-0000-000000000002",
  "e0000000-0000-0000-0000-000000000003",
  "e0000000-0000-0000-0000-000000000004",
  "e0000000-0000-0000-0000-000000000005",
  "e0000000-0000-0000-0000-000000000006",
  "e0000000-0000-0000-0000-000000000007",
  "e0000000-0000-0000-0000-000000000008",
  "e0000000-0000-0000-0000-000000000009",
  "e0000000-0000-0000-0000-000000000010",
  "e0000000-0000-0000-0000-000000000011",
  "e0000000-0000-0000-0000-000000000012",
  "e0000000-0000-0000-0000-000000000013",
  "e0000000-0000-0000-0000-000000000014",
  "e0000000-0000-0000-0000-000000000015",
  "e0000000-0000-0000-0000-000000000016",
  "e0000000-0000-0000-0000-000000000017",
  "e0000000-0000-0000-0000-000000000018",
  "e0000000-0000-0000-0000-000000000019",
  "e0000000-0000-0000-0000-000000000020",
];

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: "Supabase URL or service role key not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    await supabase.from("ventes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("produits").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("clients").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("categories").delete().neq("nom", "");

    const errors: string[] = [];

    for (const cat of seedData.categories) {
      const { error } = await supabase.from("categories").upsert({ nom: cat });
      if (error) errors.push(`Catégorie ${cat}: ${error.message}`);
    }

    for (let i = 0; i < seedData.produits.length; i++) {
      const { nom, description, prix, stock, image_url, categorie } = seedData.produits[i];
      const { error } = await supabase.from("produits").upsert({
        id: UUID_PRODUITS[i],
        nom, description, prix, stock, image_url, categorie,
      });
      if (error) errors.push(`Produit ${nom}: ${error.message}`);
    }

    for (let i = 0; i < seedData.clients.length; i++) {
      const { nom, telephone, total_achats } = seedData.clients[i];
      const { error } = await supabase.from("clients").upsert({
        id: UUID_CLIENTS[i],
        nom, telephone, total_achats,
      });
      if (error) errors.push(`Client ${nom}: ${error.message}`);
    }

    for (let i = 0; i < seedData.ventes.length; i++) {
      const { quantite, total, date, client_id, produit_id } = seedData.ventes[i];
      const prodIdx = seedData.produits.findIndex((p) => p.id === produit_id);
      const cliIdx = client_id ? seedData.clients.findIndex((c) => c.id === client_id) : -1;
      const { error } = await supabase.from("ventes").insert({
        quantite, total, date,
        produit_id: UUID_PRODUITS[prodIdx],
        client_id: cliIdx >= 0 ? UUID_CLIENTS[cliIdx] : null,
      });
      if (error) errors.push(`Vente #${i + 1}: ${error.message}`);
    }

    return NextResponse.json({
      success: errors.length === 0,
      categories: seedData.categories.length,
      produits: seedData.produits.length,
      clients: seedData.clients.length,
      ventes: seedData.ventes.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
