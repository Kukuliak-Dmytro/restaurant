import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISH_KEY;

console.log("Supabase config:", {
  url: supabaseUrl ? "✓ Present" : "✗ Missing",
  key: supabaseAnonKey ? "✓ Present" : "✗ Missing"
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables:", {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_PUBLISH_KEY: supabaseAnonKey
  });
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
