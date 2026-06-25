import './globals.css'

export const metadata = {
  title: 'ReviewGate – ניהול חוות דעת חכם',
  description: 'הפוך כל לקוח למדרג מרוצה. ReviewGate מפנה ביקורות חיוביות לגוגל ושומר תלונות פרטיות.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he">
      <body>{children}</body>
    </html>
  )
}
