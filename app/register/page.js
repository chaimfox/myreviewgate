'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Store, Link, Mail, Lock, User, Clock, CheckCircle, ArrowLeft } from 'lucide-react'
import NextLink from 'next/link'
import Logo from '@/components/Logo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SiteFooter from '@/components/SiteFooter'
import { useLang } from '@/hooks/useLang'

const STEPS = ['account', 'business', 'done']
const STEP_LABELS = ['פרטי חשבון', 'פרטי העסק', 'סיום']

export default function RegisterPage() {
  const supabase = createClientComponentClient()
  const [step, setStep] = useState('account')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [googleUrl, setGoogleUrl] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(null)
  const { langCode, handleLangChange } = useLang()

  function handleStoreName(val) {
    setStoreName(val)
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleAccountStep(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role: 'store_owner' } },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    setUserId(data.user?.id)
    setOwnerEmail(email)
    setLoading(false)
    setStep('business')
  }

  async function handleBusinessStep(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/register/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: storeName, slug, googleUrl, ownerEmail, fullName: name, email }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setStep('done')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col" dir="rtl">
    <main id="main-content" className="flex-1 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Brand + language switcher */}
        <div className="flex items-center justify-between mb-8">
          <Logo size="lg" />
          <LanguageSwitcher current={langCode} onChange={handleLangChange} />
        </div>

        {/* Progress stepper */}
        <div className="flex items-center justify-center gap-1 mb-7">
          {STEP_LABELS.map((label, i) => {
            const done = stepIndex > i
            const active = stepIndex === i
            return (
              <div key={label} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  done ? 'bg-emerald-100 text-emerald-700' :
                  active ? 'bg-slate-900 text-white shadow-sm' :
                  'bg-white border border-slate-200 text-slate-400'
                }`}>
                  {done ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
                  {(active || done) && <span>{label}</span>}
                </div>
                {i < 2 && <div className="w-4 h-px bg-slate-200" />}
              </div>
            )
          })}
        </div>

        <div className="card p-7">

          {/* STEP 1: Account */}
          {step === 'account' && (
            <form onSubmit={handleAccountStep} className="flex flex-col gap-4">
              <div className="mb-1">
                <h2 className="text-xl font-black text-slate-900">פרטי הכניסה שלך</h2>
                <p className="text-slate-500 text-sm mt-1">ניצור לך חשבון בעל עסק</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">שם מלא</label>
                <div className="relative">
                  <User size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="ישראל ישראלי"
                    className="w-full ps-9 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition placeholder-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">אימייל</label>
                <div className="relative">
                  <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@store.com" dir="ltr"
                    className="w-full ps-9 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition placeholder-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">סיסמה</label>
                <div className="relative">
                  <Lock size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="לפחות 6 תווים"
                    className="w-full ps-9 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition placeholder-slate-400" />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100 text-center">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary mt-1">
                {loading ? 'יוצר חשבון...' : <>המשך <ArrowLeft size={15} /></>}
              </button>
            </form>
          )}

          {/* STEP 2: Business */}
          {step === 'business' && (
            <form onSubmit={handleBusinessStep} className="flex flex-col gap-4">
              <div className="mb-1">
                <h2 className="text-xl font-black text-slate-900">פרטי העסק שלך</h2>
                <p className="text-slate-500 text-sm mt-1">נגדיר את דף הלקוחות שלך</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">שם העסק <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Store size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={storeName} onChange={(e) => handleStoreName(e.target.value)} required placeholder="קפה סנוק"
                    className="w-full ps-9 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition placeholder-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  כתובת הדף שלך <span className="text-red-500">*</span>
                  <span className="text-slate-400 font-normal mr-1">(מה שמופיע אחרי /)</span>
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-amber-400 transition">
                  <span className="text-slate-400 text-xs whitespace-nowrap py-3">reviewgate.app/</span>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required
                    placeholder="cafe-sanuk" dir="ltr"
                    className="flex-1 py-3 bg-transparent text-sm font-mono focus:outline-none placeholder-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">קישור לגוגל ביקורות <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Link size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="url" value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} required placeholder="https://g.page/r/..." dir="ltr"
                    className="w-full ps-9 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition placeholder-slate-400" />
                </div>
                <p className="text-xs text-slate-400 mt-1">גוגל מפות ← העסק שלך ← שתף ← העתק קישור</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">אימייל לקבלת התראות</label>
                <div className="relative">
                  <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required dir="ltr"
                    className="w-full ps-9 pe-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition" />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100 text-center">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary mt-1">
                {loading ? 'שולח בקשה...' : <>שלח לאישור <CheckCircle size={15} /></>}
              </button>
            </form>
          )}

          {/* STEP 3: Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock size={36} className="text-amber-500" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-2xl">הבקשה נשלחה!</h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  קיבלנו את פרטי העסק שלך.<br />
                  המנהל יאשר את הבקשה בהקדם.<br />
                  תקבל מייל ברגע שהחשבון יאושר.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-500 border border-slate-100 w-full">
                בינתיים תוכל להכנס דרך:{' '}
                <NextLink href="/login" className="text-amber-600 font-bold hover:underline">/login</NextLink>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          כבר יש לך חשבון?{' '}
          <NextLink href="/login" className="text-amber-600 font-bold hover:underline">כניסה</NextLink>
        </p>

      </div>
    </main>
    <SiteFooter />
    </div>
  )
}
