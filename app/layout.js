import './globals.css'

export const metadata = {
  title: 'myReviewGate – ניהול חוות דעת חכם',
  description: 'הפוך כל לקוח למדרג מרוצה. myReviewGate מפנה ביקורות חיוביות לגוגל ושומר תלונות פרטיות.',
  metadataBase: new URL('https://myreviewgate.com'),
  openGraph: {
    title: 'myReviewGate – הפוך כל לקוח למדרג מרוצה',
    description: 'שים NFC או QR על הדלפק. לקוחות מרוצים → גוגל. לקוחות לא מרוצים → משוב פרטי אליך.',
    url: 'https://myreviewgate.com',
    siteName: 'myReviewGate',
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'myReviewGate – הפוך כל לקוח למדרג מרוצה',
    description: 'שים NFC או QR על הדלפק. לקוחות מרוצים → גוגל. לקוחות לא מרוצים → משוב פרטי.',
    images: ['/opengraph-image'],
  },
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
