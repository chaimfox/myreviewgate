import './globals.css'

export const metadata = {
  verification: {
    google: 'hQ15G145tlT6WojhHJY6qGdTVFJ7jPL2BlzbZigHnuk',
  },
  title: 'myReviewGate – ניהול חוות דעת חכם',
  description: 'הפוך כל לקוח למדרג. myReviewGate נותן ללקוחות שלך לבחור בין ביקורת בגוגל להודעה פרטית אליך.',
  metadataBase: new URL('https://myreviewgate.com'),
  alternates: {
    canonical: 'https://myreviewgate.com',
  },
  openGraph: {
    title: 'myReviewGate – הפוך כל לקוח למדרג',
    description: 'שים NFC או QR על הדלפק. הלקוח בוחר: ביקורת בגוגל, או משוב פרטי אליך.',
    url: 'https://myreviewgate.com',
    siteName: 'myReviewGate',
    locale: 'he_IL',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'myReviewGate – הפוך כל לקוח למדרג',
    description: 'שים NFC או QR על הדלפק. הלקוח בוחר: ביקורת בגוגל, או משוב פרטי.',
    images: ['/opengraph-image'],
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'myReviewGate',
  url: 'https://myreviewgate.com',
  logo: 'https://myreviewgate.com/icon.svg',
  sameAs: ['https://myreviewgate.com'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="he">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Accessibility: skip navigation link */}
        <a href="#main-content" className="skip-link">
          דלג לתוכן הראשי
        </a>
        {children}
      </body>
    </html>
  )
}
