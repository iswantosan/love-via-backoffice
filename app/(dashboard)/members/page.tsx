'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

type Member = { id: string; email?: string; phoneNumber?: string; profile?: { name: string } }

export default function MembersPage() {
  const [list, setList] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.getMembers({ page, limit: 20, search: search || undefined }).then((res) => {
      if (res.success && res.data) {
        setList((res.data as { list: Member[] }).list)
        setTotal((res.data as { total: number }).total)
      }
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [page])
  const onSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load() }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Members</h1>
      <form onSubmit={onSearch} className="flex gap-2 mb-4">
        <input
          type="search"
          placeholder="Cari nama, email, telepon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 w-64"
        />
        <button type="submit" className="bg-lovevia-blue text-white rounded-lg px-4 py-2">Cari</button>
      </form>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Telepon</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="px-4 py-3">{u.profile?.name || '-'}</td>
                    <td className="px-4 py-3">{u.email || '-'}</td>
                    <td className="px-4 py-3">{u.phoneNumber || '-'}</td>
                    <td className="px-4 py-3">
                      <Link href={`/members/${u.id}`} className="text-lovevia-blue font-medium">Detail / Reset Password</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 20 && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border px-3 py-1 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span className="py-1">Halaman {page} / {Math.ceil(total / 20)}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="rounded-lg border px-3 py-1 disabled:opacity-50"
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
