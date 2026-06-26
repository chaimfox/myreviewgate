'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function TermsPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((s) => { setContent(s.terms_he ?? ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main id="main-content" className="min-h-screen bg-[#f7f6f3]" dir="rtl">
      <header className="bg-white border-b-2 border-slate-900">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <Link href="/"><Logo size="sm" /></Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-black text-slate-900 mb-2">תקנון שימוש</h1>
        <p className="text-slate-400 text-sm mb-8">עדכון אחרון: {new Date().getFullYear()}</p>

        <div className="card p-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {content || 'התקנון יעודכן בקרוב.'}
            </div>
          )}
        </div>
      </article>

      <footer className="bg-slate-900 border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <div className="flex flex-wrap justify-center gap-5 mb-2">
          <Link href="/privacy" className="hover:text-slate-300 transition">מדיניות פרטיות</Link>
          <Link href="/accessibility" className="hover:text-slate-300 transition">הצהרת נגישות</Link>
          <Link href="/contact" className="hover:text-slate-300 transition">צור קשר</Link>
        </div>
        © {new Date().getFullYear()} myReviewGate · כל הזכויות שמורות
      </footer>
    </main>
  )
}
