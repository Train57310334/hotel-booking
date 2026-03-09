import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { LogOut, User, Calendar, History, Settings, ChevronRight, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

export default function GuestDashboard() {
    const router = useRouter();
    const { hotelId } = router.query;
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [pastBookings, setPastBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await apiFetch('/bookings/my-bookings/list');
            if (Array.isArray(data)) {
                const now = new Date();
                setUpcomingBookings(data.filter(b => new Date(b.checkOut) >= now));
                setPastBookings(data.filter(b => new Date(b.checkOut) < now));
            } else {
                setUpcomingBookings([...(data.upcoming || []), ...(data.active || [])]);
                setPastBookings(data.past || []);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PUT' });
            fetchBookings();
        } catch (error) {
            alert(error.message || 'Failed to cancel booking');
        }
    };

    if (!user) return (
        <Layout navbarProps={{ mode: 'hotel' }}>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        </Layout>
    );

    return (
        <Layout navbarProps={{ mode: 'hotel' }}>
            <div className="min-h-screen bg-slate-50/50 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8">

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="w-full md:w-72 shrink-0">
                            <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 p-6 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary-500/10 via-emerald-500/10 to-transparent"></div>
                                <div className="relative z-10 flex flex-col items-center mb-8 pt-4">
                                    <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden mb-4">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 text-white font-bold text-2xl">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="font-display font-bold text-lg text-slate-900">{user?.name}</h2>
                                    <p className="text-slate-500 text-sm">{user?.email}</p>
                                </div>

                                <nav className="space-y-2 mt-2">
                                    <button
                                        onClick={() => setActiveTab('upcoming')}
                                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'upcoming' ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                    >
                                        <Calendar size={18} className={activeTab === 'upcoming' ? 'text-primary-500' : 'text-slate-400'} />
                                        Upcoming Trips
                                        {upcomingBookings.length > 0 && (
                                            <span className="ml-auto bg-primary-100 text-primary-700 py-0.5 px-2.5 rounded-full text-xs font-bold">{upcomingBookings.length}</span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('past')}
                                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'past' ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                    >
                                        <History size={18} className={activeTab === 'past' ? 'text-primary-500' : 'text-slate-400'} />
                                        Booking History
                                    </button>
                                </nav>

                                <div className="mt-8 pt-8 border-t border-slate-100/80">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                                    >
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">
                                {activeTab === 'upcoming' && 'Upcoming Trips'}
                                {activeTab === 'past' && 'Booking History'}
                                {activeTab === 'settings' && 'Profile Settings'}
                            </h1>

                            {loading ? (
                                <div className="bg-white rounded-3xl p-12 text-center text-slate-500">
                                    Loading your bookings...
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {activeTab === 'upcoming' && (
                                        upcomingBookings.length > 0 ? (
                                            upcomingBookings.map(booking => (
                                                <BookingCard key={booking.id} booking={booking} onCancel={() => handleCancel(booking.id)} hotelId={hotelId} />
                                            ))
                                        ) : (
                                            <EmptyState message="You have no upcoming trips." hotelId={hotelId} />
                                        )
                                    )}

                                    {activeTab === 'past' && (
                                        pastBookings.length > 0 ? (
                                            pastBookings.map(booking => (
                                                <BookingCard key={booking.id} booking={booking} isPast hotelId={hotelId} />
                                            ))
                                        ) : (
                                            <EmptyState message="You have no past bookings." isPast hotelId={hotelId} />
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export function BookingCard({ booking, isPast, onCancel, hotelId }) {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'checked_in': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'checked_out': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group flex flex-col md:flex-row gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent -z-10 rounded-bl-full"></div>

            <div className="w-full md:w-56 h-40 md:h-auto rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                <img
                    src={booking.hotel?.imageUrl || booking.roomType?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400'}
                    alt={booking.hotel?.name || 'Hotel'}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md bg-white/90 ${getStatusColor(booking.status)}`}>
                        {booking.status}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase bg-slate-50 px-2 py-0.5 rounded">Ref: {booking.id.slice(0, 8)}</span>
                        </div>
                        <h3 className="text-xl font-display font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{booking.hotel?.name || 'Hotel Name'}</h3>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                            {booking.roomType?.name}
                        </p>
                    </div>

                    <div className="text-right shrink-0">
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Total Amount</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">฿{booking.totalAmount?.toLocaleString()}</p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                        <div>
                            <p className="text-slate-400 text-xs">Check In</p>
                            <p className="font-medium text-slate-900">{checkIn.toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col items-center px-4 w-12 shrink-0">
                            <div className="h-0.5 w-full bg-slate-200"></div>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">Check Out</p>
                            <p className="font-medium text-slate-900">{checkOut.toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isPast && ['pending', 'confirmed'].includes(booking.status) && (
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 text-sm font-bold text-rose-600 hover:text-white hover:bg-rose-500 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <Link
                            href={hotelId ? `/booking-confirmation?id=${booking.id}&hotelId=${hotelId}` : `/booking-confirmation?id=${booking.id}`}
                            className="px-5 py-2.5 text-sm font-bold bg-slate-900 hover:bg-primary-600 text-white rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                        >
                            View Details <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message, isPast, hotelId }) {
    return (
        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                {isPast ? (
                    <History size={32} className="text-slate-400" />
                ) : (
                    <Search size={32} className="text-primary-400" />
                )}
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-800 mb-3">No Bookings Found</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">{message}</p>
            <Link
                href={hotelId ? `/?hotelId=${hotelId}` : '/'}
                className="inline-flex px-8 py-3.5 bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-bold rounded-xl hover:from-primary-500 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5"
            >
                Start Exploring
            </Link>
        </div>
    );
}
