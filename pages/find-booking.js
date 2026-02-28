import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { apiFetch } from '@/lib/api';
import { Search, Hash, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function FindBookingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ id: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Trim inputs
            const searchId = formData.id.trim();
            const searchEmail = formData.email.trim();

            if (!searchId || !searchEmail) {
                throw new Error("Please enter both Booking Reference and Email");
            }

            const data = await apiFetch(`/bookings/guest/find?id=${searchId}&email=${searchEmail}`);

            if (data && data.id) {
                // If found, redirect to confirmation page 
                // Alternatively, we could show it here, but confirmation page already handles display well
                router.push(`/booking-confirmation?id=${data.id}`);
            } else {
                setError("Booking not found. Please check your reference number and email.");
            }
        } catch (err) {
            setError(err.message || "Booking not found. Please check your details and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Find My Booking - BookingKub</title>
            </Head>

            <div className="min-h-[70vh] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                            <Search size={32} />
                        </div>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-display font-bold text-slate-900">
                        Find Your Booking
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        Booked as a guest? Enter your details below to view your itinerary.
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSearch}>
                            <div>
                                <label htmlFor="bookingRef" className="block text-sm font-bold text-slate-700 ml-1 mb-2">
                                    Booking Reference
                                </label>
                                <div className="relative group">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                    <input
                                        id="bookingRef"
                                        type="text"
                                        required
                                        placeholder="e.g. bk-1234..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-slate-700 ml-1 mb-2">
                                    Email Address used for booking
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="e.g. john@example.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 mt-2 group"
                            >
                                {loading ? (
                                    <><Loader2 size={20} className="animate-spin" /> Searching...</>
                                ) : (
                                    <>Find My Booking <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
