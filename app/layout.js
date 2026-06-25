import './globals.css'

export const metadata = {
  title: 'ReviewGate – Smart Review Management',
  description: 'Turn every customer interaction into a 5-star review.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
