'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Report = { id: string; type: string; description: string; status: string; adminNotes?: string; createdAt: string; user?: { profile?: { name: string } } }

export default function ReportsPage() {
  const [list, setList] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReports().then((res) => {
      if (res.success && res.data) setList(Array.isArray(res.data) ? (res.data as Report[]) : [])
      setLoading(false)
    })
  }, [])

  const data = list

  const updateStatus = async (id: string, status: string, adminNotes?: string) => {
    const res = await api.updateReportStatus(id, { status, adminNotes })
    if (res.success) {
      setList((prev) => prev.map((r) => (r.id === id ? { ...r, status, adminNotes } : r)))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports (Issue dari Member)</h1>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="space-y-4">
          {data.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{r.user?.profile?.name || 'User'}</p>
                  <p className="text-gray-500 text-sm">Tipe: {r.type}</p>
                  <p className="text-gray-700 mt-2">{r.description}</p>
                  {r.adminNotes && <p className="text-sm text-amber-700 mt-2">Catatan admin: {r.adminNotes}</p>}
                </div>
                <span className={`text-sm px-2 py-1 rounded ${r.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">{new Date(r.createdAt).toLocaleString('id-ID')}</p>
              {r.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => updateStatus(r.id, 'reviewed')} className="text-sm bg-gray-200 rounded px-3 py-1">Tandai Reviewed</button>
                  <button onClick={() => updateStatus(r.id, 'resolved')} className="text-sm bg-green-200 rounded px-3 py-1">Resolved</button>
                </div>
              )}
            </div>
          ))}
          {data.length === 0 && <p className="text-gray-500">Belum ada report.</p>}
        </div>
      )}
    </div>
  )
}
