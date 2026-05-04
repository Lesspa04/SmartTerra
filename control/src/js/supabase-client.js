// ============================================================
// SUPABASE CLIENT
// Configura tus credenciales en config.js o variables de env
// ============================================================

// ⚠️ REEMPLAZA ESTOS VALORES con los de tu proyecto Supabase:
//    Supabase Dashboard → Settings → API
const SUPABASE_URL  = 'https://TU_PROJECT_ID.supabase.co'
const SUPABASE_ANON = 'TU_ANON_KEY'

// Usamos el bundle CDN de Supabase cargado inline
const { createClient } = supabase

const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
window.db = _supabase