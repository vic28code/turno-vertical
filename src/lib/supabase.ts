import { createClient } from '@supabase/supabase-js'

// 1. Debe coincidir con lo que pusiste en el .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

// 2. CAMBIO AQUÍ: Antes decia ..._PUBLISHABLE_KEY, ahora ponemos ..._ANON_KEY
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 3. Validación de seguridad (opcional pero recomendada)
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

export default supabase