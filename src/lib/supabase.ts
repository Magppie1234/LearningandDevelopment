import { createClient } from '@supabase/supabase-js'

// Next.js exposes browser-safe vars via NEXT_PUBLIC_*. Fall back to harmless
// placeholders so createClient() never throws at import time — demo mode never
// makes a real request, and real deployments set these in .env.local.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-placeholder'

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env not set — running in demo/placeholder mode. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for real auth.',
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
})
