'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Admin = { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string }

export default function AdminsPage() {
  const [list, setList] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' })

  const load = () => {
    api.getAdmins().then((res) => {
      if (res.success && res.data) setList(Array.isArray(res.data) ? (res.data as Admin[]) : [])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api.createAdmin({ name: form.name, email: form.email, password: form.password, role: form.role })
    if (res.success) { setModal(false); setForm({ name: '', email: '', password: '', role: 'admin' }); load() }
  }

  const data = list
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin</h1>
      <button onClick={() => setModal(true)} className="mb-4 bg-lovevia-blue text-white rounded-lg px-4 py-2">+ Tambah Admin</button>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{a.email}</td>
                  <td className="px-4 py-3">{a.role}</td>
                  <td className="px-4 py-3">{a.isActive ? 'Aktif' : 'Nonaktif'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Tambah Admin</h3>
            <form onSubmit={submit}>
              <input placeholder="Nama" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2" required />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2" required />
              <input type="password" placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2" required minLength={6} />
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full border rounded px-3 py-2 mb-4">
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
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
