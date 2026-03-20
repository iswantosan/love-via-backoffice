'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function JsonBlock({ label, raw }: { label: string; raw: string | null | undefined }) {
  if (raw == null || raw === '') return null
  let obj: unknown
  try {
    obj = JSON.parse(raw)
  } catch {
    obj = raw
  }
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{label}</h3>
      <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs overflow-auto max-h-56">{JSON.stringify(obj, null, 2)}</pre>
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <>
      <dt className="text-gray-500 text-sm py-1">{k}</dt>
      <dd className="text-sm py-1 break-words">{v ?? '—'}</dd>
    </>
  )
}

function photoSrc(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')
  const [adminMsg, setAdminMsg] = useState('')

  const load = () => {
    api.getMember(id).then((res) => {
      if (res.success && res.data) setUser(res.data as Record<string, unknown>)
    })
  }

  useEffect(() => {
    load()
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

  const patchMember = async (body: Record<string, unknown>) => {
    setAdminMsg('')
    const res = await api.updateMember(id, body)
    if (res.success) {
      setAdminMsg('Perubahan disimpan.')
      load()
    } else {
      setAdminMsg(res.error || 'Gagal menyimpan')
    }
  }

  if (!user) return <p className="text-gray-500">Loading...</p>

  const profile = (user.profile as Record<string, unknown>) || {}
  const expectedMatch = user.expectedMatch as Record<string, unknown> | null | undefined
  const photos = (user.photos as Array<{ id: string; photoUrl: string; isMain: boolean }>) || []
  const prefs = (user.matchPreferences as Array<{ criteria?: { displayName?: string }; subcriteria?: { displayName?: string } }>) || []

  return (
    <div className="space-y-6 max-w-5xl">
      <button type="button" onClick={() => router.back()} className="text-lovevia-blue">
        ← Kembali
      </button>
      <h1 className="text-2xl font-bold text-gray-900">Detail member</h1>

      {adminMsg && (
        <p className={`text-sm ${adminMsg.includes('Gagal') ? 'text-red-600' : 'text-green-600'}`}>{adminMsg}</p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-lg mb-3">Akun & verifikasi</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Row k="User ID" v={<span className="font-mono text-xs">{String(user.id)}</span>} />
          <Row k="LoveVIA handle" v={String(profile.loveviaHandle || '—')} />
          <Row k="Public #" v={profile.loveviaPublicNumber != null ? String(profile.loveviaPublicNumber) : '—'} />
          <Row k="Email" v={String(user.email || '—')} />
          <Row k="Telepon" v={String(user.phoneNumber || '—')} />
          <Row k="Akun verified" v={user.isVerified ? 'Ya' : 'Tidak'} />
          <Row k="Face verified" v={user.faceVerified ? 'Ya' : 'Tidak'} />
          <Row k="Suspended" v={user.isSuspended ? `Ya — ${String(user.suspendedReason || '')}` : 'Tidak'} />
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-lovevia-blue text-white px-3 py-1.5 text-sm"
            onClick={() => patchMember({ isVerified: !user.isVerified })}
          >
            Toggle verified
          </button>
          <button
            type="button"
            className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-sm"
            onClick={() => patchMember({ faceVerified: !user.faceVerified })}
          >
            Toggle face verified
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm"
            onClick={() => {
              const reason = window.prompt('Alasan suspend (opsional):') || ''
              patchMember({ isSuspended: true, suspendedReason: reason })
            }}
          >
            Suspend akun
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            onClick={() => patchMember({ isSuspended: false, suspendedReason: null })}
          >
            Unsuspend
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-lg mb-3">Data pribadi (profil)</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Row k="Nama lengkap" v={String(profile.name || '—')} />
          <Row k="Gender (profil)" v={String(profile.sex || '—')} />
          <Row k="Tempat & tanggal lahir" v={`${profile.placeOfBirth || ''} / ${profile.dateOfBirth ? new Date(String(profile.dateOfBirth)).toLocaleDateString('id-ID') : ''}`} />
          <Row k="Alamat" v={String(profile.currentAddress || '—')} />
          <Row k="Belief" v={String(profile.religion || '—')} />
          <Row k="Ethnicity" v={String(profile.ethnic || '—')} />
          <Row k="Pitch" v={String(profile.pitch || '—')} />
          <Row k="Hobbies / interests (raw)" v={String(profile.interests || '—')} />
          <Row k="Difabel: Tuna rungu" v={profile.isDeaf ? 'Ya' : 'Tidak'} />
          <Row k="Difabel: Tuna wicara" v={profile.isMute ? 'Ya' : 'Tidak'} />
          <Row k="Difabel: Tuna netra" v={profile.isBlind ? 'Ya' : 'Tidak'} />
        </dl>
      </div>

      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
        <h2 className="font-semibold text-lg mb-2 text-amber-900">Hanya admin (verifikasi)</h2>
        <p className="text-sm text-amber-800 mb-3">Social media, BFF, rekan kerja — untuk cek keaslian profil.</p>
        <JsonBlock label="Social media" raw={profile.socialMedia as string} />
        <JsonBlock label="BFF (best friends)" raw={profile.bestFriends as string} />
        <JsonBlock label="Colleague / coworker" raw={profile.colleagues as string} />
        <JsonBlock label="Dokumen pendukung (URL JSON)" raw={profile.supportingDocuments as string} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-lg mb-3">Pendidikan & karier</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Row k="Gelar" v={String(profile.universityDegree || '—')} />
          <Row k="Komentar sertifikat profesi" v={String(profile.profCertComment || '—')} />
          <Row k="Universitas" v={String(profile.universityName || '—')} />
          <Row k="Bidang studi" v={String(profile.major || '—')} />
          <Row k="Pekerjaan" v={String(profile.profession || '—')} />
          <Row k="Posisi" v={String(profile.jobPosition || '—')} />
          <Row k="Komentar business owner" v={String(profile.businessOwnerComment || '—')} />
          <Row k="Institusi" v={String(profile.workInstitution || '—')} />
        </dl>
      </div>

      {expectedMatch && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-3">Expected match</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <Row k="Usia min–max" v={`${expectedMatch.ageMin ?? '—'} – ${expectedMatch.ageMax ?? '—'}`} />
            <Row k="Belief" v={String(expectedMatch.religion || '—')} />
            <Row k="Ethnicity" v={String(expectedMatch.ethnic || '—')} />
            <Row k="Education" v={String(expectedMatch.education || '—')} />
            <Row k="Job" v={String(expectedMatch.job || '—')} />
            <Row k="Field of study" v={String(expectedMatch.fieldOfStudy || '—')} />
            <Row k="Location" v={String(expectedMatch.location || '—')} />
            <Row k="Interests (raw)" v={String(expectedMatch.interests || '—')} />
          </dl>
        </div>
      )}

      {prefs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-3">Preferensi match (kriteria)</h2>
          <ul className="text-sm space-y-1">
            {prefs.map((p, i) => (
              <li key={i}>
                {(p.criteria?.displayName || '?')}: <strong>{p.subcriteria?.displayName || '?'}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-lg mb-3">Foto</h2>
        <div className="flex flex-wrap gap-4">
          {photos.map((p) => (
            <a
              key={p.id}
              href={photoSrc(p.photoUrl)}
              target="_blank"
              rel="noreferrer"
              className="block border rounded-lg overflow-hidden w-36"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoSrc(p.photoUrl)} alt="" className="w-full h-40 object-cover" />
              <p className="text-xs p-1 text-center">{p.isMain ? 'Utama' : 'Foto'}</p>
            </a>
          ))}
          {photos.length === 0 && <p className="text-gray-500 text-sm">Belum ada foto.</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-3">Reset password member</h2>
        {message && <p className={message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}>{message}</p>}
        <form onSubmit={resetPassword} className="flex flex-wrap gap-2 items-end">
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
            Reset password
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-500">
        Edit data profil dilakukan oleh user di aplikasi; admin mengatur verifikasi, suspend, dan review field sensitif di atas.
      </p>
    </div>
  )
}
