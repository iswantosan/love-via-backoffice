'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Feedback = { id: string; rating: number; comment?: string; createdAt: string; user?: { profile?: { name: string } }; meetup?: { date: string; location: string } }

export default function TestimonialsPage() {
  const [list, setList] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getFeedbacks().then((res) => {
      if (res.success && res.data) setList(Array.isArray(res.data) ? (res.data as Feedback[]) : [])
      setLoading(false)
    })
  }, [])

  const data = list
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Testimoni</h1>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="space-y-4">
          {data.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{f.user?.profile?.name || 'User'}</p>
                  <p className="text-amber-500 text-sm">Rating: {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</p>
                  {f.comment && <p className="text-gray-600 mt-2">{f.comment}</p>}
                </div>
                <span className="text-gray-400 text-sm">{new Date(f.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              {f.meetup && <p className="text-sm text-gray-500 mt-2">Meetup: {f.meetup.location} - {new Date(f.meetup.date).toLocaleDateString('id-ID')}</p>}
            </div>
          ))}
          {data.length === 0 && <p className="text-gray-500">Belum ada testimoni.</p>}
        </div>
      )}
    </div>
  )
}
