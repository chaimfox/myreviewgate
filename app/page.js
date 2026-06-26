'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, QrCode, MessageSquare, TrendingUp, ArrowLeft, CheckCircle, BarChart2 } from 'lucide-react'
import Logo from '@/components/Logo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { getLang, getLangMeta } from '@/lib/i18n'

const DEFAULT_LANG = 'he'

const FEATURES = [
  { icon: QrCode,        titleKey: 'f1t', descKey: 'f1d', color: 'bg-amber-400'  },
  { icon: Star,          titleKey: 'f2t', descKey: 'f2d', color: 'bg-emerald-500'},
  { icon: MessageSquare, titleKey: 'f3t', descKey: 'f3d', color: 'bg-slate-600'  },
  { icon: BarChart2,     titleKey: 'f4t', descKey: 'f4d', color: 'bg-orange-500' },
  { icon: TrendingUp,    titleKey: 'f5t', descKey: 'f5d', color: 'bg-indigo-500' },
  { icon: CheckCircle,   titleKey: 'f6t', descKey: 'f6d', color: 'bg-rose-400'   },
]

/* Feature text per language */
const featureText = {
  he: [
    { t: 'סריקה אחת, שתי תוצאות',     d: 'לקוח מרוצה עובר ישר לגוגל. לקוח לא מרוצה שולח משוב פרטי אליך — רק אתה רואה.' },
    { t: 'שמור על הדירוג שלך',         d: 'עצור ביקורות שליליות לפני שהן מתפרסמות. טפל בתלונות בצנעה.' },
    { t: 'תובנות אמיתיות מלקוחות',    d: 'ראה כל משוב פרטי בדשבורד שלך עם פרטי הלקוח ודירוג הכוכבים.' },
    { t: 'אנליטיקה מפורטת',           d: 'עקוב אחר כניסות, לחיצות לגוגל ולינקים מותאמים — הכל בזמן אמת.' },
    { t: 'קישורים מותאמים אישית',     d: 'הוסף עד 5 קישורים לעסק שלך — אינסטגרם, וולט, פייסבוק ועוד.' },
    { t: 'הפעלה בדקות',               d: 'הירשם, קבל קישור ייחודי, שים NFC או QR על הדלפק — זהו.' },
  ],
  en: [
    { t: 'One Scan, Two Outcomes',      d: 'Happy customers go straight to Google. Unhappy ones send you private feedback — only you see it.' },
    { t: 'Protect Your Rating',         d: 'Stop negative reviews before they go public. Resolve complaints privately.' },
    { t: 'Real Customer Insights',      d: 'See every private message in your dashboard with customer details and star rating.' },
    { t: 'Detailed Analytics',          d: 'Track visits, Google clicks and custom link clicks — all in real time.' },
    { t: 'Custom Links',                d: 'Add up to 5 links — Instagram, Wolt, Facebook and more.' },
    { t: 'Up in Minutes',               d: 'Register, get your unique link, place NFC or QR on the counter — done.' },
  ],
  ar: [
    { t: 'مسح واحد، نتيجتان',          d: 'العملاء السعداء يذهبون إلى جوجل. غير الراضين يرسلون لك ملاحظات خاصة.' },
    { t: 'احمِ تقييمك',                d: 'أوقف التقييمات السلبية قبل نشرها. تعامل مع الشكاوى بشكل خاص.' },
    { t: 'رؤى حقيقية من العملاء',      d: 'اطّلع على كل ملاحظة خاصة في لوحتك مع تفاصيل العميل.' },
    { t: 'تحليلات مفصّلة',             d: 'تتبّع الزيارات والنقرات — كل شيء في الوقت الفعلي.' },
    { t: 'روابط مخصصة',               d: 'أضف حتى 5 روابط — إنستغرام، ووكل، فيسبوك والمزيد.' },
    { t: 'جاهز في دقائق',              d: 'سجّل، احصل على رابطك، ضع NFC أو QR على المنضدة — انتهينا.' },
  ],
  fr: [
    { t: 'Un scan, deux résultats',     d: 'Les clients satisfaits vont sur Google. Les autres vous envoient un avis privé.' },
    { t: 'Protégez votre note',         d: 'Stoppez les avis négatifs avant publication. Traitez les plaintes en privé.' },
    { t: 'Vrais insights clients',      d: 'Consultez chaque avis privé dans votre tableau de bord.' },
    { t: 'Analytique détaillée',        d: 'Suivez les visites et les clics en temps réel.' },
    { t: 'Liens personnalisés',         d: 'Ajoutez jusqu\'à 5 liens — Instagram, Wolt, Facebook et plus.' },
    { t: 'Opérationnel en minutes',     d: 'Inscrivez-vous, obtenez votre lien unique, placez le NFC ou QR.' },
  ],
  ru: [
    { t: 'Один скан, два результата',   d: 'Довольные клиенты идут на Google. Недовольные отправляют вам личный отзыв.' },
    { t: 'Защитите свой рейтинг',      d: 'Остановите негативные отзывы до публикации. Решайте жалобы приватно.' },
    { t: 'Реальные данные о клиентах', d: 'Видите каждый приватный отзыв в личном кабинете.' },
    { t: 'Подробная аналитика',        d: 'Отслеживайте посещения и клики в реальном времени.' },
    { t: 'Пользовательские ссылки',    d: 'Добавьте до 5 ссылок — Instagram, Wolt, Facebook и другие.' },
    { t: 'Готово за минуты',           d: 'Зарегистрируйтесь, получите ссылку, разместите NFC или QR.' },
  ],
}

