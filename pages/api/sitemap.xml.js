export default async function handler(req, res) {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;

    try {
        // Fetch all hotels from backend
        const response = await fetch(`${API_BASE}/hotels`);
        const hotels = response.ok ? await response.json() : [];

        const staticPages = ['', '/search', '/contact', '/find-booking'];

        const staticUrls = staticPages.map(path => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

        const hotelUrls = Array.isArray(hotels)
            ? hotels
                .filter(h => h.robotsIndex !== false && !h.isSuspended)
                .map(hotel => {
                    const baseUrl = hotel.canonicalUrl || `${SITE_URL}/?hotelId=${hotel.id}`;
                    const roomTypeUrls = (hotel.roomTypes || []).map(rt => `
  <url>
    <loc>${SITE_URL}/?hotelId=${hotel.id}&amp;roomTypeId=${rt.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

                    return `
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date(hotel.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
  </url>${roomTypeUrls}`;
                }).join('')
            : '';

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}${hotelUrls}
</urlset>`;

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
        res.status(200).send(sitemap);
    } catch (error) {
        console.error('Sitemap error:', error);
        res.status(500).send('Error generating sitemap');
    }
}
