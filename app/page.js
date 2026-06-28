'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, QrCode, MessageSquare, TrendingUp, CheckCircle, Shield, ChevronDown } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SiteFooter from '@/components/SiteFooter'
import { useLang } from '@/hooks/useLang'
import { getLang, getLangMeta } from '@/lib/i18n'

/* ── Dashboard mockup ──────────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto" aria-hidden="true">
      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-3xl -z-10" />

      <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        {/* top bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <span className="text-slate-500 text-xs mx-auto font-mono">myreviewgate.com/dashboard</span>
        </div>

        <div className="flex">
          {/* sidebar */}
          <div className="w-36 bg-slate-950 p-3 flex flex-col gap-1 border-r border-white/5">
            <div className="flex items-center gap-2 px-2 py-2 mb-3">
              <div className="w-5 h-5 bg-indigo-500 rounded-md flex items-center justify-center">
                <Star size={10} className="text-white fill-white" />
              </div>
              <span className="text-white text-xs font-bold">ReviewGate</span>
            </div>
            {['דשבורד','אנליטיקה','ביקורות','הגדרות'].map((l,i) => (
              <div key={l} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${i===0 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${i===0?'bg-white':'bg-slate-700'}`} />
                {l}
              </div>
            ))}
          </div>

          {/* main */}
          <div className="flex-1 p-4">
            {/* stats */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { l:'סריקות', v:'2,543', c:'#6366f1' },
                { l:'דירוג', v:'4.6 ★', c:'#f59e0b' },
                { l:'ביקורות', v:'127', c:'#10b981' },
                { l:'גוגל', v:'92%', c:'#ef4444' },
              ].map(s => (
                <div key={s.l} className="bg-white/5 rounded-xl p-2.5">
                  <div className="text-slate-400 text-[9px] mb-1">{s.l}</div>
                  <div className="text-sm font-black" style={{color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* charts */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 bg-white/5 rounded-xl p-3">
                <div className="text-slate-400 text-[9px] mb-2">סריקות — 7 ימים</div>
                <svg viewBox="0 0 120 40" className="w-full">
                  <defs>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <polygon points="0,35 10,30 25,20 40,25 60,10 80,18 100,8 120,5 120,35" fill="url(#mg)"/>
                  <polyline points="0,35 10,30 25,20 40,25 60,10 80,18 100,8 120,5" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="w-24 bg-white/5 rounded-xl p-3 flex flex-col items-center gap-1">
                <div className="text-slate-400 text-[9px] mb-1">פילוח</div>
                <svg viewBox="0 0 40 40" className="w-14 h-14">
                  <circle cx="20" cy="20" r="14" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray="52 88" strokeDashoffset="-22" transform="rotate(-90 20 20)"/>
                  <circle cx="20" cy="20" r="14" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="27 113" strokeDashoffset="-74" transform="rotate(-90 20 20)"/>
                  <circle cx="20" cy="20" r="14" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="9 131" strokeDashoffset="-101" transform="rotate(-90 20 20)"/>
                </svg>
              </div>
            </div>

            {/* mini table */}
            <div className="bg-white/5 rounded-xl overflow-hidden">
              <div className="text-slate-400 text-[9px] px-3 py-2 border-b border-white/5">ביקורות אחרונות</div>
              {[
                { n:'יוסי כ.', s:5, t:'שירות מעולה!' },
                { n:'דנה מ.', s:4, t:'ממליצה בחום' },
                { n:'אנונימי', s:2, t:'חכיתי הרבה...' },
              ].map((r,i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 last:border-0">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center text-[8px] text-indigo-300 font-bold flex-shrink-0">
                    {r.n[0]}
                  </div>
                  <span className="text-slate-300 text-[9px] flex-1 truncate">{r.n} · {r.t}</span>
                  <span className="text-amber-400 text-[9px]">{'★'.repeat(r.s)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating badges */}
      <div className="absolute -right-6 top-16 bg-white rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-2 border border-slate-100">
        <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle size={14} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-800">ביקורת חדשה!</p>
          <p className="text-[9px] text-slate-400">לפני 2 דקות</p>
        </div>
      </div>
      <div className="absolute -left-6 bottom-16 bg-white rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-2 border border-slate-100">
        <div className="text-lg">⭐</div>
        <div>
          <p className="text-[10px] font-black text-slate-800">דירוג גוגל עלה</p>
          <p className="text-[9px] text-emerald-500 font-bold">4.6 → 4.8</p>
        </div>
      </div>
    </div>
  )
}

/* ── Flow Illustration ─────────────────────────────────── */
function FlowIllustration() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center text-2xl">📱</div>
        <span className="text-xs text-slate-500 font-medium">לקוח סורק</span>
      </div>
      <div className="text-slate-300 text-xl">→</div>
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center">
          <Star size={32} className="text-white fill-white" />
        </div>
        <span className="text-xs text-indigo-600 font-black">ReviewGate</span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="text-slate-300">→</div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <span className="text-base">⭐</span>
            <div>
              <p className="text-xs font-black text-emerald-800">גוגל ביקורות</p>
              <p className="text-[10px] text-emerald-600">4–5 כוכבים</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-slate-300">→</div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <span className="text-base">💬</span>
            <div>
              <p className="text-xs font-black text-amber-800">משוב פרטי</p>
              <p className="text-[10px] text-amber-600">1–3 כוכבים</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────── */
export default function HomePage() {
  const { langCode, handleLangChange } = useLang()
  const t = getLang(langCode)
  const meta = getLangMeta(langCode)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const navLinks = [
    { label: 'יתרונות', href: '#features' },
    { label: 'איך זה עובד', href: '#how' },
    { label: 'תמחור', href: '#pricing' },
    { label: 'צור קשר', href: '/contact' },
  ]

  return (
    <div className="min-h-screen bg-white" dir={meta.dir} lang={langCode}>

      {/* ── NAV ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Star size={16} className="text-white fill-white" />
            </div>
            <span className="font-black text-slate-900 text-lg">myReviewGate</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <a key={l.label} href={l.href}
                className="text-sm text-slate-600 hover:text-indigo-600 font-medium transition">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher current={langCode} onChange={handleLangChange} />
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition px-4 py-2 rounded-xl hover:bg-slate-50">
              כניסה
            </Link>
            <Link href="/register" className="text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200">
              התחל בחינם
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition" onClick={() => setMobileMenu(m => !m)}>
            <ChevronDown size={20} className={`text-slate-600 transition-transform ${mobileMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-100 px-5 py-4 flex flex-col gap-3">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileMenu(false)}
                className="text-sm text-slate-600 font-medium py-1">{l.label}</a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Link href="/login" className="flex-1 text-center text-sm font-semibold text-slate-700 py-2.5 rounded-xl border border-slate-200">כניסה</Link>
              <Link href="/register" className="flex-1 text-center text-sm font-bold bg-indigo-600 text-white py-2.5 rounded-xl">התחל בחינם</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-5 pt-24 pb-16 bg-gradient-to-b from-indigo-50/60 via-white to-white">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold px-4 py-2 rounded-full mb-8">
          <Star size={12} className="fill-indigo-500 text-indigo-500" />
          ניהול חוות דעת חכם לעסקים
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-tight mb-6 max-w-3xl">
          כל הביקורות שלך.<br />
          <span className="text-indigo-600">דשבורד אחד חכם.</span>
        </h1>

        <p className="text-lg text-slate-500 max-w-xl leading-relaxed mb-10">
          הניח תג NFC או QR על הדלפק. לקוח מרוצה עובר ישר לגוגל.
          לקוח עם הערה שולח לך פידבק פרטי — רק אתה רואה.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center mb-16">
          <Link href="/register"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl transition shadow-lg shadow-indigo-200 text-base">
            התחל בחינם
            <span className="text-indigo-300">→</span>
          </Link>
          <a href="#how"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold px-6 py-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition bg-white text-sm">
            איך זה עובד?
          </a>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400 flex-wrap justify-center mb-16">
          {['ללא כרטיס אשראי', 'מוכן תוך דקות', 'תמיכה בעברית'].map(b => (
            <span key={b} className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-emerald-500" /> {b}
            </span>
          ))}
        </div>

        <DashboardMockup />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-5 bg-slate-50" id="how">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-600 font-bold text-sm mb-3 uppercase tracking-wide">הזרימה</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">לחיצה אחת — שתי תוצאות</h2>
          <p className="text-slate-500 mb-14 max-w-lg mx-auto">הלקוח סורק ובוחר. מרוצה? עובר לגוגל. יש לו מה לומר? שולח לך ישירות.</p>
          <FlowIllustration />
        </div>
      </section>

      {/* ── 3 STEPS ── */}
      <section className="py-24 px-5" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-bold text-sm mb-3 uppercase tracking-wide">תהליך פשוט</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">שלושה צעדים להתחלה</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n:'01', icon:'📋', t:'נרשמים', d:'יוצרים חשבון ומגדירים את העסק תוך דקות. מקבלים קישור ייחודי.' },
              { n:'02', icon:'🏷️', t:'מניחים תג', d:'מדפיסים QR או מזמינים תג NFC — מניחים על הדלפק. זהו.' },
              { n:'03', icon:'📈', t:'מקבלים תוצאות', d:'ביקורות גוגל עולות, תלונות מגיעות ישירות אליך. הכל בדשבורד.' },
            ].map(s => (
              <div key={s.n} className="relative bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
                <div className="absolute top-6 left-6 text-slate-100 text-5xl font-black select-none">{s.n}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{s.t}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-24 px-5 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-bold text-sm mb-3 uppercase tracking-wide">יתרונות</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">כל מה שצריך לניהול מוניטין</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { Icon: QrCode,        color:'bg-indigo-50 text-indigo-600',  t:'NFC + QR', d:'תג חכם על הדלפק — עובד עם כל טלפון, ללא אפליקציה.' },
              { Icon: Star,          color:'bg-amber-50 text-amber-600',    t:'שמור על הדירוג', d:'ביקורות שליליות לא מגיעות לגוגל — מגיעות אליך בלבד.' },
              { Icon: MessageSquare, color:'bg-emerald-50 text-emerald-600',t:'פידבק פרטי', d:'לקוח לא מרוצה שולח לך הודעה ישירה. טפל בזה בצנעה.' },
              { Icon: TrendingUp,    color:'bg-violet-50 text-violet-600',  t:'אנליטיקה', d:'ראה כניסות, קליקים וביקורות — הכל בזמן אמת.' },
              { Icon: Star,          color:'bg-rose-50 text-rose-600',      t:'קישורים מותאמים', d:'הוסף עד 5 קישורים — וולט, אינסטגרם, פייסבוק ועוד.' },
              { Icon: Shield,        color:'bg-slate-50 text-slate-600',    t:'מאובטח לחלוטין', d:'הנתונים שמורים ב-Supabase עם הצפנה מלאה ו-RLS.' },
            ].map(f => (
              <div key={f.t} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.Icon size={20} />
                </div>
                <h3 className="font-black text-slate-900 mb-1.5">{f.t}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-5 bg-indigo-600">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { n:'500+', l:'עסקים פעילים' },
            { n:'50K+', l:'סריקות בחודש' },
            { n:'4.9', l:'דירוג ממוצע' },
            { n:'98%', l:'שביעות רצון' },
          ].map(s => (
            <div key={s.l}>
              <p className="text-4xl font-black mb-1">{s.n}</p>
              <p className="text-indigo-200 text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-5" id="pricing">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-indigo-600 font-bold text-sm mb-3 uppercase tracking-wide">תמחור</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">פשוט ושקוף</h2>
          <p className="text-slate-500 mb-12">צור קשר לקבלת הצעת מחיר מותאמת לעסק שלך</p>
          <div className="grid md:grid-cols-2 gap-6 text-right">
            {[
              { name:'בסיסי', price:'צור קשר', features:['קישור NFC/QR יחיד','דשבורד בסיסי','עד 100 סריקות/חודש','תמיכה במייל'], highlight: false },
              { name:'מקצועי', price:'צור קשר', features:['קישורים מרובים','אנליטיקה מתקדמת','ללא הגבלת סריקות','קישורים מותאמים','תמיכה מועדפת'], highlight: true },
            ].map(p => (
              <div key={p.name} className={`rounded-3xl p-8 border ${p.highlight ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-slate-100 shadow-sm'}`}>
                <h3 className={`font-black text-xl mb-1 ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                <p className={`text-3xl font-black mb-6 ${p.highlight ? 'text-indigo-200' : 'text-indigo-600'}`}>{p.price}</p>
                <ul className="flex flex-col gap-2.5 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={15} className={p.highlight ? 'text-indigo-300' : 'text-emerald-500'} />
                      <span className={p.highlight ? 'text-indigo-100' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact"
                  className={`block text-center py-3 rounded-2xl font-bold text-sm transition ${
                    p.highlight ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}>
                  צור קשר
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-5 bg-slate-900 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-1 mb-6">
            {[1,2,3,4,5].map(i => <Star key={i} size={24} className="fill-amber-400 text-amber-400" />)}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">מוכן להתחיל?</h2>
          <p className="text-slate-400 mb-10">הצטרף לעסקים שכבר מנהלים את המוניטין שלהם בחכמה.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-4 rounded-2xl transition shadow-lg shadow-indigo-900/50">
              הרשם בחינם
            </Link>
            <Link href="/login"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-4 rounded-2xl transition border border-white/10">
              כניסה
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter dir={meta.dir} />
    </div>
  )
}
