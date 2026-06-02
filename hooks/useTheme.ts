import { useState, useEffect } from 'react'

const THEME_EVENT = 'portfolio-theme-change'

function readTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(next: 'light' | 'dark', originX?: number, originY?: number) {
  const root = document.documentElement

  if (originX !== undefined && originY !== undefined) {
    root.style.setProperty('--theme-toggle-x', `${originX}px`)
    root.style.setProperty('--theme-toggle-y', `${originY}px`)
  }

  if ('startViewTransition' in document) {
    // @ts-ignore — View Transitions API
    document.startViewTransition(() => {
      root.classList.toggle('dark', next === 'dark')
    })
  } else {
    root.classList.toggle('dark', next === 'dark')
  }

  localStorage.setItem('theme', next)
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }))
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(readTheme)

  useEffect(() => {
    const handler = (e: Event) => setTheme((e as CustomEvent<'light' | 'dark'>).detail)
    window.addEventListener(THEME_EVENT, handler)
    return () => window.removeEventListener(THEME_EVENT, handler)
  }, [])

  const toggleTheme = (event?: React.MouseEvent) => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)

    let ox: number | undefined
    let oy: number | undefined
    if (event) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      ox = rect.left + rect.width / 2
      oy = rect.top + rect.height / 2
    }

    applyTheme(next, ox, oy)
  }

  return { theme, toggleTheme }
}
