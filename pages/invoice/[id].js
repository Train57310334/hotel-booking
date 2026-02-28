import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { apiFetch, API_BASE } from '@/lib/api';
import { Printer } from 'lucide-react';

export default function InvoicePage() {
    const router = useRouter();
    const { id, email } = router.query;
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchBooking = async () => {
            try {
                let data;
                // If email is provided, use the guest lookup endpoint
                if (email) {
                    const res = await fetch(`${API_BASE}/bookings/guest/find?id=${id}&email=${encodeURIComponent(email)}`);
                    if (!res.ok) throw new Error('Unauthorized or not found');
                    data = await res.json();
                } else {
                    // Otherwise, rely on authenticated apiFetch
                    data = await apiFetch(`/bookings/${id}`);
                }
                setBooking(data);
            } catch (err) {
                setError(err.message || 'Failed to load invoice');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id, email]);

    if (loading) {
        return <div className="min-h-screen flex text-slate-500 items-center justify-center">Loading Invoice...</div>;
    }

    if (error || !booking) {
        return <div className="min-h-screen flex items-center justify-center text-red-600 font-medium">Error: {error}</div>;
    }

    const { hotel, roomType, payment } = booking;
    const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white font-sans text-slate-900">
            <Head>
                <title>Invoice - {booking.id.toUpperCase()}</title>
            </Head>

            {/* Floating Print Button (Hidden in Print Mode) */}
            <div className="fixed bottom-8 right-8 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                    <Printer className="w-6 h-6" />
                </button>
            </div>

            {/* A4 Page Container */}
            <div className="max-w-4xl mx-auto my-8 bg-white p-12 shadow-sm rounded-sm print:m-0 print:p-0 print:shadow-none print:rounded-none">

                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
                    <div className="flex items-center space-x-4">
                        {hotel.logoUrl ? (
                            <img src={hotel.logoUrl} alt={hotel.name} className="h-16 w-16 object-cover rounded-lg" />
                        ) : hotel.imageUrl ? (
                            <img src={hotel.imageUrl} alt={hotel.name} className="h-16 w-16 object-cover rounded-lg" />
                        ) : (
                            <div className="h-16 w-16 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-400">IMG</div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{hotel.name}</h1>
                            <p className="text-sm text-slate-500 max-w-xs mt-1">{hotel.address} {hotel.city} {hotel.country}</p>
                            <div className="mt-2 text-sm text-slate-500">
                                {hotel.contactPhone && <span className="mr-4">📞 {hotel.contactPhone}</span>}
                                {hotel.contactEmail && <span>✉️ {hotel.contactEmail}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-black text-slate-200 uppercase tracking-widest">Invoice</h2>
                        <p className="font-bold text-slate-900 mt-2">#{booking.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Bill To & Booking Info */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
                        <p className="font-bold text-slate-900 text-lg">{booking.leadName}</p>
                        <p className="text-slate-600">{booking.leadEmail}</p>
                        <p className="text-slate-600">{booking.leadPhone}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-slate-500">Check-In</span>
                                <span className="font-bold text-slate-900">{new Date(booking.checkIn).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Check-Out</span>
                                <span className="font-bold text-slate-900">{new Date(booking.checkOut).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Guests</span>
                                <span className="font-bold text-slate-900">{booking.guestsAdult}A, {booking.guestsChild}C</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Payment Status</span>
                                <span className="font-bold text-emerald-600 uppercase">{booking.status === 'pending' ? 'UNPAID' : 'PAID'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-12">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900 text-sm tracking-wider uppercase">
                                <th className="py-3 text-slate-500">Description</th>
                                <th className="py-3 text-slate-500 text-center">Nights</th>
                                <th className="py-3 text-slate-500 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-4">
                                    <p className="font-bold text-slate-900">Accommodation</p>
                                    <p className="text-sm text-slate-500">{roomType.name}</p>
                                </td>
                                <td className="py-4 text-center text-slate-900 font-medium">{nights}</td>
                                <td className="py-4 text-right font-bold text-slate-900">฿{booking.totalAmount.toLocaleString()}</td>
                            </tr>
                            {booking.folioCharges && booking.folioCharges.map((charge, idx) => (
                                <tr key={idx}>
                                    <td className="py-4">
                                        <p className="font-bold text-slate-900">{charge.description}</p>
                                    </td>
                                    <td className="py-4 text-center text-slate-900 font-medium">-</td>
                                    <td className="py-4 text-right font-bold text-slate-900">฿{charge.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-1/2 bg-slate-50 rounded-lg p-6 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium">฿{booking.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500">Tax</span>
                            <span className="font-medium uppercase text-xs tracking-wider">Included</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                            <span className="text-lg font-bold text-slate-900">Total Due</span>
                            <span className="text-2xl font-black text-slate-900">฿{booking.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
                    <p>Thank you for choosing {hotel.name}!</p>
                    <p className="mt-1">Generated by BookingKub system.</p>
                </div>

            </div>
        </div>
    );
}
