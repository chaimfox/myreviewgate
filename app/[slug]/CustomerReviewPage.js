'use client'

import { useState } from 'react'
import { Store, CheckCircle, Star, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import FeedbackForm from '@/components/FeedbackForm'
import CustomerAuthForm from './CustomerAuthForm'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { getLang, getLangMeta } from '@/lib/i18n'
import Logo from '@/components/Logo'

const DEFAULT_LANG = 'he'

export default function CustomerReviewPage({ store }) {
  const supabase = createClientComponentClient()
  const [langCode, setLangCode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('rg-lang') || DEFAULT_LANG
    return DEFAULT_LANG
  })
  const [screen, setScreen] = useState('choice')

  const t = getLang(langCode)
  const langMeta = getLangMeta(langCode)

  function handleLangChange(code) {
    setLangCode(code)
    if (typeof window !== 'undefined') localStorage.setItem('rg-lang', code)
  }

  function handleGoogle() {
    window.location.href = store.google_review_url
  }

  async function handlePrivate() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setScreen('auth'); return }

    const { data: existing } = await supabase
      .from('feedback')
      .select('id')
      .eq('store_id', store.id)
      .eq('customer_id', session.user.id)
      .maybeSingle()

    setScreen(existing ? 'already_rated' : 'form')
  }

  async function handleAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: existing } = await supabase
      .from('feedback')
      .select('id')
      .eq('store_id', store.id)
      .eq('customer_id', session.user.id)
      .maybeSingle()

    setScreen(existing ? 'already_rated' : 'form')
  }

  return (
    <main dir={langMeta.dir} className="min-h-screen bg-[#f7f6f3] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <Logo size="sm" />
        <LanguageSwitcher current={langCode} onChange={handleLangChange} />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-5 pb-8 pt-4">
        <div className="w-full max-w-sm flex flex-col items-center gap-7">

          {/* Store logo */}
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-white shadow-lg border border-slate-100 flex items-center justify-center">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
              : <Store size={38} className="text-slate-300" />}
          </div>

          {/* ── CHOICE ── */}
          {screen === 'choice' && (
            <div className="w-full flex flex-col items-center gap-5 animate-fadeIn">
              <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900">{store.name}</h1>
                <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">
                  חשוב לנו לשמוע את דעתך!<br />
                  <span className="text-xs text-slate-400">כיצד תרצה לשתף אותנו?</span>
                </p>
              </div>

              <div className="w-full flex flex-col gap-3">
                {/* Google */}
                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center gap-4 bg-white border-2 border-amber-200
                    rounded-2xl px-5 py-4 shadow-sm
                    hover:border-amber-400 hover:shadow-md active:scale-[0.98] transition-all duration-150"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Star size={24} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-slate-900 text-[15px]">אשמח לדרג אתכם בגוגל</p>
                    <p className="text-xs text-slate-400 mt-0.5">עוזר לאחרים למצוא אותנו</p>
                  </div>
                  <span className="text-slate-300 text-base">←</span>
                </button>

                {/* Private */}
                <button
                  onClick={handlePrivate}
                  className="w-full flex items-center gap-4 bg-white border-2 border-slate-200
                    rounded-2xl px-5 py-4 shadow-sm
                    hover:border-slate-400 hover:shadow-md active:scale-[0.98] transition-all duration-150"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <MessageSquare size={22} className="text-slate-500" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-slate-900 text-[15px]">אשמח לכתוב משוב פרטי</p>
                    <p className="text-xs text-slate-400 mt-0.5">ישירות לשירות הלקוחות שלנו</p>
                  </div>
                  <span className="text-slate-300 text-base">←</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">תודה שלקחת רגע לשתף אותנו 🙏</p>
            </div>
          )}

          {/* ── AUTH ── */}
          {screen === 'auth' && (
            <div className="w-full animate-fadeIn">
              <CustomerAuthForm t={t} onAuthenticated={handleAuthenticated} />
            </div>
          )}

          {/* ── FORM ── */}
          {screen === 'form' && (
            <div className="w-full flex flex-col gap-5 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900">{t.sorryToHear}</h2>
                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{t.tellUsWhatWentWrong}</p>
              </div>
              <div className="card p-5">
                <FeedbackForm storeId={store.id} onSubmitted={() => setScreen('thanks')} t={t} />
              </div>
              <button onClick={() => setScreen('choice')} className="text-sm text-slate-400 hover:text-slate-600 text-center">
                {t.goBack}
              </button>
            </div>
          )}

          {/* ── ALREADY RATED ── */}
          {screen === 'already_rated' && (
            <div className="flex flex-col items-center gap-4 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⭐</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">כבר שלחת משוב!</h2>
              <p className="text-slate-500 text-sm max-w-xs">
                כבר שלחת משוב פרטי לחנות זו. תודה שעזרת לנו להשתפר!
              </p>
              <button onClick={handleGoogle}
                className="flex items-center gap-2 text-sm text-amber-600 font-bold hover:underline mt-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                דרג אותנו גם בגוגל?
              </button>
            </div>
          )}

          {/* ── THANKS ── */}
          {screen === 'thanks' && (
            <div className="flex flex-col items-center gap-4 text-center animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={44} className="text-emerald-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">{t.thankYou}</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{t.thankYouMsg}</p>
              <button onClick={handleGoogle}
                className="mt-2 flex items-center gap-2 text-sm text-amber-600 font-bold hover:underline">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                דרג אותנו גם בגוגל?
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} ReviewGate · כל הזכויות שמורות
      </footer>
    </main>
  )
}
