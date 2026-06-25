'use client'

import { Star } from 'lucide-react'

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FeedbackTable({ rows, showStore = false }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
        <p className="text-lg font-medium">אין משוב עדיין</p>
        <p className="text-sm mt-1">תלונות פרטיות מלקוחות יופיעו כאן.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm text-right">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-500 whitespace-nowrap">תאריך</th>
            {showStore && <th className="px-4 py-3 font-semibold text-gray-500">חנות</th>}
            <th className="px-4 py-3 font-semibold text-gray-500">דירוג</th>
            <th className="px-4 py-3 font-semibold text-gray-500">הערה</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 bg-white">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 text-gray-500 whitespace-nowrap text-xs">{formatDate(row.created_at)}</td>
              {showStore && (
                <td className="px-4 py-4">
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-medium">
                    {row.stores?.name ?? '—'}
                  </span>
                </td>
              )}
              <td className="px-4 py-4"><StarDisplay rating={row.rating} /></td>
              <td className="px-4 py-4 text-gray-700 max-w-xs">
                <p className="line-clamp-2 text-sm">{row.comment}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
