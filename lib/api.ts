const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('lovevia_admin_token')
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('lovevia_admin_token', token)
}

export function clearToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('lovevia_admin_token')
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const { token = getToken(), ...opts } = options
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return { success: false, error: json.error || res.statusText }
  return json
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; admin: { id: string; name: string; email: string; role: string } }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      token: null,
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  resetMemberPassword: (userId: string, newPassword: string) =>
    request('/reset-member-password', {
      method: 'POST',
      body: JSON.stringify({ userId, newPassword }),
    }),

  getDashboard: () => request<Record<string, number>>('/dashboard'),
  getMembers: (params?: { page?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.search) q.set('search', params.search)
    return request<{ list: unknown[]; total: number; page: number; limit: number }>(`/members?${q}`)
  },
  getMember: (id: string) => request<unknown>(`/members/${id}`),

  getCriteria: () => request<Array<{ id: string; name: string; displayName: string; subcriteria: unknown[] }>>('/criteria'),
  createCriteria: (body: { name?: string; displayName: string; description?: string; order?: number }) =>
    request('/criteria', { method: 'POST', body: JSON.stringify(body) }),
  updateCriteria: (id: string, body: Record<string, unknown>) =>
    request(`/criteria/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCriteria: (id: string) => request(`/criteria/${id}`, { method: 'DELETE' }),
  createSubcriteria: (body: { criteriaId: string; displayName: string; name?: string; order?: number }) =>
    request('/subcriteria', { method: 'POST', body: JSON.stringify(body) }),
  updateSubcriteria: (id: string, body: Record<string, unknown>) =>
    request(`/subcriteria/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSubcriteria: (id: string) => request(`/subcriteria/${id}`, { method: 'DELETE' }),

  getLocations: () => request<unknown[]>('/locations'),
  createLocation: (body: Record<string, unknown>) =>
    request('/locations', { method: 'POST', body: JSON.stringify(body) }),
  updateLocation: (id: string, body: Record<string, unknown>) =>
    request(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLocation: (id: string) => request(`/locations/${id}`, { method: 'DELETE' }),

  getActivityLogs: (params?: { page?: number; limit?: number; type?: string }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.type) q.set('type', params.type)
    return request<{ list: unknown[]; total: number }>(`/activity-logs?${q}`)
  },
  getTransactions: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return request<{ list: unknown[]; total: number }>(`/transactions?${q}`)
  },
  getFeedbacks: () => request<unknown[]>('/feedbacks'),
  getReports: () => request<unknown[]>('/reports'),
  updateReportStatus: (id: string, body: { status?: string; adminNotes?: string }) =>
    request(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  getAdmins: () => request<unknown[]>('/admins'),
  createAdmin: (body: { name: string; email: string; password: string; role?: string }) =>
    request('/admins', { method: 'POST', body: JSON.stringify(body) }),

  getReservationLetter: (meetupId: string) =>
    request<{ letter: string; locationName: string; waktu: string; userName: string }>(`/meetups/${meetupId}/reservation-letter`),
  getMeetups: () => request<unknown[]>('/meetups'),
}
