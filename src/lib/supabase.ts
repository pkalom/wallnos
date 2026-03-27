import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

// createClient requires valid strings — use placeholders if missing so the
// app still renders; auth features simply won't work.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder"
);
