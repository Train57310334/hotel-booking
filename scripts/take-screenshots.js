const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();

    const baseUrl = 'http://localhost:3000';
    const demoDir = path.join(__dirname, '../public/demo');

    if (!fs.existsSync(demoDir)) {
        fs.mkdirSync(demoDir, { recursive: true });
    }

    try {
        // 1. Login
        console.log('Navigating to Login...');
        await page.goto(`${baseUrl}/auth/login`, { waitUntil: 'networkidle0' });

        console.log('Logging in...');
        await page.type('input[type="email"]', 'admin@bookingkub.com');
        await page.type('input[type="password"]', 'admin1234');

        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        // 2. Dashboard Screenshot
        console.log('Taking Dashboard screenshot...');
        await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle0' });
        // Verify we are on dashboard (look for specific element if needed, but let's assume successful login)
        await page.screenshot({ path: path.join(demoDir, 'dashboard.png') });

        // 3. Calendar Screenshot
        console.log('Taking Calendar screenshot...');
        await page.goto(`${baseUrl}/admin/calendar`, { waitUntil: 'networkidle0' });
        // Wait for calendar to render a bit if needed
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(demoDir, 'calendar.png') });

        // 4. Guests Screenshot
        console.log('Taking Guests screenshot...');
        await page.goto(`${baseUrl}/admin/guests`, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: path.join(demoDir, 'guests.png') });

        // 5. Payments Screenshot
        console.log('Taking Payments screenshot...');
        await page.goto(`${baseUrl}/admin/payments`, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: path.join(demoDir, 'payments.png') });

        // 6. Booking Engine (Guest View)
        console.log('Taking Booking Engine screenshot...');
        // Use Incognito context or logout? Or just visit directly (it's public)
        // Actually, logged in user might see diff UI? No, usually OK.
        // Let's use incognito context for cleaner look
        const context = await browser.createIncognitoBrowserContext();
        const guestPage = await context.newPage();
        await guestPage.setViewport({ width: 1440, height: 900 });

        await guestPage.goto(`${baseUrl}/search`, { waitUntil: 'networkidle0' });
        await guestPage.screenshot({ path: path.join(demoDir, 'booking.png') });

        // 7. Booking Confirmation (Mock)
        // We can't easily mock success without booking, so maybe skip or use /search with query params if supported
        // For now, let's just use the search page again or maybe a detail page?
        // Let's try to simulate a detail view if rooms are listed
        // No, let's stick to booking.png for now.

    } catch (error) {
        console.error('Error taking screenshots:', error);
    } finally {
        await browser.close();
    }
})();
