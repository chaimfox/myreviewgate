'use client'

import { useState, useEffect } from 'react'

export function useLang() {
  const [langCode, setLangCode] = useState('he')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('rg-lang') || 'he'
    setLangCode(saved)
    setReady(true)
  }, [])

  function handleLangChange(code) {
    setLangCode(code)
    localStorage.setItem('rg-lang', code)
  }

  return { langCode, handleLangChange, ready }
}
