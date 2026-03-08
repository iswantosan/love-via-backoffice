'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (newPassword !== confirmPassword) {
      setMessage('Password baru dan konfirmasi tidak sama')
      return
    }
    if (newPassword.length < 6) {
      setMessage('Password baru minimal 6 karakter')
      return
    }
    setLoading(true)
    const res = await api.changePassword(currentPassword, newPassword)
    setLoading(false)
    if (res.success) {
      setMessage('Password berhasil diubah')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setMessage(res.error || 'Gagal mengubah password')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ganti Password</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
        {message && <p className={message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password saat ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi password baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="bg-lovevia-blue text-white rounded-lg px-4 py-2 disabled:opacity-50">
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  )
}
