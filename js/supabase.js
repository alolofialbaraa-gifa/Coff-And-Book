import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "Your Supabase URL here";
const supabaseKey = "Your Supabase Anon Key here";
export const supabase = createClient(supabaseUrl, supabaseKey);
