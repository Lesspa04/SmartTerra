// ============================================================
// SUPABASE CLIENT
// Configura tus credenciales en config.js o variables de env
// ============================================================

//   REEMPLAZA ESTOS VALORES con los de tu proyecto Supabase:
//    Supabase Dashboard → Settings → API
const SUPABASE_URL  = 'https://bbjaswlylrgbssujgykp.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiamFzd2x5bHJnYnNzdWpneWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTg4ODUsImV4cCI6MjA5MzQ5NDg4NX0.Gm7zWWy1aWNU_EKY6ZeAiaUPJiy0jjtIzjwmVs1Okqs'

// Usamos el bundle CDN de Supabase cargado inline
const { createClient } = supabase

const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
window.db = _supabase