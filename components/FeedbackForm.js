'use client'

import { useState } from 'react'
import { MessageSquare, Phone, Mail, Send, Star } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(null)
  const active = hovered ?? value

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-600">דירוג כללי</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(star)}
            className="transition-transform active:scale-90 hover:scale-110"
          >
            <Star
              size={28}
              className={`transition-colors ${star <= active ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FeedbackForm({ storeId, onSubmitted, t }) {
  const supabase = createClientComponentClient()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim() || rating === 0) return
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { error: dbError } = await supabase.from('feedback').insert({
        store_id: storeId,
        rating,
        comment: comment.trim(),
        customer_id: session?.user?.id ?? null,
        customer_phone: phone.trim() || null,
        customer_name: email.trim() || null, // reuse customer_name col for email
      })
      if (dbError) throw dbError
      onSubmitted()
    } catch (err) {
      setError(t.errorMsg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = comment.trim() && rating > 0

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      {/* Star rating */}
      <StarPicker value={rating} onChange={setRating} />

      {/* Comment */}
      <div className="relative">
        <MessageSquare size={16} className="absolute start-3 top-3 text-gray-400 pointer-events-none" />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t.yourComment}
          required
          rows={4}
          className="w-full ps-9 pe-4 py-3 rounded-xl border border-gray-200 bg-white
            text-sm text-gray-800 placeholder-gray-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Optional contact */}
      <p className="text-xs text-gray-400 -mb-1">פרטי יצירת קשר (אופציונלי)</p>

      <div className="relative">
        <Phone size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t.yourPhone}
          dir="ltr"
          className="w-full ps-9 pe-4 py-3 rounded-xl border border-gray-200 bg-white
            text-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <div className="relative">
        <Mail size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="אימייל (אופציונלי)"
          dir="ltr"
          className="w-full ps-9 pe-4 py-3 rounded-xl border border-gray-200 bg-white
            text-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
          bg-indigo-600 text-white font-semibold text-sm
          hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-all shadow-md shadow-indigo-200"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {t.sending}
          </span>
        ) : (<><Send size={15} />{t.submitFeedback}</>)}
      </button>
    </form>
  )
}
