'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Pkg = {
  id: string
  name: string
  description: string
  price: string | number
  matchLimit: number
  duration: number
  isActive: boolean
}

export default function PackagesPage() {
  const [list, setList] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', price: '', matchLimit: '5', duration: '30' })
  const [msg, setMsg] = useState('')

  const load = () => {
    api.getPackages().then((res) => {
      if (res.success && res.data) setList(res.data as Pkg[])
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const res = await api.createPackage({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      matchLimit: Number(form.matchLimit),
      duration: Number(form.duration),
    })
    if (res.success) {
      setForm({ name: '', description: '', price: '', matchLimit: '5', duration: '30' })
      load()
      setMsg('Paket ditambahkan.')
    } else setMsg(res.error || 'Gagal')
  }

  const toggle = async (p: Pkg) => {
    const res = await api.updatePackage(p.id, { isActive: !p.isActive })
    if (res.success) load()
  }

  const softDelete = async (id: string) => {
    if (!confirm('Hapus paket dari katalog? (dinonaktifkan, data lama tetap aman)')) return
    const res = await api.deletePackage(id)
    if (res.success) load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Paket</h1>
      <p className="text-gray-500 text-sm mb-6">Atur harga dan kuota paket yang ditawarkan ke member di aplikasi.</p>

      <form onSubmit={create} className="bg-white rounded-xl border p-4 mb-8 grid gap-3 max-w-xl">
        <h2 className="font-semibold">Tambah paket</h2>
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Nama"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <textarea
          className="border rounded-lg px-3 py-2"
          placeholder="Deskripsi"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
        />
        <div className="flex gap-2">
          <input
            className="border rounded-lg px-3 py-2 flex-1"
            placeholder="Harga (IDR)"
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <input
            className="border rounded-lg px-3 py-2 w-28"
            placeholder="Limit match"
            type="number"
            value={form.matchLimit}
            onChange={(e) => setForm((f) => ({ ...f, matchLimit: e.target.value }))}
          />
          <input
            className="border rounded-lg px-3 py-2 w-28"
            placeholder="Hari"
            type="number"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
          />
        </div>
        <button type="submit" className="bg-lovevia-blue text-white rounded-lg py-2">
          Simpan
        </button>
        {msg && <p className="text-sm text-green-600">{msg}</p>}
      </form>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Harga</th>
                <th className="px-4 py-2">Limit / Hari</th>
                <th className="px-4 py-2">Aktif</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2">{String(p.price)}</td>
                  <td className="px-4 py-2">
                    {p.matchLimit} / {p.duration}d
                  </td>
                  <td className="px-4 py-2">{p.isActive ? 'Ya' : 'Tidak'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button type="button" className="text-lovevia-blue" onClick={() => toggle(p)}>
                      {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button type="button" className="text-red-600" onClick={() => softDelete(p.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
