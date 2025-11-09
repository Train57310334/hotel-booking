// Centralized API route map – adjust to match your OpenAPI spec exactly.
export const routes = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    me: '/auth/me',
  },
  hotels: {
    list: '/hotels',
    detail: (id) => `/hotels/${id}`,
    // availability: '/availability/check', // uncomment if exists in your API
    // price: '/pricing/calculate',         // uncomment if exists
  },
  bookings: {
    create: '/bookings',
    listMine: '/bookings/me',              // if not available, fallback to /bookings and filter client-side
    detail: (id) => `/bookings/${id}`,
    confirmPayment: (id) => `/bookings/${id}/confirm-payment`,
    cancel: (id) => `/bookings/${id}/cancel`, // if supported by API
  }
};
