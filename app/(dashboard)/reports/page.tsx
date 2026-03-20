'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Report = {
  id: string
  type: string
  description: string
  status: string
  adminNotes?: string
  createdAt: string
  targetUserId?: string | null
  user?: { id?: string; profile?: { name: string } }
  targetUser?: { id?: string; isSuspended?: boolean; profile?: { name: string } } | null
}

const LIMIT = 15

export default function ReportsPage() {
  const [list, setList] = useState<Report[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError(null)
    api
      .getReports({
        page,
        limit: LIMIT,
        status: status || undefined,
        type: type || undefined,
      })
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data as { list: Report[]; total: number }
          setList(Array.isArray(d.list) ? d.list : [])
          setTotal(d.total ?? 0)
        } else {
          setList([])
          setTotal(0)
          setError(res.error || 'Gagal memuat laporan')
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [page, status, type])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const updateStatus = async (id: string, newStatus: string, adminNotes?: string) => {
    const res = await api.updateReportStatus(id, { status: newStatus, adminNotes })
    if (res.success) load()
  }

  const suspendTarget = async (targetUserId: string) => {
    if (!confirm('Suspend akun user yang dilaporkan?')) return
    const reason = window.prompt('Alasan (opsional):') || 'Reported by member'
    const res = await api.updateMember(targetUserId, { isSuspended: true, suspendedReason: reason })
    if (!res.success) alert(res.error || 'Gagal')
    else load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan</h1>
      <p className="text-gray-500 text-sm mb-4">
        Laporan dari member tentang pengalaman atau perilaku yang mengganggu. Tinjau dan tindaklanjuti di sini.
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
          <option value="pending">Menunggu</option>
          <option value="reviewed">Sedang ditinjau</option>
          <option value="resolved">Selesai</option>
          <option value="dismissed">Ditutup</option>
        </select>
        <input
          type="search"
          placeholder="Filter tipe (mis. inappropriate_behavior)"
          value={type}
          onChange={(e) => {
            setPage(1)
            setType(e.target.value)
          }}
          className="rounded border px-3 py-1.5 text-sm w-64 max-w-full"
        />
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
                Belum ada laporan. Data contoh bisa diisi lewat seed di backend.
              </p>
            ) : null}
            {list.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Pelapor: {r.user?.profile?.name || r.user?.id || 'User'}</p>
                    {r.targetUser && (
                      <p className="text-sm text-amber-800 mt-1">
                        Dilaporkan: <strong>{r.targetUser.profile?.name || r.targetUser.id}</strong>
                        {r.targetUser.isSuspended ? ' (akun ditangguhkan)' : ''}
                      </p>
                    )}
                    {!r.targetUser && r.targetUserId && (
                      <p className="text-xs text-gray-500">Member terkait: {r.targetUserId}</p>
                    )}
                    <p className="text-gray-500 text-sm">Jenis: {r.type}</p>
                    <p className="text-gray-700 mt-2">{r.description}</p>
                    {r.adminNotes && <p className="text-sm text-amber-700 mt-2">Catatan admin: {r.adminNotes}</p>}
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      r.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">{new Date(r.createdAt).toLocaleString('id-ID')}</p>
                {(r.status === 'pending' || r.status === 'reviewed') && r.targetUser?.id && !r.targetUser.isSuspended && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => suspendTarget(r.targetUser!.id!)}
                      className="text-sm bg-red-100 text-red-800 rounded px-3 py-1"
                    >
                      Suspend user target
                    </button>
                  </div>
                )}
                {r.status === 'pending' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(r.id, 'reviewed')}
                      className="text-sm bg-gray-200 rounded px-3 py-1"
                    >
                      Reviewed
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(r.id, 'resolved')}
                      className="text-sm bg-green-200 rounded px-3 py-1"
                    >
                      Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(r.id, 'dismissed')}
                      className="text-sm bg-slate-200 rounded px-3 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
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
