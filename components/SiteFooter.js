'use client'

import Link from 'next/link'

export default function SiteFooter({ dir = 'rtl' }) {
  return (
    <footer className="bg-slate-900 border-t border-white/5 py-7 px-5" dir={dir}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400"
          aria-label="קישורי תחתית"
        >
          <Link href="/privacy"       className="hover:text-slate-200 transition">מדיניות פרטיות</Link>
          <Link href="/terms"         className="hover:text-slate-200 transition">תקנון שימוש</Link>
          <Link href="/accessibility" className="hover:text-slate-200 transition">הצהרת נגישות</Link>
          <Link href="/contact"       className="hover:text-slate-200 transition">צור קשר</Link>
        </nav>
        <p className="text-xs text-slate-500 whitespace-nowrap">
          © {new Date().getFullYear()} myReviewGate
        </p>
      </div>
    </footer>
  )
}
