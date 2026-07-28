// =====================================================================
// Creates ONE Supabase client that every other script shares.
// Loaded after the Supabase CDN script and after config.js.
// =====================================================================

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
