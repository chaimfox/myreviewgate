'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'

export default function PublicHeader() {
  return (
    <header className="bg-white border-b-2 border-slate-900 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-3">
        <Link href="/" aria-label="חזור לדף הבית">
          <Logo size="sm" />
        </Link>
      </div>
    </header>
  )
}
