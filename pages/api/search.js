// ✅ pages/api/search.js – now passes full query to backend
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const backend = process.env.BACKEND_API_BASE || 'http://localhost:3000';
  const query = req.query;

  const url = new URL(`${backend}/search/hotels`);
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  });

  try {
    const resp = await fetch(url.toString());

    const contentType = resp.headers.get("content-type") || "";
    if (!resp.ok || !contentType.includes("application/json")) {
      const raw = await resp.text();
      console.error("❌ Backend responded with non-JSON:", raw);
      return res.status(502).json({ message: "Invalid backend response", raw });
    }

    const data = await resp.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Search API Error:", err);
    res.status(500).json({ message: "Search failed", error: err.message });
  }
}