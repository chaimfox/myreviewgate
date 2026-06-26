'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Star, QrCode, MessageSquare, TrendingUp, ArrowLeft,
  CheckCircle, BarChart2, Shield, Zap, Users, ThumbsUp,
} from 'lucide-react'
import Logo from '@/components/Logo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { getLang, getLangMeta } from '@/lib/i18n'

const DEFAULT_LANG = 'he'

const FEATURE_ICONS = [
  { icon: QrCode,        color: 'bg-amber-400'   },
  { icon: Star,          color: 'bg-emerald-500'  },
  { icon: MessageSquare, color: 'bg-slate-600'    },
  { icon: BarChart2,     color: 'bg-orange-500'   },
  { icon: TrendingUp,    color: 'bg-indigo-500'   },
  { icon: CheckCircle,   color: 'bg-rose-400'     },
]

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
    { t: 'Liens personnalisés',         d: "Ajoutez jusqu'à 5 liens — Instagram, Wolt, Facebook et plus." },
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

/* ─── Mini mockup shown in hero ───────────────────────────────── */
function HeroMockup({ dir }) {
  return (
    <div className="relative mx-auto w-full max-w-xs" aria-hidden="true">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-amber-400 to-orange-500 flex items-end px-5 pb-3">
          <span className="text-white font-black text-sm">קפה הבוקר ☕</span>
        </div>
        {/* Content */}
        <div className="p-5 text-center" dir="rtl">
          <p className="text-xs font-bold text-slate-500 mb-1">איך היה הביקור שלך?</p>
          <div className="flex justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => (
              <svg key={i} viewBox="0 0 24 24" className="w-6 h-6 fill-amber-400 text-amber-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-2.5 px-3 text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
              <span>⭐</span> דירוג בגוגל
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-600 flex items-center justify-center gap-2">
              <span>💬</span> משוב פרטי
            </div>
          </div>
        </div>
      </div>
      {/* Floating badge */}
      <div className="absolute -top-3 -end-3 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
        +24 ביקורות
      </div>
      <div className="absolute -bottom-3 -start-3 bg-white border border-slate-100 shadow-lg rounded-2xl px-3 py-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
          <ThumbsUp size={12} className="text-amber-600" />
        </div>
        <span className="text-xs font-bold text-slate-700">משוב חדש</span>
      </div>
    </div>
  )
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
  const features = featureText[langCode] ?? featureText.he

  return (
    <div className="min-h-screen bg-[#f7f6f3]" dir={langMeta.dir} lang={langCode}>
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>

      {/* ── Sticky Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-900 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between gap-3">
          <Logo size="md" />
          <nav className="flex items-center gap-2 sm:gap-3" role="navigation" aria-label="ניווט ראשי">
            <LanguageSwitcher current={langCode} onChange={handleLangChange} />
            <Link href="/login"
              className="hidden sm:block text-sm font-bold text-slate-600 hover:text-slate-900 transition px-3 py-2 rounded-xl hover:bg-slate-50">
              {h.login}
            </Link>
            <Link href="/register"
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white font-black text-sm px-4 py-2.5 rounded-xl transition shadow-sm shadow-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2">
              {h.cta}
              <ArrowLeft size={14} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-amber-50 to-[#f7f6f3] pt-16 pb-20 px-5" aria-labelledby="hero-heading">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Left / text side */}
            <div className="order-2 lg:order-1 text-center lg:text-start">
              {/* Stars badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-amber-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <div className="flex gap-0.5" aria-label="דירוג 5 כוכבים">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">{h.badge}</span>
              </div>

              <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-5">
                {h.h1a}<br />
                <span className="text-amber-500">{h.h1b}</span>
              </h1>

              <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                {h.sub}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
                <Link href="/register"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-base px-8 py-4 rounded-2xl transition shadow-xl shadow-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2">
                  {h.cta}
                  <ArrowLeft size={18} aria-hidden="true" />
                </Link>
                <Link href="/login"
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold text-base px-8 py-4 rounded-2xl transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
                  {h.login}
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-slate-400">
                {[h.p1, h.p2, h.p3].map((p) => (
                  <span key={p} className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500" aria-hidden="true" />
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Right / mockup side */}
            <div className="order-1 lg:order-2 flex justify-center">
              <HeroMockup dir={langMeta.dir} />
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────────────── */}
        <section className="bg-white py-20 px-5" aria-labelledby="how-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="how-heading" className="text-3xl font-black text-slate-900 text-center mb-14">
              {h.howTitle}
            </h2>
            <div className="grid sm:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop) */}
              <div className="hidden sm:block absolute top-10 start-1/3 end-1/3 h-0.5 bg-amber-200 -translate-y-1/2" aria-hidden="true" />
              {[
                { n: '01', t: h.how1t, d: h.how1d, icon: QrCode },
                { n: '02', t: h.how2t, d: h.how2d, icon: Users },
                { n: '03', t: h.how3t, d: h.how3d, icon: ThumbsUp },
              ].map(({ n, t: title, d: desc, icon: Icon }) => (
                <div key={n} className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                      <Icon size={32} className="text-amber-500" aria-hidden="true" />
                    </div>
                    <span className="absolute -top-3 -end-3 bg-slate-900 text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center" aria-hidden="true">
                      {n}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20 px-5" aria-labelledby="features-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="features-heading" className="text-3xl font-black text-slate-900 text-center mb-12">
              {h.featuresTitle}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ t: title, d: desc }, i) => {
                const { icon: Icon, color } = FEATURE_ICONS[i]
                return (
                  <div key={title}
                    className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`} aria-hidden="true">
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="font-black text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <section className="bg-amber-500 py-16 px-5" aria-labelledby="stats-heading">
          <div className="max-w-4xl mx-auto">
            <h2 id="stats-heading" className="text-2xl font-black text-white text-center mb-10 opacity-90">
              {h.statsTitle}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { n: h.s1n, l: h.s1l },
                { n: h.s2n, l: h.s2l },
                { n: h.s3n, l: h.s3l },
                { n: h.s4n, l: h.s4l },
              ].map(({ n, l }) => (
                <div key={l} className="text-center">
                  <p className="text-4xl font-black text-white mb-1">{n}</p>
                  <p className="text-amber-100 text-sm font-medium">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Band ───────────────────────────────────────────────── */}
        <section className="bg-slate-900 py-20 px-5" aria-labelledby="cta-heading">
          <div className="max-w-2xl mx-auto text-center">
            <h2 id="cta-heading" className="text-4xl font-black text-white mb-4">{h.ctaBand}</h2>
            <p className="text-slate-400 mb-8 text-lg">{h.ctaSub}</p>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black text-lg px-10 py-5 rounded-2xl transition shadow-xl shadow-amber-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
              {h.ctaBtn}
              <ArrowLeft size={20} aria-hidden="true" />
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 border-t border-white/5 py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="sm" theme="dark" />
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400" aria-label="קישורי תחתית">
            <Link href="/privacy" className="hover:text-slate-200 transition">{h.footerPrivacy}</Link>
            <Link href="/terms"   className="hover:text-slate-200 transition">{h.footerTerms}</Link>
            <Link href="/accessibility" className="hover:text-slate-200 transition">הצהרת נגישות</Link>
            <Link href="/contact" className="hover:text-slate-200 transition">{h.footerContact}</Link>
          </nav>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} myReviewGate</p>
        </div>
      </footer>
    </div>
  )
}
