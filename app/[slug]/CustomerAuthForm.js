'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Phone, User, ArrowLeft } from 'lucide-react'

export default function CustomerAuthForm({ t, onAuthenticated }) {
  const supabase = createClientComponentClient()
  const [step, setStep] = useState('details') // 'details' | 'otp'
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Normalize phone → international format
  function normalizePhone(raw) {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0')) return '+972' + digits.slice(1)
    if (digits.startsWith('972')) return '+' + digits
    return '+' + digits
  }

  async function handleSendOtp(e) {
    e.preventDefault()
    if (!phone.trim() || !name.trim()) return
    setLoading(true)
    setError(null)

    const normalized = normalizePhone(phone)
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: normalized })

    if (otpError) {
      // Phone auth may not be enabled — fall back to anonymous-style email auth
      if (otpError.message.includes('not enabled') || otpError.message.includes('provider')) {
        await handleFallbackAuth(normalized)
      } else {
        setError('לא הצלחנו לשלוח SMS. בדוק את מספר הטלפון.')
      }
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  // Fallback: sign up with phone-derived email if SMS not configured
  async function handleFallbackAuth(normalizedPhone) {
    const fakeEmail = `${normalizedPhone.replace('+', '')}@cust.reviewgate.app`
    const fakePass = `rg_${normalizedPhone}_2024`

    // Try sign in first
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: fakePass,
    })

    if (signInErr) {
      // New customer — sign up
      const { error: signUpErr } = await supabase.auth.signUp({
        email: fakeEmail,
        password: fakePass,
        options: { data: { full_name: name, phone: normalizedPhone, role: 'customer' } },
      })
      if (signUpErr) { setError('שגיאה ברישום. נסה שוב.'); return }
    }

    // Update profile name
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: name,
        phone: normalizedPhone,
        role: 'customer',
        email: fakeEmail,
      })
    }

    onAuthenticated()
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const normalized = normalizePhone(phone)
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      phone: normalized,
      token: otp,
      type: 'sms',
    })

    if (verifyErr) {
      setError('קוד שגוי. נסה שוב.')
      setLoading(false)
      return
    }

    // Save name to profile
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: name,
        phone: normalized,
        role: 'customer',
      })
    }

    onAuthenticated()
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 mb-4">
          <Phone size={24} className="text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {step === 'otp' ? 'הזן את הקוד שקיבלת' : 'כמה פרטים לפני שנמשיך'}
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          {step === 'otp'
            ? `שלחנו SMS למספר ${phone}`
            : 'נדרש רישום חד-פעמי כדי לוודא שהדירוג אמיתי.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="relative">
              <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="השם שלך" required
                className="w-full ps-9 pe-4 py-3 rounded-xl border border-gray-200 bg-white text-sm
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="050-000-0000" required dir="ltr"
                className="w-full ps-9 pe-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-left
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <button type="submit" disabled={loading || !name || !phone}
              className="py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-200">
              {loading ? 'שולח...' : 'המשך לדירוג ←'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
              placeholder="הזן קוד 6 ספרות" maxLength={6} dir="ltr"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-xl tracking-widest
                font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <button type="submit" disabled={loading || otp.length < 6}
              className="py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                hover:bg-indigo-700 disabled:opacity-50 transition">
              {loading ? 'מאמת...' : 'אמת ומשך'}
            </button>
            <button type="button" onClick={() => setStep('details')}
              className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft size={14} /> חזור
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
