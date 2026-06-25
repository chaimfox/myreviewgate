import { Store } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-5">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Store size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
        <p className="text-gray-500 text-sm max-w-xs">
          We couldn't find a store at this link. It may have moved or the URL is incorrect.
        </p>
        <Link href="/" className="mt-2 text-sm text-indigo-600 hover:underline">
          Go home
        </Link>
      </div>
    </main>
  )
}
