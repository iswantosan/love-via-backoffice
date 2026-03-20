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

const LIMIT = 15

export default function ReservationsPage() {
  const [list, setList] = useState<Meetup[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [copyId, setCopyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api
      .getMeetups({
        page,
        limit: LIMIT,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
      })
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data as { list: Meetup[]; total: number }
          setList(Array.isArray(d.list) ? d.list : [])
          setTotal(d.total ?? 0)
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [page, status, paymentStatus])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const copyLetter = async (meetupId: string) => {
    const res = await api.getReservationLetter(meetupId)
    if (res.success && res.data && (res.data as { letter?: string }).letter) {
      await navigator.clipboard.writeText((res.data as { letter: string }).letter)
      setCopyId(meetupId)
      setTimeout(() => setCopyId(null), 2000)
    }
  }

  const verifyMeet = async (meetupId: string, verified: boolean) => {
    const notes = window.prompt('Catatan admin (opsional):') || undefined
    const res = await api.verifyMeetup(meetupId, verified, notes)
    if (res.success) load()
    else alert(res.error || 'Gagal')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reservasi</h1>
      <p className="text-gray-500 text-sm mb-4">
        Daftar pertemuan yang dijadwalkan. Salin teks reservasi untuk dikirim ke restoran lewat WhatsApp atau kanal lain.
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
          <option value="">Semua status meet</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPage(1)
            setPaymentStatus(e.target.value)
          }}
          className="rounded border px-2 py-1.5 text-sm"
        >
          <option value="">Semua pembayaran</option>
          <option value="pending">payment pending</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
        </select>
        <span className="text-sm text-gray-500">Total: {total}</span>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Lokasi</th>
                  <th className="px-4 py-3 font-medium">Tanggal & Waktu</th>
                  <th className="px-4 py-3 font-medium">Pasangan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Admin</th>
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
                    <td className="px-4 py-3 space-y-1">
                      <button
                        type="button"
                        onClick={() => copyLetter(m.id)}
                        className="text-lovevia-blue font-medium block text-sm"
                      >
                        {copyId === m.id ? 'Tersalin!' : 'Copy letter WA'}
                      </button>
                      {m.status !== 'completed' && m.status !== 'cancelled' && (
                        <div className="flex flex-col gap-1 text-xs">
                          <button
                            type="button"
                            className="text-green-700 underline text-left"
                            onClick={() => verifyMeet(m.id, true)}
                          >
                            Verifikasi selesai
                          </button>
                          <button
                            type="button"
                            className="text-red-600 underline text-left"
                            onClick={() => verifyMeet(m.id, false)}
                          >
                            Batalkan meetup
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <p className="p-6 text-gray-500">Tidak ada meetup.</p>}
          </div>
          {total > LIMIT && (
            <div className="mt-4 flex gap-2 items-center">
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
