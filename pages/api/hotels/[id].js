// ✅ pages/api/hotels/[id].js
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id, ...rest } = req.query;
  const queryString = new URLSearchParams(rest).toString();

  try {
    const backend = process.env.BACKEND_API_BASE || 'http://127.0.0.1:3001/api';
    const url = `${backend}/hotels/${id}${queryString ? `?${queryString}` : ''}`;

    console.log(`\n>>> [Proxy] Requesting: ${url}`);
    const resp = await fetch(url);
    console.log(`<<< [Proxy] Response: ${resp.status} ${resp.statusText}`);

    if (!resp.ok) {
      throw new Error(`Backend responded with ${resp.status} ${resp.statusText}`);
    }
    const data = await resp.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Proxy Error:', err);
    res.status(500).json({ message: 'Hotel fetch failed', error: err.toString(), stack: err.stack });
  }
}