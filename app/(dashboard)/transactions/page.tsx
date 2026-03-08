'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Payment = { id: string; amount: string; status: string; description: string; createdAt: string; user?: { profile?: { name: string }; email?: string } }

export default function TransactionsPage() {
  const [data, setData] = useState<{ list: Payment[]; total: number } | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getTransactions({ page, limit: 20 }).then((res) => {
      if (res.success && res.data) setData(res.data as { list: Payment[]; total: number })
      setLoading(false)
    })
  }, [page])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaksi</h1>
      {loading ? <p className="text-gray-500">Loading...</p> : data && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Jumlah</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {data.list.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">{new Date(t.createdAt).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">{t.user?.profile?.name || t.user?.email || '-'}</td>
                    <td className="px-4 py-3">Rp {Number(t.amount).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3"><span className={t.status === 'paid' ? 'text-green-600' : 'text-amber-600'}>{t.status}</span></td>
                    <td className="px-4 py-3">{t.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.total > 20 && (
            <div className="mt-4 flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-3 py-1 disabled:opacity-50">Sebelumnya</button>
              <span className="py-1">Halaman {page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(data.total / 20)} className="rounded border px-3 py-1 disabled:opacity-50">Selanjutnya</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
