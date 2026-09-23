import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "https://ieijkjjyfgnnypfmieij.backend.onspace.ai";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyZWYiOiJpZWlqa2pqeWZnbm55cGZtaWVpaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzgzMzU0MDMwLCJleHAiOjIwOTg3MTQwMzAsImlzcyI6Im9uc3BhY2UifQ.qCI-EaVe7l-8wRxHUEYHj464cUs-v3X5gOWC92darHc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
