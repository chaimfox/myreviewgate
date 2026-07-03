'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ChevronDown, CheckCircle, TrendingUp, Shield, Zap, MessageSquare, BarChart2 } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SiteFooter from '@/components/SiteFooter'
import { useLang } from '@/hooks/useLang'
import { getLangMeta } from '@/lib/i18n'

/* ── Platform SVG logos ──────────────────────────────── */
function GoogleLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

function FacebookLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="24" fill="#1877F2"/>
      <path fill="white" d="M33 24h-6v18h-6V24h-4v-6h4v-3.5C21 10.9 23.2 9 27 9h4v6h-2.5c-1.4 0-1.5.6-1.5 1.5V18h5l-1 6z"/>
    </svg>
  )
}

function InstagramLogo({ size = 36 }) {
  // Clean centered Instagram logo — purple→pink→orange→yellow gradient
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="ig_new" cx="30%" cy="105%" r="130%">
          <stop offset="0%" stopColor="#ffd600"/>
          <stop offset="20%" stopColor="#ff7a00"/>
          <stop offset="45%" stopColor="#ff0069"/>
          <stop offset="70%" stopColor="#d300c5"/>
          <stop offset="100%" stopColor="#7638fa"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#ig_new)"/>
      {/* Outer rounded square white stroke */}
      <rect x="14" y="14" width="72" height="72" rx="18" fill="none" stroke="white" strokeWidth="6.5"/>
      {/* Lens ring */}
      <circle cx="50" cy="50" r="17" fill="none" stroke="white" strokeWidth="6.5"/>
      {/* Flash dot */}
      <circle cx="73" cy="27" r="5" fill="white"/>
    </svg>
  )
}

function WhatsAppLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="wa_g" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#57D163"/>
          <stop offset="100%" stopColor="#23A94B"/>
        </linearGradient>
      </defs>
      {/* White outer shape — speech bubble with tail */}
      <path fill="white" d="M50 2C23.5 2 2 23.5 2 50c0 8.5 2.2 16.5 6.1 23.4L2 98l25.4-6.6C33.8 95 41.7 97 50 97c26.5 0 48-21.5 48-48S76.5 2 50 2z"/>
      {/* Green speech bubble fill */}
      <path fill="url(#wa_g)" d="M50 10c-22.1 0-40 17.9-40 40 0 7.5 2.1 14.6 5.8 20.6L12 90l20.2-5.3C37.7 87.4 43.7 89 50 89c22.1 0 40-17.9 40-40S72.1 10 50 10z"/>
      {/* Phone handset — clean simple shape */}
      <path fill="white" d="
        M35 34c0-1.1.9-2 2-2h5.5c.9 0 1.7.6 1.9 1.5l2 8c.2.8-.1 1.7-.8 2.2l-3 2.1c2.3 5 6.5 9.2 11.5 11.5l2.1-3c.5-.7 1.4-1 2.2-.8l8 2c.9.2 1.5 1 1.5 1.9V63c0 1.1-.9 2-2 2-18.2 0-33-14.8-33-31z
      "/>
    </svg>
  )
}

function TripAdvisorLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="24" fill="#34E0A1"/>
      {/* Owl face - Tripadvisor style */}
      <g transform="translate(24,22)">
        {/* Left eye ring */}
        <circle cx="-8" cy="0" r="7.5" fill="black"/>
        <circle cx="-8" cy="0" r="5" fill="#34E0A1"/>
        <circle cx="-8" cy="0" r="3" fill="black"/>
        <circle cx="-6.5" cy="-1.5" r="1" fill="white"/>
        {/* Right eye ring */}
        <circle cx="8" cy="0" r="7.5" fill="black"/>
        <circle cx="8" cy="0" r="5" fill="#34E0A1"/>
        <circle cx="8" cy="0" r="3" fill="black"/>
        <circle cx="9.5" cy="-1.5" r="1" fill="white"/>
        {/* Top arch connecting eyes */}
        <path d="M-16,-2 Q-8,-14 0,-2 Q8,-14 16,-2" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Beak */}
        <path d="M-2,4 L0,7 L2,4 Z" fill="black"/>
      </g>
    </svg>
  )
}

