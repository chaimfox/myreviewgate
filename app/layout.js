import './globals.css'

export const metadata = {
  title: 'myReviewGate – ניהול חוות דעת חכם',
  description: 'הפוך כל לקוח למדרג מרוצה. myReviewGate מפנה ביקורות חיוביות לגוגל ושומר תלונות פרטיות.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he">
      <body>
        {/* Accessibility: skip navigation link */}
        <a href="#main-content" className="skip-link">
          דלג לתוכן הראשי
        </a>
        {children}
      </body>
    </html>
  )
}
