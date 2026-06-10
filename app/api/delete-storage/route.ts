import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();
    if (!filename) return NextResponse.json({ success: false, error: "Missing filename" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json({ success: false, error: "Service role key not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase.storage.from("products").remove([filename]);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
