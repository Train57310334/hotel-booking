const buildQueryString = (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.append(key, String(value))
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export const apiPaths = {
  publicSettings: '/public-settings',
  hotelById: (hotelId) => `/hotels/${hotelId}`,
  adminDashboard: ({ period, hotelId }) => `/bookings/admin/dashboard${buildQueryString({ period, hotelId })}`,
  adminBookings: (params = {}) => `/bookings/admin/all${buildQueryString(params)}`,
  adminDailyOperations: ({ hotelId }) => `/bookings/admin/daily-operations${buildQueryString({ hotelId })}`,
  adminBookingStatus: ({ bookingId, hotelId }) => `/bookings/admin/${bookingId}/status${buildQueryString({ hotelId })}`,
}

