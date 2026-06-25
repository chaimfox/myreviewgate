'use client'

import { useState, useRef, useEffect } from 'react'
import { LANGUAGES } from '@/lib/i18n'
import { ChevronDown } from 'lucide-react'

export default function LanguageSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0]

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 bg-white/80 backdrop-blur border border-gray-200
          rounded-xl px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-white transition"
      >
        <span>{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-100
          rounded-xl shadow-lg overflow-hidden z-50 min-w-[130px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { onChange(lang.code); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition
                ${lang.code === current
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