/* ── Dashboard Mockup ──────────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 w-full">
      {/* RTL: sidebar on RIGHT, content on LEFT */}
      <div className="flex flex-row-reverse">
        {/* Sidebar — right side, hidden on mobile */}
        <div className="hidden md:block bg-slate-900 w-40 flex-shrink-0 p-3" dir="rtl">
          {/* Full logo */}
          <div className="flex items-center gap-2 px-2 py-2 mb-4">
            <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{background:'linear-gradient(135deg,#fbbf24 0%,#f59e0b 60%,#ea8f00 100%)'}}>
              <Star size={13} className="text-white fill-white" />
            </div>
            <span className="text-[11px] font-black whitespace-nowrap" style={{color:'#fff'}}>
              my<span style={{color:'#fbbf24'}}>ReviewGate</span>
            </span>
          </div>
          {[
            { label: 'דשבורד', active: true },
            { label: 'ביקורות', active: false },
            { label: 'הזמנות', active: false },
            { label: 'אנליטיקה', active: false },
            { label: 'דוחות', active: false },
            { label: 'הגדרות', active: false },
          ].map(item => (
            <div key={item.label}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-0.5 text-[10px] cursor-default ${item.active ? 'bg-amber-500 text-white' : 'text-slate-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.active ? 'bg-white' : 'bg-slate-600'}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 bg-white overflow-hidden" dir="ltr">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-black text-slate-900">Dashboard</span>
            <span className="text-[9px] text-slate-400 border border-slate-200 rounded-lg px-2 py-1">May 1 – May 31, 2024 ▾</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { l:'Total Reviews', v:'2,543', g:'+36%', stars:null },
              { l:'Average Rating', v:'4.6', g:'+0.3', stars:'★★★★★' },
              { l:'New Reviews', v:'127', g:'+12%', stars:null },
              { l:'Response Rate', v:'92%', g:'+8%', stars:null },
            ].map(s => (
              <div key={s.l} className="border border-slate-100 rounded-xl p-2 overflow-hidden">
                <p className="text-[7px] text-slate-400 mb-1 leading-tight">{s.l}</p>
                <p className="text-xs font-black text-slate-900 leading-tight">{s.v}</p>
                {s.stars && <p className="text-[8px] text-amber-400 leading-tight">{s.stars}</p>}
                <p className="text-[7px] font-bold text-emerald-500">▲ {s.g}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 border border-slate-100 rounded-xl p-3">
              <p className="text-[8px] font-bold text-slate-700 mb-2">Reviews Overview</p>
              <svg viewBox="0 0 160 55" className="w-full">
                {[55,41,28,14].map(y => (
                  <line key={y} x1="0" y1={y} x2="160" y2={y} stroke="#f1f5f9" strokeWidth="0.5"/>
                ))}
                <polyline points="0,45 32,35 64,40 96,20 128,25 160,10" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="0,50 32,38 64,28 96,35 128,12 160,20" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="0,52 32,47 64,42 96,45 128,32 160,28" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="0,48 32,44 64,47 96,38 128,36 160,33" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                {['May 1','May 8','May 15','May 22','May 31'].map((l,i) => (
                  <text key={l} x={i*40} y={65} fontSize="4.5" fill="#94a3b8">{l}</text>
                ))}
              </svg>
            </div>

            <div className="w-28 border border-slate-100 rounded-xl p-3">
              <p className="text-[8px] font-bold text-slate-700 mb-1">Reviews by Source</p>
              <svg viewBox="0 0 50 50" className="w-14 h-14 mx-auto mb-2">
                <circle cx="25" cy="25" r="18" fill="none" stroke="#f59e0b" strokeWidth="9" strokeDasharray="50.9 56.5" strokeDashoffset="-14" transform="rotate(-90 25 25)"/>
                <circle cx="25" cy="25" r="18" fill="none" stroke="#6366f1" strokeWidth="9" strokeDasharray="22.6 84.8" strokeDashoffset="-65" transform="rotate(-90 25 25)"/>
                <circle cx="25" cy="25" r="18" fill="none" stroke="#ec4899" strokeWidth="9" strokeDasharray="16.96 90.5" strokeDashoffset="-87.5" transform="rotate(-90 25 25)"/>
                <circle cx="25" cy="25" r="18" fill="none" stroke="#10b981" strokeWidth="9" strokeDasharray="11.3 96.1" strokeDashoffset="-104.5" transform="rotate(-90 25 25)"/>
              </svg>
              {[
                { l:'Google',      c:'bg-amber-400',  p:'45%' },
                { l:'Facebook',    c:'bg-indigo-500', p:'20%' },
                { l:'Instagram',   c:'bg-pink-500',   p:'15%' },
                { l:'WhatsApp',    c:'bg-emerald-500',p:'10%' },
                { l:'Tripadvisor', c:'bg-cyan-400',   p:'10%' },
              ].map(s => (
                <div key={s.l} className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.c}`} />
                    <span className="text-[6.5px] text-slate-500">{s.l}</span>
                  </div>
                  <span className="text-[6.5px] font-bold text-slate-600">{s.p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Reviews */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-black text-slate-700">Latest Reviews</span>
              <span className="text-[7px] text-indigo-500 font-bold">View All</span>
            </div>
            {[
              { name:'Alice Johnson',  platform:'google',    text:'Amazing service and great experience!',          time:'2 min ago' },
              { name:'Mark Thompson',  platform:'facebook',  text:'Very happy with the product. Highly recommend!', time:'15 min ago' },
              { name:'Sarah Williams', platform:'tripadvisor', text:'Love this place! Will come again.',              time:'1 hour ago' },
              { name:'David Brown',    platform:'whatsapp',  text:'Quick response and excellent support.',           time:'2 hours ago' },
            ].map((r,i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-slate-50 last:border-0">
                {/* Platform logo instead of letter */}
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {r.platform === 'google' && (
                    <svg viewBox="0 0 48 48" className="w-5 h-5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  )}
                  {r.platform === 'facebook' && (
                    <svg viewBox="0 0 48 48" className="w-5 h-5">
                      <circle cx="24" cy="24" r="24" fill="#1877F2"/>
                      <path fill="white" d="M33 24h-6v18h-6V24h-4v-6h4v-3.5C21 10.9 23.2 9 27 9h4v6h-2.5c-1.4 0-1.5.6-1.5 1.5V18h5l-1 6z"/>
                    </svg>
                  )}
                  {r.platform === 'tripadvisor' && (
                    <svg viewBox="0 0 100 100" className="w-5 h-5">
                      <circle cx="50" cy="50" r="50" fill="#34E0A1"/>
                      <circle cx="32" cy="52" r="13" fill="white"/>
                      <circle cx="68" cy="52" r="13" fill="white"/>
                      <circle cx="32" cy="52" r="7" fill="#000"/>
                      <circle cx="68" cy="52" r="7" fill="#000"/>
                      <circle cx="34" cy="50" r="2.5" fill="white"/>
                      <circle cx="70" cy="50" r="2.5" fill="white"/>
                      <path fill="white" d="M18 42 Q32 28 50 30 Q68 28 82 42 L75 42 Q65 34 50 35 Q35 34 25 42z"/>
                      <path fill="white" d="M38 68 Q50 74 62 68 L58 63 Q50 68 42 63z"/>
                    </svg>
                  )}
                  {r.platform === 'whatsapp' && (
                    <svg viewBox="0 0 100 100" className="w-5 h-5">
                      <path fill="white" d="M50 2C23.5 2 2 23.5 2 50c0 8.5 2.2 16.5 6.1 23.4L2 98l25.4-6.6C33.8 95 41.7 97 50 97c26.5 0 48-21.5 48-48S76.5 2 50 2z"/>
                      <path fill="#25D366" d="M50 10c-22.1 0-40 17.9-40 40 0 7.5 2.1 14.6 5.8 20.6L12 90l20.2-5.3C37.7 87.4 43.7 89 50 89c22.1 0 40-17.9 40-40S72.1 10 50 10z"/>
                      <path fill="white" d="M35 34c0-1.1.9-2 2-2h5.5c.9 0 1.7.6 1.9 1.5l2 8c.2.8-.1 1.7-.8 2.2l-3 2.1c2.3 5 6.5 9.2 11.5 11.5l2.1-3c.5-.7 1.4-1 2.2-.8l8 2c.9.2 1.5 1 1.5 1.9V63c0 1.1-.9 2-2 2-18.2 0-33-14.8-33-31z"/>
                    </svg>
                  )}
                </div>
                <span className="text-[7px] font-bold text-slate-700 w-16 flex-shrink-0 truncate">{r.name}</span>
                <span className="text-amber-400 text-[7px] flex-shrink-0">★★★★★</span>
                <span className="text-[7px] text-slate-400 flex-1 truncate">{r.text}</span>
                <span className="text-[6.5px] text-slate-300 flex-shrink-0 whitespace-nowrap">{r.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Platform Card ─────────────────────────────────────── */
function PlatformCard({ Logo, name, category, stars, dotColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 px-4 py-3 flex items-center gap-3 w-56 flex-shrink-0">
      <Logo size={36} />
      <div>
        <p className="font-black text-slate-900 text-sm">{name}</p>
        <p className="text-slate-400 text-xs">{category}</p>
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({length:5}).map((_,i) => (
            <span key={i} className={`text-xs ${i < stars ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Hero Visual — always LTR: cards → hub → dashboard ── */
function HeroVisual() {
  const platforms = [
    { Logo: GoogleLogo,      name:'Google',      category:'ביקורות', stars:5, dotColor:'#f59e0b' },
    { Logo: FacebookLogo,    name:'Facebook',    category:'ביקורות', stars:4, dotColor:'#6366f1' },
    { Logo: InstagramLogo,   name:'Instagram',   category:'ביקורות', stars:4, dotColor:'#ec4899' },
    { Logo: WhatsAppLogo,    name:'WhatsApp',    category:'פידבק',   stars:5, dotColor:'#10b981' },
    { Logo: TripAdvisorLogo, name:'Tripadvisor', category:'ביקורות', stars:4, dotColor:'#06b6d4' },
  ]

  const cardH  = 78
  const totalH = platforms.length * cardH - 8
  const hubY   = totalH / 2

  return (
    <div dir="ltr" className="w-full max-w-5xl mx-auto px-4 select-none">

      {/* ── MOBILE layout (hidden on md+) ── */}
      <div className="flex flex-col items-center gap-4 md:hidden">

        {/* Platform logos row */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {platforms.map(p => (
            <div key={p.name} className="bg-white rounded-2xl shadow-sm border border-slate-100 px-3 py-2 flex items-center gap-2">
              <p.Logo size={24} />
              <span className="text-xs font-bold text-slate-700">{p.name}</span>
            </div>
          ))}
        </div>

        {/* Arrow down + hub */}
        <div className="flex flex-col items-center gap-1">
          <svg width="2" height="20"><line x1="1" y1="0" x2="1" y2="20" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3"/></svg>
          <div className="rounded-2xl flex items-center justify-center shadow-lg border-2 border-white"
            style={{ width:56, height:56, background:'linear-gradient(135deg,#fbbf24 0%,#f59e0b 50%,#ea8f00 100%)', boxShadow:'0 6px 20px rgba(245,158,11,0.35)' }}>
            <Star size={24} className="text-white fill-white" />
          </div>
          <svg width="2" height="20"><line x1="1" y1="0" x2="1" y2="16" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3"/></svg>
          <svg width="10" height="6"><polygon points="0,0 10,0 5,6" fill="#94a3b8"/></svg>
        </div>

        {/* Dashboard — full width on mobile */}
        <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200">
          <DashboardMockup />
        </div>
      </div>

      {/* ── DESKTOP layout (hidden on mobile) ── */}
      <div className="hidden md:flex items-center justify-center gap-0">

        {/* LEFT: platform cards */}
        <div className="flex flex-col gap-2 flex-shrink-0 z-10">
          {platforms.map(p => <PlatformCard key={p.name} {...p} />)}
        </div>

        {/* CENTER: dotted lines → hub */}
        <div className="relative flex-shrink-0 z-10" style={{ width: 200, height: totalH }}>
          <svg width="200" height={totalH} viewBox={`0 0 200 ${totalH}`} className="absolute inset-0">
            {platforms.map((p, i) => {
              const cardY = i * cardH + cardH / 2 - 4
              const midX = 38
              return (
                <polyline key={p.name}
                  points={`0,${cardY} ${midX},${cardY} 64,${hubY}`}
                  fill="none" stroke={p.dotColor}
                  strokeWidth="1.5" strokeDasharray="5 4" strokeOpacity="0.9"
                  strokeLinejoin="round" strokeLinecap="round"/>
              )
            })}
            <line x1="136" y1={hubY} x2="188" y2={hubY} stroke="#0f172a" strokeWidth="1.5" strokeDasharray="4 3"/>
            <polygon points={`182,${hubY-4} 200,${hubY} 182,${hubY+4}`} fill="#0f172a"/>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white"
              style={{ width:72, height:72, background:'linear-gradient(135deg,#fbbf24 0%,#f59e0b 50%,#ea8f00 100%)', boxShadow:'0 8px 32px rgba(245,158,11,0.35)' }}>
              <Star size={32} className="text-white fill-white" />
            </div>
          </div>
        </div>

        {/* RIGHT: dashboard mockup */}
        <div className="flex-1 min-w-0 z-10">
          <DashboardMockup />
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────── */
export default function HomePage() {
  const { langCode, handleLangChange } = useLang()
  const meta = getLangMeta(langCode)
  const [scrolled, setScrolled]     = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const navLinks = [
    { label:'בית',          href:'#'         },
    { label:'יתרונות',      href:'#features' },
    { label:'איך זה עובד', href:'#how'      },
    { label:'תמחור',        href:'#pricing'  },
    { label:'צור קשר',     href:'/contact'  },
  ]

  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* ── NAV ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-slate-100' : 'bg-white/90 backdrop-blur'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          {/* Logo — exact brand logo, always LTR: text then icon */}
          <Link href="/" dir="ltr" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-black text-lg whitespace-nowrap" style={{color:'#0f172a'}}>
              my<span style={{color:'#f59e0b'}}>ReviewGate</span>
            </span>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
              style={{background:'linear-gradient(135deg,#fbbf24 0%,#f59e0b 50%,#ea8f00 100%)'}}>
              <Star size={16} className="text-white fill-white" />
            </div>
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
            {navLinks.map((l, i) => (
              <a key={l.label} href={l.href}
                className={`text-sm font-medium transition ${i === 0 ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-indigo-600'}`}>
                {l.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0 mr-auto">
            <LanguageSwitcher current={langCode} onChange={handleLangChange} />
            <Link href="/login"
              className="text-sm font-semibold text-slate-700 border border-slate-300 hover:border-indigo-400 hover:text-indigo-600 px-5 py-2 rounded-xl transition">
              כניסה
            </Link>
            <Link href="/register"
              className="text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl transition shadow-sm shadow-amber-200">
              התחל בחינם
            </Link>
          </div>

          {/* Mobile burger */}
          <button className="md:hidden mr-auto p-2 rounded-xl hover:bg-slate-100" onClick={() => setMobileMenu(m => !m)}>
            <ChevronDown size={20} className={`text-slate-600 transition-transform ${mobileMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-3">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileMenu(false)}
                className="text-sm text-slate-600 font-medium py-1">{l.label}</a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Link href="/login" className="flex-1 text-center text-sm font-semibold text-slate-700 py-2.5 rounded-xl border border-slate-200">כניסה</Link>
              <Link href="/register" className="flex-1 text-center text-sm font-bold bg-amber-500 text-white py-2.5 rounded-xl">התחל בחינם</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="pt-40 pb-20 px-4 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-tight mb-6">
            כל הביקורות שלך.<br />
            <span className="text-amber-500">דשבורד אחד חכם.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            אסוף, נהל וענה לביקורות מכל הפלטפורמות הגדולות — במקום אחד.
            <br className="hidden sm:block"/>
            חסוך זמן. שפר את המוניטין. צמח את העסק.
          </p>
        </div>

        <HeroVisual />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-slate-50" id="how">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-indigo-600 font-bold text-sm mb-3 uppercase tracking-widest">איך זה עובד</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">שלושה צעדים לביקורות יותר</h2>
          <p className="text-slate-500 mb-14 max-w-lg mx-auto">ההגדרה לוקחת דקות. התוצאות נמשכות לנצח.</p>
          <div className="grid md:grid-cols-3 gap-6 text-right">
            {[
              { n:'01', icon:'🏷️', t:'מניחים תג', d:'שמים תג NFC או QR על הדלפק. עובד עם כל סמארטפון, ללא הורדת אפליקציה.' },
              { n:'02', icon:'📱', t:'לקוח סורק', d:'כל לקוח בוחר בעצמו: לדרג בגוגל, או לשלוח לך הודעה פרטית שרק אתה רואה.' },
              { n:'03', icon:'📈', t:'הביקורות עולות', d:'הביקורות ב-Google מצטברות, וההודעות הפרטיות מחכות לך באותו דשבורד.' },
            ].map(s => (
              <div key={s.n} className="relative bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
                <div className="absolute top-6 left-6 text-slate-100 text-5xl font-black select-none">{s.n}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{s.t}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-bold text-sm mb-3 uppercase tracking-widest">יתרונות</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">כל מה שצריך לניהול מוניטין</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 text-right">
            {[
              { Icon: TrendingUp,    color:'bg-indigo-50 text-indigo-600',  t:'בחירה חופשית ללקוח', d:'כל לקוח בוחר בעצמו אם לדרג בגוגל או לשלוח לך פידבק פרטי.' },
              { Icon: BarChart2,     color:'bg-amber-50 text-amber-600',    t:'אנליטיקה בזמן אמת', d:'עקוב אחר סריקות, קליקים, דירוגים ומקורות ביקורות — הכל בדשבורד.' },
              { Icon: MessageSquare, color:'bg-emerald-50 text-emerald-600',t:'פידבק פרטי', d:'לקוח שרוצה לשתף הערה פרטית שולח לך הודעה ישירה — לא ביקורת ציבורית.' },
              { Icon: Zap,           color:'bg-violet-50 text-violet-600',  t:'הגדרה מהירה', d:'קבל את תג ה-NFC או QR בדקות. אין צורך בידע טכני.' },
              { Icon: Star,          color:'bg-rose-50 text-rose-600',      t:'ריבוי פלטפורמות', d:'גוגל, פייסבוק, אינסטגרם, וואטסאפ, טריפאדווייזור — נהל הכל ממקום אחד.' },
              { Icon: Shield,        color:'bg-slate-50 text-slate-600',    t:'מאובטח ופרטי', d:'הנתונים שלך מוצפנים לחלוטין. הודעות פרטיות נשארות רק בינך לבין הלקוח.' },
            ].map(f => (
              <div key={f.t} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.Icon size={20} />
                </div>
                <h3 className="font-black text-slate-900 mb-1.5">{f.t}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-6 bg-indigo-600">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { n:'500+', l:'עסקים פעילים' },
            { n:'50K+', l:'סריקות בחודש' },
            { n:'4.9',  l:'דירוג ממוצע'  },
            { n:'98%',  l:'שביעות רצון'  },
          ].map(s => (
            <div key={s.l}>
              <p className="text-4xl font-black mb-1 text-amber-400">{s.n}</p>
              <p className="text-indigo-200 text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-6 bg-slate-50" id="pricing">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-indigo-600 font-bold text-sm mb-3 uppercase tracking-widest">תמחור</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">פשוט ושקוף</h2>
          <p className="text-slate-500 mb-12">צור קשר לקבלת הצעת מחיר מותאמת לעסק שלך</p>
          <div className="grid md:grid-cols-2 gap-6 text-right">
            {[
              { name:'בסיסי',    price:'צור קשר', features:['קישור NFC/QR יחיד','דשבורד בסיסי','עד 100 סריקות לחודש','תמיכה במייל'],                                           highlight:false },
              { name:'מקצועי', price:'צור קשר', features:['קישורים מרובים','אנליטיקה מתקדמת','סריקות ללא הגבלה','קישורים מותאמים (וולט, אינסטגרם...)','תמיכה מועדפת'], highlight:true  },
            ].map(p => (
              <div key={p.name} className={`rounded-3xl p-8 border ${p.highlight ? 'bg-indigo-600 border-indigo-500' : 'bg-white border-slate-100 shadow-sm'}`}>
                <h3 className={`font-black text-xl mb-1 ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                <p className={`text-3xl font-black mb-6 ${p.highlight ? 'text-amber-300' : 'text-amber-500'}`}>{p.price}</p>
                <ul className="flex flex-col gap-2.5 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={15} className={p.highlight ? 'text-indigo-300' : 'text-emerald-500'} />
                      <span className={p.highlight ? 'text-indigo-100' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact"
                  className={`block text-center py-3 rounded-2xl font-bold text-sm transition ${
                    p.highlight ? 'bg-amber-400 hover:bg-amber-300 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}>
                  צור קשר
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-slate-900 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-1 mb-6">
            {[1,2,3,4,5].map(i => <Star key={i} size={24} className="fill-amber-400 text-amber-400" />)}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">מוכן להתחיל?</h2>
          <p className="text-slate-400 mb-10">הצטרף לעסקים שכבר מנהלים את המוניטין שלהם בחכמה.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register"
              className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-10 py-4 rounded-2xl transition shadow-lg shadow-amber-900/40">
              הרשם בחינם
            </Link>
            <Link href="/login"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-4 rounded-2xl transition border border-white/10">
              כניסה
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter dir="rtl" />
    </div>
  )
}
