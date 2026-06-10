import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export const dataMode = process.env.NEXT_PUBLIC_DATA_MODE === "cloud" ? "cloud" : "local";

export function getStorageUrl(): string | null {
  if (!url) return null;
  return `${url}/storage/v1/object/public/products`;
}
