import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'myReviewGate – ניהול חוות דעת חכם'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background pattern dots */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          display: 'flex',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
        }} />

        {/* Logo icon */}
        <div style={{
          width: '100px', height: '100px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #ea8f00)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          boxShadow: '0 20px 60px rgba(245,158,11,0.4)',
        }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="white">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </div>

        {/* Brand name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '56px', fontWeight: 900, color: '#ffffff' }}>my</span>
          <span style={{ fontSize: '56px', fontWeight: 900, color: '#f59e0b' }}>ReviewGate</span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: '26px',
          color: 'rgba(255,255,255,0.65)',
          textAlign: 'center',
          maxWidth: '700px',
          lineHeight: 1.4,
        }}>
          הפוך כל לקוח למדרג מרוצה
        </div>

        {/* Platform pills */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '40px',
        }}>
          {['Google', 'Facebook', 'Instagram', 'WhatsApp', 'Tripadvisor'].map((name) => (
            <div key={name} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '100px',
              padding: '8px 20px',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
            }}>
              {name}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute',
          bottom: '36px',
          fontSize: '18px',
          color: 'rgba(255,255,255,0.3)',
        }}>
          myreviewgate.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
