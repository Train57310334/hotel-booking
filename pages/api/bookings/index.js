// ✅ pages/api/bookings/index.js
export default async function handler(req, res) {
  const backend = process.env.BACKEND_API_BASE || 'http://localhost:3000';


  if (req.method === 'POST') {
    try {
      const resp = await fetch(`${backend}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await resp.json();
      res.status(resp.status).json(data);
    } catch (err) {
      res.status(500).json({ message: 'Booking failed', error: err.message });
    }
  } else {
    res.status(405).end();
  }
}