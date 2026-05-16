import { routes } from '@/lib/routes'

// Smart API Base URL detection
const getApiBase = () => {
  // 1. Env Var (Best Practice)
  if (process.env.NEXT_PUBLIC_API_BASE) {
    console.log('API_BASE: Using NEXT_PUBLIC_API_BASE', process.env.NEXT_PUBLIC_API_BASE);
    return process.env.NEXT_PUBLIC_API_BASE;
  }

  // 2. Client-side Domain Check (Runtime)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    console.log('API_BASE: Checking hostname', host);
    if (host.includes('bookingkub.com')) {
      return 'https://api.bookingkub.com/api';
    }
  }

  // 3. Server-side Production Check (Build/Runtime)
  if (process.env.NODE_ENV === 'production') {
    console.log('API_BASE: NODE_ENV is production');
    return 'https://api.bookingkub.com/api';
  }

  // 4. Localhost Fallback
  console.warn('API_BASE: Falling back to localhost');
  return 'http://localhost:3001/api';
};

export const API_BASE = getApiBase();

export async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...(!(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(typeof window !== 'undefined' && localStorage.getItem('hotelId') ? { 'x-hotel-id': localStorage.getItem('hotelId') } : {}),
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

/**
 * Resolves image URLs for uploaded files.
 * - Old format: /uploads/filename.jpg → API_BASE_ORIGIN/api/upload/files/filename.jpg
 * - New format: /api/upload/files/filename.jpg → API_BASE_ORIGIN/api/upload/files/filename.jpg
 * - Full URLs (https://...) → passed through unchanged
 */
export function resolveImageUrl(url) {
  if (!url) return '';
  // Already a full URL (external or CDN)
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Derive API origin from API_BASE (strip the /api suffix)
  const apiOrigin = API_BASE.replace(/\/api$/, '');

  // Old format: /uploads/filename.jpg
  if (url.startsWith('/uploads/')) {
    const filename = url.replace('/uploads/', '');
    return `${apiOrigin}/api/upload/files/${filename}`;
  }
  // New format: /api/upload/files/filename.jpg
  if (url.startsWith('/api/upload/files/')) {
    return `${apiOrigin}${url}`;
  }
  // Fallback: treat as relative to API origin
  return `${apiOrigin}${url}`;
}
