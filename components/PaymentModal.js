import { useState, useEffect, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { apiFetch } from '@/lib/api'
import { X, CreditCard, Lock, Banknote, Building, Loader2, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

function CheckoutForm({ amount, onSuccess, onError }) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!stripe || !elements) return

        setLoading(true)
        setErrorMessage(null)

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        })

        if (error) {
            setErrorMessage(error.message)
            onError && onError(error.message)
            setLoading(false)
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success('Payment Successful!')
            onSuccess && onSuccess(paymentIntent)
            setLoading(false)
        } else {
            setErrorMessage('Unexpected payment status.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {errorMessage && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-bold">
                    {errorMessage}
                </div>
            )}
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <Lock size={16} /> Pay ฿{amount.toLocaleString()}
                    </>
                )}
            </button>
        </form>
    )
}

export default function PaymentModal({ isOpen, onClose, booking, onSuccess }) {
    const [activeTab, setActiveTab] = useState('card')
    const [clientSecret, setClientSecret] = useState('')
    const [stripePromise, setStripePromise] = useState(null)
    const [error, setError] = useState(null)
    const [manualLoading, setManualLoading] = useState(false)
    const [reference, setReference] = useState('')

    // PromptPay states
    const [qrCodeUrl, setQrCodeUrl] = useState(null)
    const [promptPayLoading, setPromptPayLoading] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState('pending')
    const pollingInterval = useRef(null)

    // 1. Fetch Key & Init Stripe
    useEffect(() => {
        if (isOpen && activeTab === 'card') {
            apiFetch('/public-settings')
                .then(settings => {
                    if (settings.stripePublicKey) {
                        loadStripe(settings.stripePublicKey).then(setStripePromise)
                    } else {
                        setError('Payment System Error: Missing Configuration (Stripe Key)')
                    }
                })
                .catch(err => {
                    console.error(err)
                    setError('Failed to load payment configuration')
                })
        }
    }, [isOpen, activeTab])

    // 2. Create Intent (only if we have stripe promise)
    useEffect(() => {
        if (isOpen && booking && stripePromise && activeTab === 'card') {
            apiFetch('/payments/intent', {
                method: 'POST',
                body: JSON.stringify({
                    amount: booking.totalAmount,
                    currency: 'thb',
                    description: `Booking #${booking.id} - ${booking.roomName || 'Room'}`,
                    bookingId: booking.id
                })
            })
                .then(res => setClientSecret(res.clientSecret))
                .catch(err => {
                    console.error(err)
                    setError(err.message || 'Failed to initialize payment')
                })
        }
    }, [isOpen, booking, stripePromise, activeTab])

    // 3. Generate PromptPay QR Code
    useEffect(() => {
        if (isOpen && activeTab === 'promptpay' && !qrCodeUrl) {
            setPromptPayLoading(true);
            apiFetch('/payments/omise/promptpay', {
                method: 'POST',
                body: JSON.stringify({
                    amount: booking.totalAmount,
                    bookingId: booking.id,
                    description: `Booking #${booking.id}`
                })
            })
                .then(res => {
                    setQrCodeUrl(res.qrCodeUrl);
                    startPolling();
                })
                .catch(err => {
                    console.error(err);
                    setError('Failed to generate PromptPay QR code.');
                })
                .finally(() => setPromptPayLoading(false));
        }

        // Cleanup polling on tab change or close
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        }
    }, [isOpen, activeTab, booking]);

    const startPolling = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);

        pollingInterval.current = setInterval(async () => {
            try {
                const res = await apiFetch(`/bookings/${booking.id}`);
                if (res.status === 'confirmed' || res.status === 'checked_in') {
                    setPaymentStatus('success');
                    toast.success('Payment Received successfully!');
                    clearInterval(pollingInterval.current);
                    setTimeout(() => {
                        onSuccess && onSuccess();
                        onClose();
                    }, 2000);
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000); // Check every 5 seconds
    };

    const handleManualPayment = async (method) => {
        setManualLoading(true)
        try {
            await apiFetch('/payments/manual', {
                method: 'POST',
                body: JSON.stringify({
                    bookingId: booking.id,
                    amount: booking.totalAmount,
                    method,
                    reference
                })
            })
            toast.success(`Payment via ${method} recorded!`)
            onSuccess && onSuccess()
            onClose()
        } catch (err) {
            toast.error(err.message || 'Payment failed')
        } finally {
            setManualLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-slate-900 dark:text-white">Payment</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 shrink-0">
                    <button
                        onClick={() => setActiveTab('card')}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'card'
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <CreditCard size={16} /> Card
                    </button>
                    <button
                        onClick={() => setActiveTab('cash')}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'cash'
                            ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Banknote size={16} /> Cash
                    </button>
                    <button
                        onClick={() => setActiveTab('promptpay')}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'promptpay'
                            ? 'bg-[url("/promptpay-bg.svg")] bg-cover bg-center text-[#113566] shadow-sm border border-[#113566]/20 relative overflow-hidden'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        {activeTab === 'promptpay' && <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px]"></div>}
                        <span className="relative z-10 flex items-center gap-2">
                            <QrCode size={16} /> PromptPay
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('transfer')}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'transfer'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Building size={16} /> Transfer
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="mb-6 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500 font-bold">Total Amount</span>
                            <span className="text-slate-900 dark:text-white font-bold">฿{booking?.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>ref: {booking?.id?.slice(0, 8)}</span>
                        </div>
                    </div>

                    {activeTab === 'card' && (
                        <>
                            {error ? (
                                <div className="text-center text-rose-500 font-bold p-4 bg-rose-50 rounded-xl">
                                    {error}
                                </div>
                            ) : clientSecret && stripePromise ? (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutForm
                                        amount={booking.totalAmount}
                                        onSuccess={(pi) => {
                                            onSuccess && onSuccess(pi)
                                            setTimeout(onClose, 2000)
                                        }}
                                    />
                                </Elements>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    <span className="text-xs font-bold">Initializing Secure Connection...</span>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'cash' && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <Banknote size={32} />
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">
                                Confirm receipt of <b>฿{booking?.totalAmount?.toLocaleString()}</b> in cash from the guest.
                            </p>
                            <button
                                onClick={() => handleManualPayment('CASH')}
                                disabled={manualLoading}
                                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {manualLoading ? <Loader2 className="animate-spin" /> : 'Confirm Cash Payment'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'transfer' && (
                        <div className="space-y-4">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building size={32} />
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm">
                                    Enter bank transfer details / reference number.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Reference / Slip ID (Optional)</label>
                                <input
                                    type="text"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="e.g. 0123456789"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                />
                            </div>
                            <button
                                onClick={() => handleManualPayment('BANK_TRANSFER')}
                                disabled={manualLoading}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {manualLoading ? <Loader2 className="animate-spin" /> : 'Confirm Transfer'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'promptpay' && (
                        <div className="flex flex-col items-center pb-6">
                            {paymentStatus === 'success' ? (
                                <div className="flex flex-col items-center text-center space-y-4 py-8">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                                        <Lock size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">Payment Secure</h3>
                                    <p className="text-slate-500">Your PromptPay transaction was instantly verified.</p>
                                </div>
                            ) : promptPayLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#113566]" />
                                    <span className="text-sm font-bold">Generating unique Thai QR...</span>
                                </div>
                            ) : error && !qrCodeUrl ? (
                                <div className="text-center text-rose-500 font-bold p-4 bg-rose-50 rounded-xl w-full">
                                    {error}
                                </div>
                            ) : qrCodeUrl ? (
                                <div className="text-center w-full max-w-sm mx-auto">
                                    <div className="bg-[#113566] text-white p-3 rounded-t-2xl flex items-center justify-center gap-2">
                                        <span className="font-bold text-lg tracking-widest">Thai QR Payment</span>
                                    </div>
                                    <div className="bg-white p-8 rounded-b-2xl border-x border-b border-slate-200 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-blue-500 to-[#113566]"></div>
                                        <img src={qrCodeUrl} alt="PromptPay QR Code" className="w-full h-auto object-contain mx-auto" style={{ mixBlendMode: 'multiply' }} />

                                        <div className="mt-6 pt-6 border-t border-slate-100">
                                            <p className="text-sm font-bold text-slate-800">Scan with any Thai banking app</p>
                                            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500 bg-slate-50 py-2 px-3 rounded-lg border border-slate-100">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Awaiting payment confirmation...
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
