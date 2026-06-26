'use client'

import { useState, useEffect, useRef } from 'react'
import { Store, CheckCircle, Star, MessageSquare, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import FeedbackForm from '@/components/FeedbackForm'
import CustomerAuthForm from './CustomerAuthForm'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { getLang, getLangMeta } from '@/lib/i18n'
import Logo from '@/components/Logo'
import SiteFooter from '@/components/SiteFooter'

const DEFAULT_LANG = 'he'

// Google "G" official colors
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

// Instagram gradient icon
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <defs>
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="5%" stopColor="#fdf497"/>
        <stop offset="45%" stopColor="#fd5949"/>
        <stop offset="60%" stopColor="#d6249f"/>
        <stop offset="90%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="#1877F2" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const WoltIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <circle cx="12" cy="12" r="12" fill="#009DE0"/>
    <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">W</text>
  </svg>
)

function getIcon(url, label) {
  const lower = (url + label).toLowerCase()
  if (lower.includes('instagram')) return <InstagramIcon />
  if (lower.includes('facebook') || lower.includes('fb.com')) return <FacebookIcon />
  if (lower.includes('wolt')) return <WoltIcon />
  return <ExternalLink className="w-5 h-5 text-slate-500" />
}

export default function CustomerReviewPage({ store }) {
  const supabase = createClientComponentClient()
  const tracked = useRef(false)

  const [langCode, setLangCode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('rg-lang') || DEFAULT_LANG
    return DEFAULT_LANG
  })
  const [screen, setScreen] = useState('choice')

  const t = getLang(langCode)
  const langMeta = getLangMeta(langCode)
  const customLinks = Array.isArray(store.custom_links) ? store.custom_links.filter(l => l.url && l.label) : []

  // Track page view once
  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    supabase.from('analytics_events').insert({ store_id: store.id, event_type: 'view' })
  }, [store.id, supabase])

  function handleLangChange(code) {
    setLangCode(code)
    if (typeof window !== 'undefined') localStorage.setItem('rg-lang', code)
  }

  async function handleGoogle() {
    await supabase.from('analytics_events').insert({ store_id: store.id, event_type: 'click_google' })
    window.location.href = store.google_review_url
  }

  async function handleCustomLink(link) {
    await supabase.from('analytics_events').insert({ store_id: store.id, event_type: 'click_custom', link_label: link.label })
    window.open(link.url, '_blank', 'noopener')
  }

  async function handlePrivate() {
    await supabase.from('analytics_events').insert({ store_id: store.id, event_type: 'click_private' })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setScreen('auth'); return }

    const { data: existing } = await supabase
      .from('feedback').select('id')
      .eq('store_id', store.id).eq('customer_id', session.user.id)
      .maybeSingle()
    setScreen(existing ? 'already_rated' : 'form')
  }

  async function handleAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: existing } = await supabase
      .from('feedback').select('id')
      .eq('store_id', store.id).eq('customer_id', session.user.id)
      .maybeSingle()
    setScreen(existing ? 'already_rated' : 'form')
  }

  return (
    <main id="main-content" dir={langMeta.dir} lang={langCode} className="min-h-screen bg-[#f7f6f3] flex flex-col">

      {/* ── Banner ── */}
      <div className="relative w-full h-52 overflow-hidden flex-shrink-0">
        {store.logo_url ? (
          <>
            <Image src={store.logo_url} alt={store.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Store size={56} className="text-white/30" />
          </div>
        )}
        {/* Logo + language switcher overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-4">
          <Logo size="sm" theme="dark" />
          <LanguageSwitcher current={langCode} onChange={handleLangChange} />
        </div>
        {/* Store name at bottom of banner */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <h1 className="text-2xl font-black text-white" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            {store.name}
          </h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 pb-8 pt-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-7">

          {/* ── CHOICE ── */}
          {screen === 'choice' && (
            <div className="w-full flex flex-col items-center gap-5 animate-fadeIn">
              <div className="text-center flex flex-col items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">{t.rateUs}</h2>
                <div className="flex gap-1" aria-hidden="true">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={22} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-500 text-sm">{t.chooseWay}</p>
              </div>

              <div className="w-full flex flex-col gap-3" role="list">
                {/* Google */}
                <button onClick={handleGoogle} role="listitem"
                  aria-label={t.rateGoogle}
                  className="w-full flex items-center gap-4 bg-white border-2 border-amber-200
                    rounded-2xl px-5 py-4 shadow-sm
                    hover:border-amber-400 hover:shadow-md active:scale-[0.98] transition-all duration-150">
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm" aria-hidden="true">
                    <GoogleIcon />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-slate-900 text-[15px]">{t.rateGoogle}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.rateGoogleSub}</p>
                  </div>
                  <span className="text-slate-300 text-base" aria-hidden="true">←</span>
                </button>

                {/* Private feedback */}
                <button onClick={handlePrivate} role="listitem"
                  aria-label={t.privateFeedback}
                  className="w-full flex items-center gap-4 bg-white border-2 border-slate-200
                    rounded-2xl px-5 py-4 shadow-sm
                    hover:border-slate-400 hover:shadow-md active:scale-[0.98] transition-all duration-150">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center" aria-hidden="true">
                    <MessageSquare size={22} className="text-slate-500" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-slate-900 text-[15px]">{t.privateFeedback}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.privateFeedbackSub}</p>
                  </div>
                  <span className="text-slate-300 text-base" aria-hidden="true">←</span>
                </button>

                {/* Custom links */}
                {customLinks.map((link, i) => (
                  <button key={i} onClick={() => handleCustomLink(link)}
                    className="w-full flex items-center gap-4 bg-white border-2 border-slate-100
                      rounded-2xl px-5 py-4 shadow-sm
                      hover:border-slate-300 hover:shadow-md active:scale-[0.98] transition-all duration-150">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                      {getIcon(link.url, link.label)}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-bold text-slate-900 text-[15px]">{link.label}</p>
                    </div>
                    <span className="text-slate-300 text-base">←</span>
                  </button>
                ))}
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
              <h2 className="text-xl font-black text-slate-900">{t.alreadyRated}</h2>
              <p className="text-slate-500 text-sm max-w-xs">{t.alreadyRatedMsg}</p>
              <button onClick={handleGoogle}
                className="flex items-center gap-2 text-sm text-amber-600 font-bold hover:underline mt-1">
                <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                {t.rateGoogleToo}
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
                <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                {t.rateGoogleToo}
              </button>
            </div>
          )}

        </div>
      </div>

      <SiteFooter dir={langMeta.dir} />
    </main>
  )
}
