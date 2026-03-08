'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Meetup = {
  id: string
  location: string
  date: string
  time: string
  status: string
  paymentStatus: string
  inviter?: { profile?: { name: string } }
  invitee?: { profile?: { name: string } }
}

export default function ReservationsPage() {
  const [list, setList] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [copyId, setCopyId] = useState<string | null>(null)

  useEffect(() => {
    api.getMeetups().then((res) => {
      if (res.success && res.data) setList(Array.isArray(res.data) ? (res.data as Meetup[]) : [])
      setLoading(false)
    })
  }, [])

  const copyLetter = async (meetupId: string) => {
    const res = await api.getReservationLetter(meetupId)
    if (res.success && res.data?.letter) {
      await navigator.clipboard.writeText(res.data.letter)
      setCopyId(meetupId)
      setTimeout(() => setCopyId(null), 2000)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reservasi (Mail Merge)</h1>
      <p className="text-gray-500 text-sm mb-6">Copy letter untuk kirim ke admin restaurant via WhatsApp.</p>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Lokasi</th>
                <th className="px-4 py-3 font-medium">Tanggal & Waktu</th>
                <th className="px-4 py-3 font-medium">Inviter / Invitee</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{m.location}</td>
                  <td className="px-4 py-3">
                    {new Date(m.date).toLocaleDateString('id-ID')} {m.time}
                  </td>
                  <td className="px-4 py-3">
                    {m.inviter?.profile?.name} / {m.invitee?.profile?.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">{m.status}</span>
                    {m.paymentStatus && <span className="ml-2 text-amber-600">({m.paymentStatus})</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyLetter(m.id)}
                      className="text-lovevia-blue font-medium"
                    >
                      {copyId === m.id ? 'Tersalin!' : 'Copy letter WA'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-6 text-gray-500">Belum ada meetup.</p>}
        </div>
      )}
    </div>
  )
}
