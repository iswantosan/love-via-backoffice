'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Criteria = { id: string; name: string; displayName: string; description?: string; isActive?: boolean; order: number; subcriteria: Array<{ id: string; name: string; displayName: string; order: number }> }

export default function CriteriaPage() {
  const [list, setList] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'criteria' | 'sub' | null>(null)
  const [selectedCriteriaId, setSelectedCriteriaId] = useState('')
  const [form, setForm] = useState({ displayName: '', name: '', description: '', order: 0 })

  const load = () => {
    api.getCriteria().then((res) => {
      if (res.success && res.data) setList(res.data as Criteria[])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  const openCriteria = () => { setModal('criteria'); setForm({ displayName: '', name: '', description: '', order: list.length }); setSelectedCriteriaId('') }
  const openSub = (criteriaId: string) => { setModal('sub'); setSelectedCriteriaId(criteriaId); setForm({ displayName: '', name: '', description: '', order: 0 }) }

  const submitCriteria = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api.createCriteria({ displayName: form.displayName, name: form.name, description: form.description, order: form.order })
    if (res.success) { setModal(null); load() }
  }
  const submitSub = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api.createSubcriteria({ criteriaId: selectedCriteriaId, displayName: form.displayName, name: form.name, order: form.order })
    if (res.success) { setModal(null); load() }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Data Master - Kriteria (Agama, Pendidikan, Suku, dll)</h1>
      <button onClick={openCriteria} className="mb-4 bg-lovevia-blue text-white rounded-lg px-4 py-2">+ Tambah Kriteria</button>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="space-y-4">
          {list.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">{c.displayName}</h2>
                <button onClick={() => openSub(c.id)} className="text-sm text-lovevia-blue">+ Sub</button>
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {c.subcriteria?.map((s) => (
                  <li key={s.id} className="bg-gray-100 rounded px-2 py-1 text-sm">{s.displayName}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {modal === 'criteria' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Tambah Kriteria</h3>
            <form onSubmit={submitCriteria}>
              <input placeholder="Display name" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2" required />
              <input placeholder="Name (slug)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border rounded px-3 py-2 mb-2" />
              <input placeholder="Order" type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="w-full border rounded px-3 py-2 mb-4" />
              <div className="flex gap-2">
                <button type="submit" className="bg-lovevia-blue text-white rounded px-4 py-2">Simpan</button>
                <button type="button" onClick={() => setModal(null)} className="border rounded px-4 py-2">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modal === 'sub' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Tambah Sub-kriteria</h3>
            <form onSubmit={submitSub}>
              <input placeholder="Display name" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} className="w-full border rounded px-3 py-2 mb-4" required />
              <div className="flex gap-2">
                <button type="submit" className="bg-lovevia-blue text-white rounded px-4 py-2">Simpan</button>
                <button type="button" onClick={() => setModal(null)} className="border rounded px-4 py-2">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
