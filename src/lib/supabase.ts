import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Só cria o cliente se tivermos os valores mínimos, evitando erro no build
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
