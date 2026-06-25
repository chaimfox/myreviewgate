import Link from 'next/link'
import { Star, QrCode, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react'

const FEATURES = [
  {
    icon: QrCode,
    title: 'One Scan, Two Outcomes',
    desc: 'Happy customers go straight to Google Reviews. Unhappy ones open a private form — only you see it.',
  },
  {
    icon: Star,
    title: 'Protect Your Rating',
    desc: 'Stop negative reviews before they go public. Resolve complaints privately and turn them around.',
  },
  {
    icon: MessageSquare,
    title: 'Real Customer Insights',
    desc: 'See every piece of private feedback in your dashboard with full customer details.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Star size={16} className="text-white fill-white" />
          </div>
          <span className="font-bold text-white text-lg">ReviewGate</span>
        </div>
        <Link
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
            px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          Sign in
        </Link>
      </nav>

      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20
          text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <CheckCircle size={12} />
          Smart Review Management
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
          Turn every scan into a <br />
          <span className="text-indigo-400">5-star moment</span>
        </h1>
        <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
          Place an NFC or QR tag on your counter. Happy customers get routed to Google.
          Unhappy ones give you private feedback so you can fix it fast.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500
            text-white font-bold text-base px-8 py-4 rounded-2xl transition
            shadow-2xl shadow-indigo-500/30"
        >
          Get started free
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 grid sm:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/40 flex items-center justify-center mb-4">
              <Icon size={20} className="text-indigo-300" />
            </div>
            <h3 className="text-white font-semibold mb-2">{title}</h3>
            <p className="text-indigo-200/70 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
