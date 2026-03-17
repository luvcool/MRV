import { createContext, useContext, useState } from 'react'
import type { Lang } from '../lib/i18n'

const LangContext = createContext<{
  lang: Lang
  toggle: () => void
}>({ lang: 'ko', toggle: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('mrv-lang') as Lang) || 'ko'
  })

  const toggle = () => {
    setLang(prev => {
      const next: Lang = prev === 'ko' ? 'en' : 'ko'
      localStorage.setItem('mrv-lang', next)
      return next
    })
  }

  return (
    <LangContext.Provider value={{ lang, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
