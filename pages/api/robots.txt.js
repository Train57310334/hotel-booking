export default async function handler(req, res) {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;

    try {
        // Fetch platform settings to get custom robots rules
        const response = await fetch(`${API_BASE}/settings/public`);
        const settings = response.ok ? await response.json() : {};

        const defaultRules = `User-agent: *
Allow: /
Allow: /search
Allow: /contact
Allow: /find-booking
Disallow: /admin
Disallow: /api
Disallow: /auth

Sitemap: ${SITE_URL}/api/sitemap.xml`;

        const customRules = settings.seoRobotsCustom ? `\n\n# Custom Rules\n${settings.seoRobotsCustom}` : '';

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
        res.status(200).send(defaultRules + customRules);
    } catch (error) {
        // Fallback if API is unavailable
        const SITE_URL_FALLBACK = `https://${req.headers.host}`;
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${SITE_URL_FALLBACK}/api/sitemap.xml`);
    }
}