export default function HomePage() {
  const [langCode, setLangCode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('rg-lang') || DEFAULT_LANG
    return DEFAULT_LANG
  })

  function handleLangChange(code) {
    setLangCode(code)
    if (typeof window !== 'undefined') localStorage.setItem('rg-lang', code)
  }

  const t = getLang(langCode)
  const h = t.home
  const langMeta = getLangMeta(langCode)
  const features = featureText[langCode] ?? featureText['he']

  return (
    <main id="main-content" className="min-h-screen bg-[#f7f6f3]" dir={langMeta.dir} lang={langCode}>

      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between" role="navigation" aria-label="ניווט ראשי">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <LanguageSwitcher current={langCode} onChange={handleLangChange} />
          <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition px-4 py-2 rounded-xl hover:bg-white">
            {h.login}
          </Link>
          <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
            {h.cta} <ArrowLeft size={15} aria-hidden="true" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center" aria-labelledby="hero-heading">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700
          text-xs font-bold px-4 py-1.5 rounded-full mb-8 border border-amber-200">
          <Star size={12} className="fill-amber-500 text-amber-500" aria-hidden="true" />
          {h.badge}
        </div>

        <h1 id="hero-heading" className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6">
          {h.h1a}<br />
          <span className="text-amber-500">{h.h1b}</span>
        </h1>

        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          {h.sub}
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400
              text-white font-black text-base px-8 py-4 rounded-2xl transition
              shadow-xl shadow-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2">
            {h.cta}
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-white border border-slate-200
              text-slate-700 font-bold text-base px-8 py-4 rounded-2xl transition hover:bg-slate-50
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
            {h.login}
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-400 flex-wrap">
          {[h.p1, h.p2, h.p3].map((p) => (
            <span key={p} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" aria-hidden="true" />
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl font-black text-slate-900 text-center mb-10">
          {h.featuresTitle}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ t: title, d: desc }, i) => {
            const Icon = FEATURES[i].icon
            return (
              <div key={title}
                className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className={`w-10 h-10 rounded-xl ${FEATURES[i].color} flex items-center justify-center mb-4`} aria-hidden="true">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-slate-900 py-16" aria-labelledby="cta-heading">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 id="cta-heading" className="text-3xl font-black text-white mb-4">{h.ctaBand}</h2>
          <p className="text-slate-400 mb-8">{h.ctaSub}</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400
              text-white font-black text-base px-8 py-4 rounded-2xl transition shadow-xl shadow-amber-900/30
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
            {h.ctaBtn}
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} myReviewGate · כל הזכויות שמורות
        {' · '}
        <Link href="/accessibility" className="hover:text-slate-300 transition underline">
          הצהרת נגישות
        </Link>
      </footer>
    </main>
  )
}
