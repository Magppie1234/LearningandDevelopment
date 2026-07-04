'use client'

import { useEffect, type ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/lib/auth'

/**
 * Client-side providers mounted once at the root. AuthProvider owns the
 * Supabase/demo session; ThemeProvider drives light/dark ("Obsidian") mode
 * via a `dark` class (§3.4); the effect registers the offline-mode service
 * worker (§3.2 item 6) in production builds only, so dev HMR stays sane.
 */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline mode unavailable — app still works online */
      })
    } else {
      // A SW registered by a previous production run would keep serving
      // cached chunks cache-first and freeze dev updates — remove it.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister())
      })
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
      }
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
