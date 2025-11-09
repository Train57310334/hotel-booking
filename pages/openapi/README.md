# Wiring to your exact OpenAPI spec

1) Put your OpenAPI JSON URL into `.env.local`:
```
OPENAPI_URL=https://api.bookingkub.com/api-json
```

> Tip: For many NestJS apps with Swagger, the JSON is usually at `/api-json` (the UI is `/api/docs`).

2) Install dev deps and generate types:
```
npm install
npm run gen:api
```

This will create `lib/openapi-types.d.ts` with full endpoint typings.

3) Adjust `lib/routes.js` so each path matches your spec exactly
   - auth: `/auth/login`, `/auth/register`, `/auth/me`, etc.
   - hotels: `/hotels`, `/hotels/:id`
   - bookings: `/bookings`, `/bookings/:id/confirm-payment`, `/bookings/me`

4) If your auth/login response shape differs, tweak token extraction in `pages/auth/login.js`:
```js
const token = data.access_token || data.token || data.accessToken;
```

5) To switch API base without code changes, set:
```
NEXT_PUBLIC_API_BASE=https://api.bookingkub.com
```
