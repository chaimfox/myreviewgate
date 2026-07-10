'use client'

import { useEffect, useState } from 'react'
import PublicHeader from '@/components/PublicHeader'
import SiteFooter from '@/components/SiteFooter'

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
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col" dir="rtl">
      <PublicHeader />

      <main id="main-content" className="flex-1">
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
      </main>

      <SiteFooter />
    </div>
  )
}
