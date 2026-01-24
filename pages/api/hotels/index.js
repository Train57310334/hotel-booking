export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const queryString = new URLSearchParams(req.query).toString();

    try {
        const backend = process.env.BACKEND_API_BASE || 'http://127.0.0.1:3001/api';
        const url = `${backend}/hotels${queryString ? `?${queryString}` : ''}`;

        const resp = await fetch(url);
        if (!resp.ok) {
            console.error('Backend Error:', resp.status);
            return res.status(resp.status).json({ message: 'Backend error' });
        }
        const data = await resp.json();
        res.status(200).json(data);
    } catch (err) {
        console.error('Proxy List Error:', err);
        res.status(500).json({ message: 'Hotel list fetch failed', error: err.message });
    }
}
