'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

type Prof = { name?: string; loveviaHandle?: string } | null
type Side = { id: string; profile?: Prof }
type MatchRow = {
  id: string
  matchScore: number
  engagementAt?: string | null
  engagementNote?: string | null
  marriedAt?: string | null
  marriedNote?: string | null
  isActive: boolean
  user?: Side
  matchedUser?: Side
}

const LIMIT = 15

export default function MatchesPage() {
  const [list, setList] = useState<MatchRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [activeOnly, setActiveOnly] = useState(true)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    engagementAt: '',
    engagementNote: '',
    marriedAt: '',
    marriedNote: '',
  })

  const load = () => {
    setLoading(true)
    api.getMatches({ page, limit: LIMIT, activeOnly }).then((res) => {
      if (res.success && res.data) {
        const d = res.data as { list: MatchRow[]; total: number }
        setList(Array.isArray(d.list) ? d.list : [])
        setTotal(d.total ?? 0)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
  }, [page, activeOnly])

  const openEdit = (m: MatchRow) => {
    setEditId(m.id)
    setForm({
      engagementAt: m.engagementAt ? m.engagementAt.slice(0, 10) : '',
      engagementNote: m.engagementNote || '',
      marriedAt: m.marriedAt ? m.marriedAt.slice(0, 10) : '',
      marriedNote: m.marriedNote || '',
    })
  }

  const save = async () => {
    if (!editId) return
    const body: Record<string, unknown> = {
      engagementAt: form.engagementAt || null,
      engagementNote: form.engagementNote || null,
      marriedAt: form.marriedAt || null,
      marriedNote: form.marriedNote || null,
    }
    const res = await api.updateMatch(editId, body)
    if (res.success) {
      setEditId(null)
      load()
    } else alert(res.error || 'Gagal simpan')
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Match</h1>
      <p className="text-gray-500 text-sm mb-4">
        Pasangan yang sudah saling cocok. Catat pertunangan atau pernikahan bila ingin layanan lanjutan ke depannya.
      </p>
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => {
              setPage(1)
              setActiveOnly(e.target.checked)
            }}
          />
          Hanya match aktif
        </label>
        <span className="text-sm text-gray-500">Total: {total}</span>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2">Member A</th>
                <th className="px-3 py-2">Member B</th>
                <th className="px-3 py-2">Skor</th>
                <th className="px-3 py-2">Tunangan</th>
                <th className="px-3 py-2">Menikah</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="px-3 py-2">
                    <div>{m.user?.profile?.loveviaHandle || m.user?.profile?.name || m.user?.id}</div>
                    <Link href={`/members/${m.user?.id}`} className="text-lovevia-blue text-xs">
                      Profil
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <div>{m.matchedUser?.profile?.loveviaHandle || m.matchedUser?.profile?.name || m.matchedUser?.id}</div>
                    <Link href={`/members/${m.matchedUser?.id}`} className="text-lovevia-blue text-xs">
                      Profil
                    </Link>
                  </td>
                  <td className="px-3 py-2">{m.matchScore?.toFixed?.(1) ?? m.matchScore}</td>
                  <td className="px-3 py-2">
                    {m.engagementAt ? new Date(m.engagementAt).toLocaleDateString('id-ID') : '—'}
                    {m.engagementNote ? <div className="text-xs text-gray-500 truncate max-w-[140px]">{m.engagementNote}</div> : null}
                  </td>
                  <td className="px-3 py-2">
                    {m.marriedAt ? new Date(m.marriedAt).toLocaleDateString('id-ID') : '—'}
                    {m.marriedNote ? <div className="text-xs text-gray-500 truncate max-w-[140px]">{m.marriedNote}</div> : null}
                  </td>
                  <td className="px-3 py-2">
                    <button type="button" className="text-lovevia-blue" onClick={() => openEdit(m)}>
                      Edit catatan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {total > LIMIT && (
            <div className="p-4 border-t flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
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
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      )}

      {editId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-semibold mb-4">Catatan hubungan</h3>
            <label className="block text-sm text-gray-600 mb-1">Tanggal pertunangan</label>
            <input
              type="date"
              className="border rounded-lg w-full px-3 py-2 mb-3"
              value={form.engagementAt}
              onChange={(e) => setForm((f) => ({ ...f, engagementAt: e.target.value }))}
            />
            <label className="block text-sm text-gray-600 mb-1">Keterangan pertunangan</label>
            <input
              className="border rounded-lg w-full px-3 py-2 mb-3"
              value={form.engagementNote}
              onChange={(e) => setForm((f) => ({ ...f, engagementNote: e.target.value }))}
            />
            <label className="block text-sm text-gray-600 mb-1">Married date</label>
            <input
              type="date"
              className="border rounded-lg w-full px-3 py-2 mb-3"
              value={form.marriedAt}
              onChange={(e) => setForm((f) => ({ ...f, marriedAt: e.target.value }))}
            />
            <label className="block text-sm text-gray-600 mb-1">Keterangan pernikahan</label>
            <input
              className="border rounded-lg w-full px-3 py-2 mb-4"
              value={form.marriedNote}
              onChange={(e) => setForm((f) => ({ ...f, marriedNote: e.target.value }))}
            />
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 rounded-lg border" onClick={() => setEditId(null)}>
                Batal
              </button>
              <button type="button" className="px-4 py-2 rounded-lg bg-lovevia-blue text-white" onClick={save}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
