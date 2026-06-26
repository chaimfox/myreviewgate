import Link from 'next/link'
import Logo from '@/components/Logo'

export const metadata = {
  title: 'הצהרת נגישות – myReviewGate',
}

export default function AccessibilityPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f7f6f3]" dir="rtl">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <Link href="/"><Logo size="sm" /></Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 py-12 prose prose-slate">
        <h1 className="text-3xl font-black text-slate-900 mb-2">הצהרת נגישות</h1>
        <p className="text-slate-500 text-sm mb-8">עדכון אחרון: {new Date().getFullYear()}</p>

        <section className="card p-6 mb-6">
          <h2 className="text-xl font-black text-slate-800 mb-3">מחויבות לנגישות</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            myReviewGate מחויבת להנגשת שירותיה לכלל המשתמשים, לרבות אנשים עם מוגבלויות, בהתאם לתקן הישראלי
            <strong> IS 5568</strong> ולהנחיות הנגישות לתכני אינטרנט <strong>WCAG 2.1 ברמה AA</strong>.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-xl font-black text-slate-800 mb-3">רמת הנגישות</h2>
          <ul className="text-slate-600 text-sm leading-relaxed space-y-2 list-none p-0">
            {[
              'קישור "דלג לתוכן" בכל הדפים לניווט מהיר במקלדת',
              'תמיות alt לכל התמונות',
              'טקסט תיאורי (aria-label) על כל כפתורי הפעולה',
              'ניגודיות צבע עומדת בדרישות WCAG 2.1 AA',
              'ניווט מלא במקלדת בכל האתר',
              'סימון focus ברור על כל האלמנטים האינטראקטיביים',
              'תמיכה בכיוון RTL לעברית וערבית',
              'תמיכה ב-prefers-reduced-motion',
              'תגית lang נכונה בכל הדפים',
              'היררכיית כותרות (H1–H3) תקנית',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-xl font-black text-slate-800 mb-3">אמצעי עזר נתמכים</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            האתר נבדק עם קוראי מסך NVDA ו-VoiceOver, ועם ניווט מקלדת בלבד בדפדפני Chrome ו-Safari.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-xl font-black text-slate-800 mb-3">פנייה בנושא נגישות</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            אם נתקלת בבעיית נגישות או שיש לך הצעה לשיפור, אנא פנה אלינו:
          </p>
          <div className="mt-3 bg-slate-50 rounded-xl p-4 text-sm text-slate-700 border border-slate-100">
            <p><strong>אחראי נגישות:</strong> myReviewGate</p>
            <p className="mt-1"><strong>דוא"ל:</strong> <a href="mailto:accessibility@myreviewgate.com" className="text-amber-600 hover:underline">accessibility@myreviewgate.com</a></p>
          </div>
          <p className="text-slate-500 text-xs mt-3">נשיב לפנייתך תוך 5 ימי עסקים.</p>
        </section>
      </article>

      <footer className="text-center py-6 text-xs text-slate-400">
        © {new Date().getFullYear()} myReviewGate · כל הזכויות שמורות
      </footer>
    </main>
  )
}
