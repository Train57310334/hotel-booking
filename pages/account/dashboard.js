import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { LogOut, User, Calendar, History, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function GuestDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await apiFetch('/bookings/my-bookings/list');
            setBookings(data);
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

    const upcomingBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
    const pastBookings = bookings.filter(b => ['checked_in', 'checked_out', 'cancelled', 'no_show'].includes(b.status));

    if (!user) return (
        <Layout>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p>Loading your account...</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="w-full md:w-64 shrink-0">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary-500 to-indigo-600 opacity-10"></div>
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

                                <nav className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab('upcoming')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <Calendar size={18} />
                                        Upcoming Trips
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('past')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'past' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <History size={18} />
                                        Booking History
                                    </button>
                                    {/*
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Settings size={18} />
                    Profile Settings
                  </button>
                  */}
                                </nav>

                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-rose-600 hover:bg-rose-50 transition-colors"
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
                                                <BookingCard key={booking.id} booking={booking} onCancel={() => handleCancel(booking.id)} />
                                            ))
                                        ) : (
                                            <EmptyState message="You have no upcoming trips." />
                                        )
                                    )}

                                    {activeTab === 'past' && (
                                        pastBookings.length > 0 ? (
                                            pastBookings.map(booking => (
                                                <BookingCard key={booking.id} booking={booking} isPast />
                                            ))
                                        ) : (
                                            <EmptyState message="You have no past bookings." />
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

function BookingCard({ booking, isPast, onCancel }) {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-rose-100 text-rose-700';
            case 'checked_in': return 'bg-blue-100 text-blue-700';
            case 'checked_out': return 'bg-slate-100 text-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                <img
                    src={booking.hotel?.imageUrl || booking.roomType?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400'}
                    alt={booking.hotel?.name || 'Hotel'}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                {booking.status}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Ref: {booking.id.slice(0, 8)}</span>
                        </div>
                        <h3 className="text-xl font-display font-bold text-slate-900">{booking.hotel?.name || 'Hotel Booking'}</h3>
                        <p className="text-slate-500 text-sm mt-1">{booking.roomType?.name}</p>
                    </div>

                    <div className="text-right">
                        <p className="text-slate-500 text-sm">Total Amount</p>
                        <p className="text-xl font-bold text-primary-600">฿{booking.totalAmount?.toLocaleString()}</p>
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
                                className="px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                                Cancel Booking
                            </button>
                        )}
                        <Link
                            href={`/booking-confirmation?id=${booking.id}`}
                            className="px-4 py-2 text-sm font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors flex items-center gap-1"
                        >
                            View Details <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Bookings Found</h3>
            <p className="text-slate-500 mb-6">{message}</p>
            <Link
                href="/"
                className="inline-flex px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
            >
                Explore Hotels
            </Link>
        </div>
    );
}
