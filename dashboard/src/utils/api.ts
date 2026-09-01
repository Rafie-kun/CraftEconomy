const API_BASE = '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export const api = {
  health: () => fetchJson<{ status: string; version: string }>('/health'),
  stats: () => fetchJson<import('../types').ServerStats>('/stats'),
  players: () => fetchJson<import('../types').PlayerAccount[]>('/players'),
  player: (uuid: string) => fetchJson<import('../types').PlayerAccount>(`/players/${uuid}`),
  transactions: (uuid?: string, page?: number) => {
    const params = new URLSearchParams()
    if (uuid) params.set('uuid', uuid)
    if (page) params.set('page', String(page))
    return fetchJson<import('../types').Transaction[]>(`/transactions?${params}`)
  },
  shops: () => fetchJson<import('../types').Shop[]>('/shops'),
  setBalance: (uuid: string, amount: number) =>
    postJson<{ success: boolean }>('/admin/setbalance', { uuid, amount }),
}
