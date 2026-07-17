const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }

  return res.status === 204 ? null : res.json()
}

function qs(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  if (!entries.length) return ''
  return `?${new URLSearchParams(entries).toString()}`
}

// Flights
export const fetchFlights = (params = {}) => request(`/flights${qs(params)}`)
export const fetchFlight = (id) => request(`/flights/${id}`)
export const fetchMyFlightBookings = () => request('/flight-bookings/mine')
export const createFlightBooking = (payload) =>
  request('/flight-bookings', { method: 'POST', body: JSON.stringify(payload) })
export const cancelFlightBooking = (id) =>
  request(`/flight-bookings/${id}/cancel`, { method: 'POST' })

// Hotels
export const fetchHotels = (params = {}) => request(`/hotels${qs(params)}`)
export const fetchHotel = (id) => request(`/hotels/${id}`)
export const fetchMyHotelBookings = () => request('/hotel-bookings/mine')
export const createHotelBooking = (payload) =>
  request('/hotel-bookings', { method: 'POST', body: JSON.stringify(payload) })
export const cancelHotelBooking = (id) =>
  request(`/hotel-bookings/${id}/cancel`, { method: 'POST' })

// Tours
export const fetchTours = (params = {}) => request(`/tours${qs(params)}`)
export const fetchTour = (id) => request(`/tours/${id}`)
export const fetchMyTourBookings = () => request('/tour-bookings/mine')
export const createTourBooking = (payload) =>
  request('/tour-bookings', { method: 'POST', body: JSON.stringify(payload) })
export const cancelTourBooking = (id) =>
  request(`/tour-bookings/${id}/cancel`, { method: 'POST' })

// Orders (review -> payment -> receipt checkout, authenticated users only)
export const createOrder = (payload) =>
  request('/orders', { method: 'POST', body: JSON.stringify(payload) })
export const fetchMyOrders = () => request('/orders/mine')
export const fetchOrder = (id) => request(`/orders/${id}`)
