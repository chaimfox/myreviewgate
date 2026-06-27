import CustomerReviewPage from './CustomerReviewPage'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

// Always fetch fresh — never serve stale store data from cache
export const dynamic = 'force-dynamic'

// Server-side fetch so slug resolution happens at request time
async function getStore(slug) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, logo_url, google_review_url, custom_links')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data
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

  if (!store) {
    notFound()
  }

  return <CustomerReviewPage store={store} />
}
