import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://qwgkhqryhojqkovfmxdg.supabase.co"; 
 
const supabasePublishableKey = 
  "sb_publishable_oWvkNh819-kyzeixbuFYVg_6_gbUsM2";

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);