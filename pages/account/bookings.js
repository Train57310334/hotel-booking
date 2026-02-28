import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/landing/Footer';
import { apiFetch } from '@/lib/api';
import { CalendarDays, MapPin, CreditCard, CheckCircle, Clock, XCircle, ArrowRight, BedDouble, ChevronRight, User } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/account/bookings');
    } else if (user) {
      fetchBookings();
    }
  }, [user, authLoading, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/bookings/my-bookings/list');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Confirmed</span>;
      case 'pending':
        return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1"><Clock size={14} /> Payment Required</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1"><XCircle size={14} /> Cancelled</span>;
      case 'checked_in':
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Checked In</span>;
      case 'checked_out':
        return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Completed</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">{status}</span>;
    }
  };

  const isUpcoming = (booking) => {
    return ['confirmed', 'pending', 'checked_in'].includes(booking.status) && new Date(booking.checkOut) >= new Date();
  };

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter(b => !isUpcoming(b));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Head>
        <title>My Bookings - BookingKub</title>
      </Head>

      <NavBar forceSolid={true} />

      <main className="flex-grow container mx-auto px-4 pt-28 pb-16 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-slate-600">Manage your upcoming stays and view your booking history.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="w-24 h-24 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No bookings yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">It looks like you haven't made any reservations with us yet. Start exploring our amazing hotels!</p>
            <button onClick={() => router.push('/search')} className="btn-primary inline-flex items-center gap-2">
              Explore Hotels <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Stays */}
            {upcomingBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Upcoming Stays</h2>
                  <span className="bg-primary-100 text-primary-700 py-1 px-3 rounded-full text-sm font-bold">{upcomingBookings.length}</span>
                </div>
                <div className="space-y-6">
                  {upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} router={router} type="upcoming" />
                  ))}
                </div>
              </section>
            )}

            {/* Past Stays */}
            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-12">Past & Cancelled</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} router={router} type="past" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );

  function BookingCard({ booking, router, type }) {
    const isPast = type === 'past';
    const hotelImage = booking.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';

    return (
      <div className={`bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60 ${isPast ? 'opacity-80' : ''}`}>
        <div className={`flex flex-col ${isPast ? '' : 'md:flex-row'}`}>
          {/* Image */}
          <div className={`relative ${isPast ? 'h-40' : 'md:w-1/3 min-h-[200px]'}`}>
            <img src={hotelImage} alt={booking.hotel?.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-4 left-4">
              {getStatusBadge(booking.status)}
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-bold text-lg leading-tight truncate">{booking.hotel?.name || 'Unknown Hotel'}</h3>
              <p className="text-sm text-white/80 flex items-center gap-1 truncate"><MapPin size={12} /> {booking.hotel?.address || 'Address n/a'}</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">Booking Reference</div>
                  <div className="font-mono text-sm text-slate-700 bg-slate-100 py-1 px-2 rounded-lg inline-block">{booking.id.split('-')[0].toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">Total Amount</div>
                  <div className="font-bold text-lg text-primary-600">THB {booking.totalAmount?.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">Check-in</div>
                  <div className="font-bold text-slate-900">{format(new Date(booking.checkIn), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-slate-500 mt-1">From 14:00</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">Check-out</div>
                  <div className="font-bold text-slate-900">{format(new Date(booking.checkOut), 'MMM d, yyyy')}</div>
                  <div className="text-xs text-slate-500 mt-1">Until 12:00</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600 mb-6">
                <div className="flex items-center gap-1.5"><BedDouble size={16} className="text-slate-400" /> {booking.roomType?.name}</div>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <div className="flex items-center gap-1.5"><User size={16} className="text-slate-400" /> {booking.guestsAdult} Adults, {booking.guestsChild} Child</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 mt-auto">
              {booking.status === 'pending' && (
                <button onClick={() => router.push(`/checkout/${booking.draftId || booking.id}`)} className="btn-primary flex-1 min-w-[140px] flex justify-center items-center gap-2">
                  <CreditCard size={18} /> Pay Now
                </button>
              )}
              {booking.status === 'confirmed' && (
                <button onClick={() => toast('Modification portal coming soon!')} className="btn-secondary flex-1 min-w-[140px]">
                  Manage Booking
                </button>
              )}
              <button
                onClick={() => router.push(`/booking-success?id=${booking.id}`)}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 font-medium transition-colors rounded-xl ${(booking.status === 'pending' || booking.status === 'confirmed') ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'btn-primary'}`}
              >
                View Details <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}