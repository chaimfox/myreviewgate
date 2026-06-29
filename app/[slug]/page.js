import CustomerReviewPage from './CustomerReviewPage'
import SiteFooter from '@/components/SiteFooter'
import Logo from '@/components/Logo'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Always fetch fresh — never serve stale store data from cache
export const dynamic = 'force-dynamic'

const svc = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getStore(slug) {
  // First try store slug (existing behavior)
  const { data: store } = await svc()
    .from('stores')
    .select('id, name, logo_url, google_review_url, custom_links, status, nfc_scans')
    .eq('slug', slug)
    .single()

  if (store) return { ...store, _type: 'store' }

  // Then try location slug
  const { data: loc } = await svc()
    .from('locations')
    .select('id, name, slug, address, google_review_url, nfc_scans, store_id')
    .eq('slug', slug)
    .single()

  if (!loc) return null

  // Get parent store for logo + status + fallback google_review_url + custom_links
  const { data: parentStore } = await svc()
    .from('stores')
    .select('id, logo_url, google_review_url, custom_links, status')
    .eq('id', loc.store_id)
    .single()

  if (!parentStore) return null

  return {
    id: loc.id,
    _store_id: parentStore.id,
    _type: 'location',
    name: loc.name,
    logo_url: parentStore.logo_url,
    google_review_url: loc.google_review_url || parentStore.google_review_url,
    custom_links: parentStore.custom_links,
    status: parentStore.status,
    nfc_scans: loc.nfc_scans,
    address: loc.address,
  }
}

async function recordScan(entity) {
  if (entity._type === 'location') {
    await svc()
      .from('locations')
      .update({ nfc_scans: (entity.nfc_scans ?? 0) + 1 })
      .eq('id', entity.id)
  } else {
    await svc()
      .from('stores')
      .update({ nfc_scans: (entity.nfc_scans ?? 0) + 1 })
      .eq('id', entity.id)
  }
}

export async function generateMetadata({ params }) {
  const store = await getStore(params.slug)
  if (!store) return { title: 'myReviewGate' }

  const title = `${store.name} – דרג את החוויה שלך`
  const description = `איך היה הביקור שלך ב${store.name}? שתף אותנו בחוויה שלך.`

  return {
    title,
    description,
    metadataBase: new URL('https://myreviewgate.com'),
    openGraph: {
      title,
      description,
      url: `https://myreviewgate.com/${params.slug}`,
      siteName: 'myReviewGate',
      images: store.logo_url
        ? [{ url: store.logo_url, width: 800, height: 800, alt: store.name }]
        : [{ url: '/og-image.png', width: 1200, height: 630, alt: store.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: store.logo_url ? [store.logo_url] : ['/og-image.png'],
    },
  }
}

export default async function SlugPage({ params }) {
  const store = await getStore(params.slug)

  if (!store) notFound()

  // Count every visit as an NFC scan (fire-and-forget)
  recordScan(store).catch(() => {})

  // Suspended store — show blocked page
  if (store.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#f7f6f3] flex flex-col" dir="rtl">
        <header className="bg-white border-b-2 border-slate-900">
          <div className="max-w-3xl mx-auto px-5 py-4">
            <Link href="/"><Logo size="sm" /></Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">הדף אינו זמין כרגע</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              דף זה אינו פעיל כרגע.<br />לפרטים נוספים, צור קשר עם בעל העסק.
            </p>
          </div>
        </main>

        <SiteFooter />
      </div>
    )
  }

  return <CustomerReviewPage store={store} />
}
