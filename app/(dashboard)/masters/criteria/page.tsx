'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Sub = { id: string; name: string; displayName: string; order: number; isActive?: boolean }
type Criteria = {
  id: string
  name: string
  displayName: string
  description?: string
  isActive?: boolean
  order: number
  subcriteria: Sub[]
}

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
  useEffect(() => {
    load()
  }, [])

  const openCriteria = () => {
    setModal('criteria')
    setForm({ displayName: '', name: '', description: '', order: list.length })
    setSelectedCriteriaId('')
  }
  const openSub = (criteriaId: string) => {
    setModal('sub')
    setSelectedCriteriaId(criteriaId)
    setForm({ displayName: '', name: '', description: '', order: 0 })
  }

  const submitCriteria = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api.createCriteria({
      displayName: form.displayName,
      name: form.name,
      description: form.description,
      order: form.order,
    })
    if (res.success) {
      setModal(null)
      load()
    } else alert(res.error || 'Gagal menyimpan kriteria')
  }
  const submitSub = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await api.createSubcriteria({
      criteriaId: selectedCriteriaId,
      displayName: form.displayName,
      name: form.name,
      order: form.order,
    })
    if (res.success) {
      setModal(null)
      load()
    } else alert(res.error || 'Gagal menyimpan sub-kriteria')
  }

  const deleteCriteria = async (id: string, label: string) => {
    if (!confirm(`Hapus kriteria "${label}" beserta semua sub-kriterianya?`)) return
    const res = await api.deleteCriteria(id)
    if (res.success) load()
    else alert(res.error || 'Gagal hapus (mungkin masih dipakai preferensi user)')
  }

  const deleteSub = async (id: string, label: string) => {
    if (!confirm(`Hapus sub-kriteria "${label}"?`)) return
    const res = await api.deleteSubcriteria(id)
    if (res.success) load()
    else alert(res.error || 'Gagal hapus')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Master Kriteria</h1>
      <p className="text-gray-500 text-sm mb-6">Agama, pendidikan, suku, pekerjaan, minat, dll.</p>
      <button onClick={openCriteria} className="mb-4 bg-lovevia-blue text-white rounded-lg px-4 py-2">
        + Tambah kriteria
      </button>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h2 className="font-semibold">{c.displayName}</h2>
                  <p className="text-xs text-gray-400 font-mono">{c.name}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => openSub(c.id)} className="text-sm text-lovevia-blue">
                    + Sub
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCriteria(c.id, c.displayName)}
                    className="text-sm text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {c.subcriteria?.map((s) => (
                  <li
                    key={s.id}
                    className="bg-gray-100 rounded px-2 py-1 text-sm flex items-center gap-2"
                  >
                    <span>{s.displayName}</span>
                    <button
                      type="button"
                      onClick={() => deleteSub(s.id, s.displayName)}
                      className="text-red-600 text-xs font-medium"
                      title="Hapus sub-kriteria"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {modal === 'criteria' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Tambah kriteria</h3>
            <form onSubmit={submitCriteria}>
              <input
                placeholder="Display name"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className="w-full border rounded px-3 py-2 mb-2"
                required
              />
              <input
                placeholder="Name (slug)"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border rounded px-3 py-2 mb-2"
              />
              <input
                placeholder="Order"
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                className="w-full border rounded px-3 py-2 mb-4"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-lovevia-blue text-white rounded px-4 py-2">
                  Simpan
                </button>
                <button type="button" onClick={() => setModal(null)} className="border rounded px-4 py-2">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {modal === 'sub' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Tambah sub-kriteria</h3>
            <form onSubmit={submitSub}>
              <input
                placeholder="Display name"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className="w-full border rounded px-3 py-2 mb-4"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-lovevia-blue text-white rounded px-4 py-2">
                  Simpan
                </button>
                <button type="button" onClick={() => setModal(null)} className="border rounded px-4 py-2">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
