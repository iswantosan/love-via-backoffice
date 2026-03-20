'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Location = { id: string; name: string; address: string; city: string; type: string; description?: string; isActive: boolean }

export default function LocationsPage() {
  const [list, setList] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', city: '', type: 'restaurant', description: '' })

  const load = () => {
    api.getLocations().then((res) => {
      if (res.success && res.data) setList(res.data as Location[])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api.createLocation(form)
    if (res.success) { setModal(false); setForm({ name: '', address: '', city: '', type: 'restaurant', description: '' }); load() }
  }

  const remove = async (id: string, name: string) => {
    if (!confirm(`Hapus tempat "${name}" dari master data?`)) return
    const res = await api.deleteLocation(id)
    if (res.success) load()
    else alert(res.error || 'Gagal hapus')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Master Tempat Meet</h1>
      <p className="text-gray-500 text-sm mb-6">Restaurant, café, dan venue kencan lainnya.</p>
      <button onClick={() => setModal(true)} className="mb-4 bg-lovevia-blue text-white rounded-lg px-4 py-2">+ Tambah Tempat</button>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Alamat</th>
                <th className="px-4 py-3 font-medium">Kota</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((loc) => (
                <tr key={loc.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{loc.name}</td>
                  <td className="px-4 py-3">{loc.address}</td>
                  <td className="px-4 py-3">{loc.city}</td>
                  <td className="px-4 py-3">{loc.type}</td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-red-600 text-sm" onClick={() => remove(loc.id, loc.name)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Tambah Tempat Meet</h3>
            <form onSubmit={submit}>
              <input placeholder="Nama tempat" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2" required />
              <input placeholder="Alamat" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2" />
              <input placeholder="Kota" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2" />
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2">
                <option value="restaurant">Restaurant</option>
                <option value="cafe">Cafe</option>
                <option value="mall">Mall</option>
                <option value="park">Park</option>
              </select>
              <textarea placeholder="Deskripsi" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border rounded px-3 py-2 mb-4" />
              <div className="flex gap-2">
                <button type="submit" className="bg-lovevia-blue text-white rounded px-4 py-2">Simpan</button>
                <button type="button" onClick={() => setModal(false)} className="border rounded px-4 py-2">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
