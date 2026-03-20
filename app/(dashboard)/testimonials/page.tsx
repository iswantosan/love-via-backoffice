'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Feedback = {
  id: string
  rating: number
  comment?: string
  createdAt: string
  user?: { profile?: { name: string } }
  meetup?: { date: string; location: string }
}

const LIMIT = 15

export default function TestimonialsPage() {
  const [list, setList] = useState<Feedback[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [minRating, setMinRating] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError(null)
    api
      .getFeedbacks({
        page,
        limit: LIMIT,
        minRating: minRating === '' ? undefined : minRating,
      })
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data as { list: Feedback[]; total: number }
          setList(Array.isArray(d.list) ? d.list : [])
          setTotal(d.total ?? 0)
        } else {
          setList([])
          setTotal(0)
          setError(res.error || 'Gagal memuat testimoni')
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [page, minRating])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Testimoni</h1>
      <p className="text-gray-500 text-sm mb-4">
        Ulasan dan penilaian bintang setelah member bertemu secara langsung.
      </p>
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <label className="text-sm text-gray-600 flex items-center gap-2">
          Minimal bintang:
          <select
            value={minRating === '' ? '' : String(minRating)}
            onChange={(e) => {
              setPage(1)
              setMinRating(e.target.value === '' ? '' : Number(e.target.value))
            }}
            className="rounded border px-2 py-1.5"
          >
            <option value="">Semua</option>
            <option value="5">5 ★</option>
            <option value="4">4+ ★</option>
            <option value="3">3+ ★</option>
            <option value="2">2+ ★</option>
            <option value="1">1+ ★</option>
          </select>
        </label>
        <span className="text-sm text-gray-500">Total: {total}</span>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {loading ? (
        <p className="text-gray-500">Memuat…</p>
      ) : (
        <>
          <div className="space-y-4">
            {list.length === 0 && !error ? (
              <p className="text-gray-500 py-8 text-center bg-white rounded-xl border border-gray-200">
                Belum ada testimoni. Data contoh bisa diisi lewat seed di backend.
              </p>
            ) : null}
            {list.map((f) => (
              <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{f.user?.profile?.name || 'User'}</p>
                    <p className="text-amber-500 text-sm">
                      Rating: {'★'.repeat(f.rating)}
                      {'☆'.repeat(5 - f.rating)}
                    </p>
                    {f.comment && <p className="text-gray-600 mt-2">{f.comment}</p>}
                  </div>
                  <span className="text-gray-400 text-sm">{new Date(f.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                {f.meetup && (
                  <p className="text-sm text-gray-500 mt-2">
                    Meetup: {f.meetup.location} — {new Date(f.meetup.date).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            ))}
          </div>
          {total > LIMIT && (
            <div className="mt-6 flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span className="text-sm">
                Halaman {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
