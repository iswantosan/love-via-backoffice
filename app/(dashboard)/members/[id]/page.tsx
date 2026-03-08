'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.getMember(id).then((res) => {
      if (res.success && res.data) setUser(res.data as Record<string, unknown>)
    })
  }, [id])

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setMessage('Password minimal 6 karakter')
      return
    }
    setResetting(true)
    const res = await api.resetMemberPassword(id, newPassword)
    setResetting(false)
    if (res.success) {
      setMessage('Password berhasil direset')
      setNewPassword('')
    } else {
      setMessage(res.error || 'Gagal reset password')
    }
  }

  if (!user) return <p className="text-gray-500">Loading...</p>

  const profile = (user.profile as Record<string, unknown>) || {}
  return (
    <div>
      <button onClick={() => router.back()} className="text-lovevia-blue mb-4">← Kembali</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Detail Member</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <dl className="grid grid-cols-2 gap-3">
          <dt className="text-gray-500">ID</dt><dd className="font-mono text-sm">{String(user.id)}</dd>
          <dt className="text-gray-500">Nama</dt><dd>{String(profile.name || '-')}</dd>
          <dt className="text-gray-500">Email</dt><dd>{String(user.email || '-')}</dd>
          <dt className="text-gray-500">Telepon</dt><dd>{String(user.phoneNumber || '-')}</dd>
          <dt className="text-gray-500">Verified</dt><dd>{user.isVerified ? 'Ya' : 'Tidak'}</dd>
        </dl>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-3">Reset Password Member</h2>
        {message && <p className={message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
        <form onSubmit={resetPassword} className="flex gap-2 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              className="rounded-lg border border-gray-300 px-3 py-2 w-64"
              placeholder="Min 6 karakter"
            />
          </div>
          <button type="submit" disabled={resetting} className="bg-amber-500 text-white rounded-lg px-4 py-2 disabled:opacity-50">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  )
}
