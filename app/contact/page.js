'use client'

import { useEffect, useState } from 'react'
import { Mail, Phone, Send, CheckCircle } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import SiteFooter from '@/components/SiteFooter'

export default function ContactPage() {
  const [settings, setSettings] = useState({})
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const [langCode, setLangCode] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('rg-lang') || 'he' : 'he'
  )
  function handleLangChange(code) {
    setLangCode(code)
    if (typeof window !== 'undefined') localStorage.setItem('rg-lang', code)
  }

  useEffect(() => {
    fetch('/api/admin/settings').then((r) => r.json()).then(setSettings).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setDone(true)
    } catch (err) {
      setError(err.message || 'שגיאה בשליחה, נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col" dir="rtl">
      <PublicHeader langCode={langCode} onLangChange={handleLangChange} />

      <main id="main-content" className="flex-1">
        <div className="max-w-4xl mx-auto px-5 py-14 grid md:grid-cols-2 gap-10">

          {/* Contact info */}
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-3">צור קשר</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              שאלות, בקשות שיתוף פעולה או כל דבר אחר — נשמח לשמוע ממך. נחזור אליך תוך 24 שעות.
            </p>

            <div className="flex flex-col gap-4">
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-3 card p-4 hover:shadow-md transition group">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-amber-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">דוא"ל</p>
                    <p className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition" dir="ltr">
                      {settings.contact_email}
                    </p>
                  </div>
                </a>
              )}
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`}
                  className="flex items-center gap-3 card p-4 hover:shadow-md transition group">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-amber-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">טלפון</p>
                    <p className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition" dir="ltr">
                      {settings.contact_phone}
                    </p>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Contact form */}
          <div className="card p-7">
            {done ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h2 className="font-black text-slate-900 text-xl">ההודעה נשלחה!</h2>
                <p className="text-slate-500 text-sm">נחזור אליך בהקדם.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className="font-black text-slate-900 text-lg mb-1">שלח הודעה</h2>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">שם מלא <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">אימייל <span className="text-red-500">*</span></label>
                  <input type="email" required value={form.email} dir="ltr"
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">נושא</label>
                  <input type="text" value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">הודעה <span className="text-red-500">*</span></label>
                  <textarea required rows={4} value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition resize-none" />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100 text-center">{error}</p>
                )}

                <button type="submit" disabled={loading}
                  className="btn-primary mt-1 flex items-center justify-center gap-2">
                  {loading ? 'שולח...' : <><Send size={15} aria-hidden="true" /> שלח הודעה</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
