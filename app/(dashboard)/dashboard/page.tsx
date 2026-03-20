'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

type SeriesRow = {
  date: string
  transaksiLunas: number
  pendapatan: number
  testimoni: number
  laporan: number
  reservasi: number
  memberBaru: number
}

type DashboardData = {
  range: { from: string; to: string; capped: boolean }
  usersCount: number
  meetupsCount: number
  paymentsCount: number
  paymentsTotal: number
  feedbacksCount: number
  reportsTotal: number
  reportsPending: number
  paymentStatusBreakdown: Array<{ status: string; count: number }>
  series: SeriesRow[]
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  paid: 'Lunas',
  pending: 'Menunggu',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
}

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#64748b', '#8b5cf6', '#0ea5e9']

function ymdLocal(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function shiftDays(fromYmd: string, days: number) {
  const [y, m, d] = fromYmd.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return ymdLocal(dt)
}

const rp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function DashboardPage() {
  const initial = useMemo(() => {
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - 29)
    return { from: ymdLocal(from), to: ymdLocal(to) }
  }, [])
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api.getDashboard({ from, to }).then((res) => {
      if (res.success && res.data) setData(res.data as DashboardData)
      else setData(null)
      setLoading(false)
    })
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

  const chartData = useMemo(
    () =>
      (data?.series ?? []).map((row) => ({
        ...row,
        label: new Date(row.date + 'T12:00:00').toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
        }),
      })),
    [data?.series]
  )

  if (loading && !data) return <p className="text-gray-500">Memuat…</p>
  if (!data) return <p className="text-red-600">Gagal memuat dashboard</p>

  const piePaymentData = (data.paymentStatusBreakdown ?? [])
    .filter((x) => x.count > 0)
    .map((x) => ({
      name: PAYMENT_STATUS_LABEL[x.status] ?? x.status,
      value: x.count,
    }))

  const cards = [
    { label: 'Member baru (periode)', value: data.usersCount, color: 'bg-blue-500' },
    { label: 'Reservasi baru (periode)', value: data.meetupsCount, color: 'bg-green-500' },
    { label: 'Transaksi lunas (periode)', value: data.paymentsCount, color: 'bg-amber-500' },
    { label: 'Pendapatan lunas (periode)', value: rp(data.paymentsTotal), color: 'bg-emerald-600' },
    { label: 'Testimoni (periode)', value: data.feedbacksCount, color: 'bg-purple-500' },
    { label: 'Laporan (periode)', value: data.reportsTotal, color: 'bg-slate-600' },
    { label: 'Laporan menunggu (periode)', value: data.reportsPending, color: 'bg-red-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>

      <div className="flex flex-wrap items-end gap-3 mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="bg-lovevia-blue text-white rounded-lg px-4 py-2 text-sm font-medium"
        >
          Terapkan
        </button>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-gray-400 self-center mr-1">Cepat:</span>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            onClick={() => {
              const t = ymdLocal(new Date())
              setFrom(shiftDays(t, -6))
              setTo(t)
            }}
          >
            7 hari
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            onClick={() => {
              const t = ymdLocal(new Date())
              setFrom(shiftDays(t, -29))
              setTo(t)
            }}
          >
            30 hari
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            onClick={() => {
              const t = ymdLocal(new Date())
              setFrom(shiftDays(t, -89))
              setTo(t)
            }}
          >
            90 hari
          </button>
        </div>
      </div>

      {data.range.capped && (
        <p className="text-amber-800 text-sm mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Rentang dibatasi maksimal 366 hari. Tanggal akhir disesuaikan.
        </p>
      )}

      <p className="text-gray-500 text-sm mb-4">
        Ringkasan berdasarkan tanggal transaksi / aktivitas (UTC). Rentang API:{' '}
        <strong>
          {data.range.from} — {data.range.to}
        </strong>
        .
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} text-white rounded-xl p-5 shadow`}>
            <p className="text-white/90 text-sm font-medium">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-1">Pendapatan & transaksi lunas</h2>
          <p className="text-gray-500 text-sm mb-4">Per hari dalam rentang yang dipilih</p>
          <div className="h-[320px] w-full min-h-[280px]">
            {loading ? (
              <p className="text-gray-400 text-sm">Memuat grafik…</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}jt` : `${(v / 1e3).toFixed(0)}rb`)}
                  />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'pendapatan' ? rp(value) : value
                    }
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.date
                        ? new Date(payload[0].payload.date + 'T12:00:00').toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''
                    }
                  />
                  <Legend />
                  <Bar yAxisId="right" dataKey="transaksiLunas" name="Transaksi lunas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="pendapatan"
                    name="Pendapatan"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-1">Testimoni, laporan & reservasi</h2>
          <p className="text-gray-500 text-sm mb-4">Jumlah per hari</p>
          <div className="h-[320px] w-full min-h-[280px]">
            {loading ? (
              <p className="text-gray-400 text-sm">Memuat grafik…</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.date
                        ? new Date(payload[0].payload.date + 'T12:00:00').toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''
                    }
                  />
                  <Legend />
                  <Bar dataKey="testimoni" name="Testimoni" stackId="a" fill="#a855f7" />
                  <Bar dataKey="laporan" name="Laporan" stackId="a" fill="#ef4444" />
                  <Bar dataKey="reservasi" name="Reservasi" stackId="a" fill="#22c55e" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-1">Transaksi menurut status</h2>
          <p className="text-gray-500 text-sm mb-4">Semua transaksi di rentang tanggal (bukan hanya lunas)</p>
          <div className="h-[300px] w-full min-h-[260px]">
            {loading ? (
              <p className="text-gray-400 text-sm">Memuat grafik…</p>
            ) : piePaymentData.length === 0 ? (
              <p className="text-gray-500 text-sm py-12 text-center">Tidak ada transaksi di periode ini.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={piePaymentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {piePaymentData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} transaksi`, 'Jumlah']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-1">Member baru</h2>
          <p className="text-gray-500 text-sm mb-4">Registrasi per hari</p>
          <div className="h-[300px] w-full min-h-[260px]">
            {loading ? (
              <p className="text-gray-400 text-sm">Memuat grafik…</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.date
                        ? new Date(payload[0].payload.date + 'T12:00:00').toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''
                    }
                  />
                  <Bar dataKey="memberBaru" name="Member baru" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
