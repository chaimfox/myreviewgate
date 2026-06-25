import { Star, MessageSquare, QrCode } from 'lucide-react'

function Card({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function StatsCards({ feedback }) {
  const total = feedback.length
  const avg = total > 0
    ? (feedback.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : '–'
  const complaints = feedback.filter((r) => r.rating <= 3).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card icon={QrCode} label="סה״כ סריקות" value={total} color="bg-indigo-500" />
      <Card icon={Star} label="דירוג ממוצע" value={avg} color="bg-amber-400" />
      <Card icon={MessageSquare} label="תלונות פרטיות" value={complaints} color="bg-rose-500" />
    </div>
  )
}
