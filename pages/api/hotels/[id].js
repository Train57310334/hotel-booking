// ✅ pages/api/hotels/[id].js
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();


  const { id } = req.query;
  try {
    const backend = process.env.BACKEND_API_BASE || 'http://localhost:3000';
    const resp = await fetch(`${backend}/hotels/${id}`);
    const data = await resp.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Hotel fetch failed', error: err.message });
  }
}