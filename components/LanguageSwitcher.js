'use client'

import { useState, useRef, useEffect } from 'react'
import { LANGUAGES } from '@/lib/i18n'
import { ChevronDown } from 'lucide-react'

export default function LanguageSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)
  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0]

  useEffect(() => {
    function handleClick(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
      })
    }
    setOpen((o) => !o)
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label="בחר שפה"
        aria-expanded={open}
        className="flex items-center gap-1.5 bg-white/80 backdrop-blur border border-gray-200
          rounded-xl px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-white transition"
      >
        <span aria-hidden="true">{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          style={{ position: 'fixed', top: pos.top, right: pos.right }}
          className="bg-white border border-gray-100 rounded-xl shadow-xl z-[9999] min-w-[160px] overflow-hidden"
          role="listbox"
          aria-label="רשימת שפות"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === current}
              onClick={() => { onChange(lang.code); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition
                ${lang.code === current
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span aria-hidden="true">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
