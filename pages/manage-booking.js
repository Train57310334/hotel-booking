import { useState } from 'react';
import Head from 'next/head';
import { Search, ChevronRight, FileText, CheckCircle, Clock, XCircle, Home, Calendar, Users, CreditCard } from 'lucide-react';
import Layout from '@/components/Layout';
import { API_BASE } from '@/lib/api';
import Link from 'next/link';

export default function ManageBooking() {
    const [bookingId, setBookingId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [booking, setBooking] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/bookings/guest/find?id=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(email)}`);
            if (!res.ok) {
                if (res.status === 404 || res.status === 403) {
                    throw new Error('We could not find a booking matching this ID and Email combination.');
                }
                throw new Error('Failed to fetch booking details. Please try again.');
            }

            const data = await res.json();
            setBooking(data);
        } catch (err) {
            setError(err.message);
            setBooking(null);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        checked_in: 'bg-blue-100 text-blue-800 border-blue-200',
        checked_out: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    const statusIcons = {
        pending: <Clock className="w-5 h-5 mr-1" />,
        confirmed: <CheckCircle className="w-5 h-5 mr-1" />,
        cancelled: <XCircle className="w-5 h-5 mr-1" />,
        checked_in: <Home className="w-5 h-5 mr-1" />,
        checked_out: <CheckCircle className="w-5 h-5 mr-1" />,
    };

    return (
        <Layout navbarProps={{ brandName: 'BookingKub', mode: 'saas', transparent: false }} hideFooter={false}>
            <Head>
                <title>Manage My Booking | BookingKub</title>
            </Head>

            <div className="min-h-screen bg-slate-50 pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {!booking ? (
                        <div className="max-w-md mx-auto mt-12 mb-32">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Your Booking</h1>
                                <p className="mt-2 text-slate-500">Enter your booking details to view status, download invoice, or upload payment slip.</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                                <form onSubmit={handleSearch} className="space-y-6">
                                    <div>
                                        <label htmlFor="bookingId" className="block text-sm font-medium text-slate-700">Booking Reference ID</label>
                                        <input
                                            type="text"
                                            id="bookingId"
                                            value={bookingId}
                                            onChange={(e) => setBookingId(e.target.value)}
                                            required
                                            placeholder="e.g. clt123xyz..."
                                            className="mt-2 block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-3 border"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="Email used during booking"
                                            className="mt-2 block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-3 border"
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start">
                                            <XCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? 'Searching...' : 'Find My Booking'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 mb-24">
                            <button
                                onClick={() => setBooking(null)}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center mb-6 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                                Back to Search
                            </button>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-slate-900">Booking {booking.id.slice(-6).toUpperCase()}</h2>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">{booking.hotel.name}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center shadow-sm ${statusColors[booking.status] || 'bg-slate-100 text-slate-800'}`}>
                                        {statusIcons[booking.status]}
                                        {booking.status.replace('_', ' ').toUpperCase()}
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Stay Details */}
                                        <div>
                                            <h3 className="text-xs font-bold border-b border-slate-100 pb-2 mb-5 text-slate-400 uppercase tracking-widest">Stay Details</h3>
                                            <div className="space-y-5">
                                                <div className="flex items-start">
                                                    <div className="bg-slate-100 p-2 rounded-lg mr-4">
                                                        <Calendar className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5 font-medium">Check-in</p>
                                                        <p className="font-bold text-slate-900">{new Date(booking.checkIn).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="bg-slate-100 p-2 rounded-lg mr-4">
                                                        <Calendar className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5 font-medium">Check-out</p>
                                                        <p className="font-bold text-slate-900">{new Date(booking.checkOut).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="bg-slate-100 p-2 rounded-lg mr-4">
                                                        <Home className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5 font-medium">Room</p>
                                                        <p className="font-bold text-slate-900">{booking.roomType.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="bg-slate-100 p-2 rounded-lg mr-4">
                                                        <Users className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5 font-medium">Guests</p>
                                                        <p className="font-bold text-slate-900">{booking.guestsAdult} Adults, {booking.guestsChild} Children</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Guest & Payment Summary */}
                                        <div>
                                            <h3 className="text-xs font-bold border-b border-slate-100 pb-2 mb-5 text-slate-400 uppercase tracking-widest">Guest & Payment</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Primary Guest</p>
                                                    <p className="font-bold text-slate-900">{booking.leadName}</p>
                                                    <p className="text-sm text-slate-500">{booking.leadEmail}</p>
                                                </div>

                                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-6 shadow-sm">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-slate-500 font-medium text-sm">Total Amount</span>
                                                        <span className="text-2xl font-black text-slate-900">฿{booking.totalAmount.toLocaleString()}</span>
                                                    </div>

                                                    {booking.status === 'pending' && (
                                                        <div className="mt-5">
                                                            <Link href={`/booking/payment?id=${booking.id}`} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                                                                <CreditCard className="w-5 h-5 mr-2" />
                                                                Complete Payment
                                                            </Link>
                                                            <p className="text-xs text-center text-slate-500 mt-3">Upload your transfer slip to view confirmation.</p>
                                                        </div>
                                                    )}

                                                    {['confirmed', 'checked_in', 'checked_out'].includes(booking.status) && (
                                                        <div className="mt-5">
                                                            <Link href={`/invoice/${booking.id}`} target="_blank" className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                                                                <FileText className="w-5 h-5 mr-2" />
                                                                Download Invoice
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
}
