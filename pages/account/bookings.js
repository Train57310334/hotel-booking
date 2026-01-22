import Layout from '@/components/Layout'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { apiFetch } from '@/lib/api'

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (user) {
      fetchBookings()
    }
  }, [user, authLoading])

  const fetchBookings = async () => {
    try {
      // The backend endpoint from controller is @Get() under @Controller('bookings') so path is /bookings
      const data = await apiFetch('/bookings')
      if (data.upcoming || data.past) {
        setBookings([...(data.upcoming || []), ...(data.past || [])])
      } else if (Array.isArray(data)) {
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (loading && user)) return (
    <Layout>
      <div className="container mx-auto p-12 text-center flex flex-col items-center gap-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        <p className="text-slate-500">Loading your journeys...</p>
      </div>
    </Layout>
  )

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;

    try {
      const res = await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PUT' });
      if (res && res.status === 'cancelled') {
        alert('Booking cancelled successfully');
        // Update local state
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking: ' + (error.message || 'Unknown error'));
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-display text-slate-900 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-700 mb-2">No bookings yet</h3>
            <p className="text-slate-500 mb-6">Looks like you haven't booked any trips yet.</p>
            <button onClick={() => router.push('/')} className="btn-primary">
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                <div className="w-full md:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={booking.hotel?.imageUrl || "/images/hero-bg.png"}
                    alt={booking.hotel?.name || 'Hotel'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/hero-bg.png' }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row justify-between md:items-start mb-4 gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{booking.hotel?.name || 'Unknown Hotel'}</h3>
                      <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                        <MapPin size={14} /> {booking.hotel?.city || 'City'}, {booking.hotel?.country || 'Country'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                        {booking.status ? (booking.status.charAt(0).toUpperCase() + booking.status.slice(1)) : 'Pending'}
                      </span>
                      {(booking.status === 'confirmed' || booking.status === 'pending') && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-3 py-1 text-xs font-bold text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="p-2 bg-slate-50 rounded-lg text-primary-600">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Check-in</p>
                        <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="p-2 bg-slate-50 rounded-lg text-primary-600">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Check-out</p>
                        <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="p-2 bg-slate-50 rounded-lg text-primary-600">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Duration</p>
                        <p className="font-medium">
                          {Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)))} nights
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center pl-4 border-l border-slate-100">
                      <p className="text-xs text-slate-400">Total Price</p>
                      <p className="text-xl font-bold text-primary-600">฿{booking.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}