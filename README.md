# Hotel Booking Frontend (Next.js)

## Quick start
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Pages
- `/` search + results (filters, sort, map toggle)
- `/hotel/[id]` hotel detail (gallery placeholder, amenities, rooms & plans, book)
- `/booking/guest-info` step 1
- `/booking/payment` step 2 (promo code SAVE10)
- `/booking/confirmation` step 3 (QR)

## Notes
- Uses `https://api.bookingkub.com/hotels` and `/hotels/:id` for data.
- Booking calls to `/bookings` and `/bookings/:id/confirm-payment` are best-effort demo (JWT optional).
- Tailwind CSS included.
