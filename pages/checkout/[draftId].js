import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { apiFetch } from '@/lib/api';
import { CreditCard, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPaymentPage() {
    const router = useRouter();
    const { draftId } = router.query;

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock Card State
    const [card, setCard] = useState({
        name: '',
        number: '',
        expiry: '',
        cvv: ''
    });

    useEffect(() => {
        if (draftId) {
            fetchBooking();
        }
    }, [draftId]);

    const fetchBooking = async () => {
        try {
            const data = await apiFetch(`/bookings/${draftId}`);
            setBooking(data);
        } catch (err) {
            console.error(err);
            toast.error('Could not load booking details.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        // Very basic frontend validation
        if (card.number.replace(/\s/g, '').length < 15) {
            toast.error('Please enter a valid card number');
            return;
        }
        if (!card.name || !card.expiry || !card.cvv) {
            toast.error('Please fill in all card details');
            return;
        }

        setIsProcessing(true);

        try {
            const response = await apiFetch(`/bookings/checkout/${draftId}`, {
                method: 'POST',
                body: JSON.stringify({
                    cardNumber: card.number.replace(/\s/g, ''),
                    cardName: card.name,
                    expiry: card.expiry,
                    cvv: card.cvv
                })
            });

            if (response.success) {
                toast.success('Payment successful!');
                // Redirect to the success page
                router.push(`/booking/confirmation?id=${booking.id}`);
            }
        } catch (err) {
            toast.error(err.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCard(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-medium">Securely loading checkout...</p>
                </div>
            </Layout>
        );
    }

    if (!booking) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle size={40} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">Booking Not Found</h1>
                    <p className="text-slate-500 max-w-md mb-8">We couldn't find the physical booking requested. It may have expired or you don't have permission to view it.</p>
                    <button onClick={() => router.push('/account/bookings')} className="btn-primary">Return to My Bookings</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head>
                <title>Secure Checkout - BookingKub</title>
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900">Secure Checkout</h1>
                        <p className="text-slate-500">Complete your payment to confirm this reservation.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Payment Form (Left Column) */}
                    <div className="flex-1 order-2 lg:order-1">
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <CreditCard className="text-primary-500" /> Payment Details
                                </h2>
                                <div className="flex gap-2">
                                    {/* Fake card icons */}
                                    <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">VISA</div>
                                    <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">MC</div>
                                </div>
                            </div>

                            <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Cardholder Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={card.name}
                                        onChange={handleInputChange}
                                        placeholder="E.g. JOHN DOE"
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none transition-all uppercase"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Card Number <span className="text-xs text-slate-400 font-normal ml-2">(Mock Card Accepted)</span></label>
                                    <input
                                        type="text"
                                        name="number"
                                        value={card.number}
                                        onChange={handleInputChange}
                                        placeholder="4242 4242 4242 4242"
                                        maxLength={19}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none transition-all font-mono tracking-widest text-lg"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Expiry Date</label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            value={card.expiry}
                                            onChange={handleInputChange}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none transition-all font-mono text-center"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">CVV</label>
                                        <input
                                            type="password"
                                            name="cvv"
                                            value={card.cvv}
                                            onChange={handleInputChange}
                                            placeholder="123"
                                            maxLength={4}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none transition-all font-mono text-center tracking-widest"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 mt-8">
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 relative overflow-hidden group"
                                    >
                                        {isProcessing ? (
                                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing Payment...</>
                                        ) : (
                                            <>
                                                Pay ฿{booking.totalAmount?.toLocaleString()} Now
                                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                                        <CheckCircle size={12} /> Your payment is encrypted and secure.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary (Right Column) */}
                    <div className="w-full lg:w-96 shrink-0 order-1 lg:order-2">
                        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl sticky top-28">
                            <h3 className="font-display font-bold text-xl mb-6">Reservation Summary</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400 text-sm">Booking Ref</span>
                                    <span className="font-mono bg-white/10 px-2 py-1 rounded text-sm">{booking.id.split('-')[0].toUpperCase()}</span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400 text-sm">Lead Guest</span>
                                    <span className="font-medium text-right">{booking.leadName}</span>
                                </div>

                                <hr className="border-white/10 my-4" />

                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400 text-sm">Check-in</span>
                                    <span className="font-bold">{new Date(booking.checkIn).toLocaleDateString()}</span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-slate-400 text-sm">Check-out</span>
                                    <span className="font-bold">{new Date(booking.checkOut).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mt-8">
                                <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-1">Total Amount</div>
                                <div className="text-4xl font-display font-black text-white">฿{booking.totalAmount?.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
