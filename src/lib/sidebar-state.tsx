'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type SidebarState = {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}

const SidebarStateContext = createContext<SidebarState | null>(null)

/** Shares the desktop sidebar's collapsed/expanded state between Navbar (which
 * renders the toggle) and the portal layout (which sizes the content area to
 * match), so the page reclaims the freed-up width when the sidebar collapses. */
export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SidebarStateContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarStateContext.Provider>
  )
}

export function useSidebarState() {
  const ctx = useContext(SidebarStateContext)
  if (!ctx) throw new Error('useSidebarState must be used within SidebarStateProvider')
  return ctx
}
