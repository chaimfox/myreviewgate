import CustomerReviewPage from './CustomerReviewPage'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

// Server-side fetch so slug resolution happens at request time
async function getStore(slug) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, logo_url, google_review_url')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }) {
  const store = await getStore(params.slug)
  return {
    title: store ? `Rate your experience at ${store.name}` : 'Store Not Found',
  }
}

export default async function SlugPage({ params }) {
  const store = await getStore(params.slug)

  if (!store) {
    notFound()
  }

  return <CustomerReviewPage store={store} />
}
