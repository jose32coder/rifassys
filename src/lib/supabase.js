// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validación simple para evitar el error "supabaseUrl is required"
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Error: Faltan las variables de entorno de Supabase en .env.local",
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
