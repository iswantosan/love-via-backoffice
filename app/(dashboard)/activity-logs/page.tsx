'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Log = { id: string; type: string; entityType?: string; entityId?: string; payload?: string; ip?: string; createdAt: string }

export default function ActivityLogsPage() {
  const [data, setData] = useState<{ list: Log[]; total: number } | null>(null)
  const [page, setPage] = useState(1)
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getActivityLogs({ page, limit: 30, type: type || undefined }).then((res) => {
      if (res.success && res.data) setData(res.data as { list: Log[]; total: number })
      setLoading(false)
    })
  }, [page, type])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat aktivitas</h1>
      <p className="text-gray-500 text-sm mb-6">Login, OTP, email, notifikasi, dan tindakan admin tercatat di sini.</p>
      <div className="mb-4 flex gap-2">
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} className="rounded border px-3 py-2">
          <option value="">Semua tipe</option>
          <option value="otp">OTP</option>
          <option value="email">Email</option>
          <option value="notification">Notification</option>
          <option value="login">Login (user)</option>
          <option value="admin_login">Admin login</option>
          <option value="admin_member_update">Admin update member</option>
          <option value="password_reset">Password reset</option>
        </select>
      </div>
      {loading ? <p className="text-gray-500">Loading...</p> : data && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">Tipe</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Payload</th>
                </tr>
              </thead>
              <tbody>
                {data.list.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100">
                    <td className="px-4 py-2">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2">{log.type}</td>
                    <td className="px-4 py-2">{log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}</td>
                    <td className="px-4 py-2">{log.ip || '-'}</td>
                    <td className="px-4 py-2 max-w-xs truncate">{log.payload || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.total > 30 && (
            <div className="mt-4 flex gap-2 items-center">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-3 py-1 disabled:opacity-50">Sebelumnya</button>
              <span className="text-sm">Halaman {page} / {Math.max(1, Math.ceil(data.total / 30))}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(data.total / 30)} className="rounded border px-3 py-1 disabled:opacity-50">Selanjutnya</button>
              <span className="text-sm text-gray-500 ml-2">Total {data.total}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
