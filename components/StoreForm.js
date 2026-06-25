'use client'

import { useState, useRef } from 'react'
import { X, Save, Upload, ImageIcon, Plus, Trash2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

const TEXT_FIELDS = [
  { key: 'name',               label: 'שם החנות',                type: 'text',  placeholder: 'קפה סנוק',          required: true  },
  { key: 'slug',               label: 'כתובת URL (slug)',         type: 'text',  placeholder: 'sanuk-coffee',       required: true  },
  { key: 'google_review_url',  label: 'קישור לביקורות Google',   type: 'url',   placeholder: 'https://g.page/r/…', required: true  },
  { key: 'owner_email',        label: 'אימייל לקבלת התראות',     type: 'email', placeholder: 'owner@store.com',    required: true  },
]
const LTR_FIELDS = ['slug', 'google_review_url', 'owner_email']

export default function StoreForm({ initial, onSave, onCancel }) {
  const supabase = createClientComponentClient()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name:              initial?.name              ?? '',
    slug:              initial?.slug              ?? '',
    google_review_url: initial?.google_review_url ?? '',
    owner_email:       initial?.owner_email       ?? '',
    logo_url:          initial?.logo_url          ?? '',
    custom_links:      initial?.custom_links      ?? [],
  })
  const [uploading, setUploading] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  /* ── Logo upload ── */
  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)) {
      setError('אנא העלה קובץ תמונה (PNG, JPG, WEBP)'); return
    }
    if (file.size > 2 * 1024 * 1024) { setError('הקובץ גדול מדי — מקסימום 2MB'); return }

    setUploading(true); setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    const ext  = file.name.split('.').pop()
    const path = `${session?.user?.id ?? 'anon'}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (uploadErr) { setError('שגיאה בהעלאה: ' + uploadErr.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
    setForm((p) => ({ ...p, logo_url: publicUrl }))
    setUploading(false)
  }

  /* ── Custom links ── */
  function addLink() {
    if (form.custom_links.length >= 5) return
    setForm((p) => ({ ...p, custom_links: [...p.custom_links, { label: '', url: '' }] }))
  }

  function updateLink(i, field, val) {
    setForm((p) => {
      const links = [...p.custom_links]
      links[i] = { ...links[i], [field]: val }
      return { ...p, custom_links: links }
    })
  }

  function removeLink(i) {
    setForm((p) => ({ ...p, custom_links: p.custom_links.filter((_, idx) => idx !== i) }))
  }

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const validLinks = form.custom_links.filter(l => l.label.trim() && l.url.trim())
      await onSave({ ...form, custom_links: validLinks })
    } catch (err) {
      setError(err.message ?? 'שגיאה בשמירת החנות.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-black text-slate-900">{initial ? 'עריכת חנות' : 'הוספת חנות חדשה'}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

          {/* ── Logo ── */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">לוגו החנות</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 bg-slate-50">
                {form.logo_url
                  ? <Image src={form.logo_url} alt="logo" width={64} height={64} className="object-cover w-full h-full" />
                  : <ImageIcon size={22} className="text-slate-300" />}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                    border border-amber-200 text-amber-700 text-sm font-bold
                    hover:bg-amber-50 disabled:opacity-50 transition">
                  {uploading
                    ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>מעלה...</>
                    : <><Upload size={15} />העלה תמונה</>}
                </button>
                <p className="text-xs text-slate-400 text-center">PNG, JPG, WEBP עד 2MB</p>
              </div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload} className="hidden" />
            </div>
            {!form.logo_url && (
              <input type="url" name="logo_url" value={form.logo_url} onChange={handleChange}
                placeholder="או הכנס קישור לתמונה..." dir="ltr"
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm
                  focus:outline-none focus:ring-2 focus:ring-amber-400 transition placeholder-slate-400" />
            )}
            {form.logo_url && (
              <button type="button" onClick={() => setForm((p) => ({ ...p, logo_url: '' }))}
                className="mt-1 text-xs text-rose-400 hover:text-rose-600">הסר לוגו</button>
            )}
          </div>

          {/* ── Text fields ── */}
          {TEXT_FIELDS.map(({ key, label, type, placeholder, required }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                {label} {required && <span className="text-rose-500">*</span>}
              </label>
              <input type={type} name={key} value={form[key]} onChange={handleChange}
                placeholder={placeholder} required={required}
                dir={LTR_FIELDS.includes(key) ? 'ltr' : 'rtl'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white
                  placeholder-slate-400 transition" />
            </div>
          ))}

          {/* ── Custom links ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-600">
                קישורים מותאמים
                <span className="text-slate-400 font-normal mr-1">(עד 5)</span>
              </label>
              {form.custom_links.length < 5 && (
                <button type="button" onClick={addLink}
                  className="flex items-center gap-1 text-xs text-amber-700 font-bold hover:text-amber-900 transition">
                  <Plus size={13} /> הוסף קישור
                </button>
              )}
            </div>

            {form.custom_links.length === 0 && (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2.5 border border-dashed border-slate-200 text-center">
                ניתן להוסיף קישורים לאינסטגרם, וולט, פייסבוק ועוד
              </p>
            )}

            <div className="flex flex-col gap-2">
              {form.custom_links.map((link, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2 border border-slate-200">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input type="text" value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)}
                      placeholder="שם הכפתור (לדוג׳: אינסטגרם)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs
                        focus:outline-none focus:ring-2 focus:ring-amber-400 transition placeholder-slate-400" />
                    <input type="url" value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)}
                      placeholder="https://instagram.com/..." dir="ltr"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono
                        focus:outline-none focus:ring-2 focus:ring-amber-400 transition placeholder-slate-400" />
                  </div>
                  <button type="button" onClick={() => removeLink(i)}
                    className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel} className="flex-1 btn-secondary">ביטול</button>
            <button type="submit" disabled={loading || uploading} className="flex-1 btn-primary">
              {loading ? 'שומר...' : <><Save size={15} />שמור</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
