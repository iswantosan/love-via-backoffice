'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const [data, setData] = useState<{
    usersCount?: number
    meetupsCount?: number
    paymentsCount?: number
    paymentsTotal?: number
    feedbacksCount?: number
    reportsPending?: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard().then((res) => {
      if (res.success && res.data) setData(res.data as typeof data)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="text-gray-500">Loading...</p>
  if (!data) return <p className="text-red-600">Gagal memuat dashboard</p>

  const cards = [
    { label: 'Total Members', value: data.usersCount ?? 0, color: 'bg-blue-500' },
    { label: 'Total Meetup', value: data.meetupsCount ?? 0, color: 'bg-green-500' },
    { label: 'Transaksi Berhasil', value: data.paymentsCount ?? 0, color: 'bg-amber-500' },
    { label: 'Total Revenue (paid)', value: `Rp ${(data.paymentsTotal ?? 0).toLocaleString('id-ID')}`, color: 'bg-emerald-600' },
    { label: 'Testimoni', value: data.feedbacksCount ?? 0, color: 'bg-purple-500' },
    { label: 'Reports Pending', value: data.reportsPending ?? 0, color: 'bg-red-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} text-white rounded-xl p-5 shadow`}
          >
            <p className="text-white/90 text-sm font-medium">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
