'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Payment = {
  id: string
  amount: string
  status: string
  description: string
  createdAt: string
  user?: { profile?: { name: string }; email?: string }
}

const LIMIT = 20

export default function TransactionsPage() {
  const [data, setData] = useState<{ list: Payment[]; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getTransactions({ page, limit: LIMIT, status: status || undefined }).then((res) => {
      if (res.success && res.data) {
        const d = res.data as { list: Payment[]; total: number }
        setData({
          list: Array.isArray(d.list) ? d.list : [],
          total: typeof d.total === 'number' ? d.total : 0,
        })
      } else {
        setData(null)
        setError(res.error || 'Gagal memuat transaksi')
      }
      setLoading(false)
    })
  }, [page, status])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaksi</h1>
      <p className="text-gray-500 text-sm mb-4">
        Riwayat pembayaran member, termasuk pembelian paket dan biaya pertemuan.
      </p>
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <select
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
          className="rounded border px-2 py-1.5 text-sm"
        >
          <option value="">Semua status</option>
          <option value="paid">Lunas</option>
          <option value="pending">Menunggu</option>
          <option value="failed">Gagal</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        {data != null && <span className="text-sm text-gray-500">Total: {data.total}</span>}
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {loading ? (
        <p className="text-gray-500">Memuat…</p>
      ) : data ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Jumlah</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {data.list.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Belum ada transaksi di periode ini. Jika database baru, jalankan seed data contoh di folder
                      backend (skrip demo).
                    </td>
                  </tr>
                ) : (
                  data.list.map((t) => (
                    <tr key={t.id} className="border-b border-gray-100">
                      <td className="px-4 py-3">{new Date(t.createdAt).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">{t.user?.profile?.name || t.user?.email || '-'}</td>
                      <td className="px-4 py-3">Rp {Number(t.amount).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">
                        <span className={t.status === 'paid' ? 'text-green-600' : 'text-amber-600'}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3">{t.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data.total > LIMIT && (
            <div className="mt-4 flex gap-2 items-center">
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
      ) : null}
    </div>
  )
}
