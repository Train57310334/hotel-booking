import { routes } from '@/lib/routes'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

export async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const url = `${API_BASE}${path}`;
  console.log(`[API] Fetching: ${url}`);
  const res = await fetch(url, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (_) { }
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  async getHotels() {
    const res = await fetch(`${API_BASE}/hotels`, {
      next: { revalidate: 60 }, // ISR revalidate ทุก 60 วินาที
    });

    if (!res.ok) throw new Error("Failed to fetch hotels");
    return res.json();
  },
};

// Re-export the routes to use elsewhere
export { routes };
