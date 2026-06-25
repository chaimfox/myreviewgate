import Link from 'next/link'
import { Star, QrCode, MessageSquare, TrendingUp, ArrowLeft, CheckCircle, BarChart2 } from 'lucide-react'
import Logo from '@/components/Logo'

const FEATURES = [
  {
    icon: QrCode,
    title: 'סריקה אחת, שתי תוצאות',
    desc: 'לקוח מרוצה עובר ישר לגוגל. לקוח לא מרוצה שולח משוב פרטי אליך — רק אתה רואה.',
    color: 'bg-amber-400',
  },
  {
    icon: Star,
    title: 'שמור על הדירוג שלך',
    desc: 'עצור ביקורות שליליות לפני שהן מתפרסמות. טפל בתלונות בצנעה והפוך אותן להזדמנות.',
    color: 'bg-emerald-500',
  },
  {
    icon: MessageSquare,
    title: 'תובנות אמיתיות מלקוחות',
    desc: 'ראה כל משוב פרטי בדשבורד שלך עם פרטי הלקוח ודירוג הכוכבים.',
    color: 'bg-slate-600',
  },
  {
    icon: BarChart2,
    title: 'אנליטיקה מפורטת',
    desc: 'עקוב אחר כניסות, לחיצות לגוגל ולינקים מותאמים — הכל בזמן אמת.',
    color: 'bg-orange-500',
  },
  {
    icon: TrendingUp,
    title: 'קישורים מותאמים אישית',
    desc: 'הוסף עד 5 קישורים לעסק שלך — אינסטגרם, וולט, פייסבוק ועוד.',
    color: 'bg-indigo-500',
  },
  {
    icon: CheckCircle,
    title: 'הפעלה בדקות',
    desc: 'הירשם, קבל קישור ייחודי, שים NFC או QR על הדלפק — זהו.',
    color: 'bg-rose-400',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f6f3]" dir="rtl">

      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm font-bold text-slate-600 hover:text-slate-900 transition px-4 py-2 rounded-xl hover:bg-white">
            כניסה
          </Link>
          <Link href="/register"
            className="btn-primary text-sm px-5 py-2.5">
            התחל בחינם <ArrowLeft size={15} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700
          text-xs font-bold px-4 py-1.5 rounded-full mb-8 border border-amber-200">
          <Star size={12} className="fill-amber-500 text-amber-500" />
          ניהול חוות דעת חכם לעסקים
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6">
          הפוך כל לקוח<br />
          <span className="text-amber-500">למדרג מרוצה</span>
        </h1>

        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          שים תג NFC או QR קוד על הדלפק שלך.
          לקוחות מרוצים עוברים ישר לגוגל.
          לקוחות לא מרוצים שולחים לך משוב פרטי.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400
              text-white font-black text-base px-8 py-4 rounded-2xl transition
              shadow-xl shadow-amber-200">
            התחל בחינם
            <ArrowLeft size={18} />
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-white border border-slate-200
              text-slate-700 font-bold text-base px-8 py-4 rounded-2xl transition hover:bg-slate-50">
            כניסה לחשבון
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" />ללא כרטיס אשראי</span>
          <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" />הפעלה בדקות</span>
          <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" />תמיכה בעברית</span>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-black text-slate-900 text-center mb-10">
          כל מה שצריך לניהול חוות דעת
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title}
              className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-black text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">מוכן להתחיל?</h2>
          <p className="text-slate-400 mb-8">הצטרף לעסקים שכבר מנהלים את המוניטין שלהם בחכמה.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400
              text-white font-black text-base px-8 py-4 rounded-2xl transition shadow-xl shadow-amber-900/30">
            הירשם עכשיו בחינם
            <ArrowLeft size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ReviewGate · כל הזכויות שמורות
      </footer>
    </main>
  )
}
