import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { apiFetch } from '@/lib/api'
import { X, CreditCard, Lock } from 'lucide-react'
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
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    const [clientSecret, setClientSecret] = useState('')
    const [stripePromise, setStripePromise] = useState(null)
    const [error, setError] = useState(null)

    // 1. Fetch Key & Init Stripe
    useEffect(() => {
        if (isOpen) {
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
    }, [isOpen])

    // 2. Create Intent (only if we have stripe promise)
    useEffect(() => {
        if (isOpen && booking && stripePromise) {
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
                    toast.error('Failed to initialize payment')
                    onClose()
                })
        }
    }, [isOpen, booking, stripePromise])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Secure Payment</h3>
                            <p className="text-xs text-slate-500">Encrypted via Stripe</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-500 font-bold">Total Amount</span>
                            <span className="text-slate-900 dark:text-white font-bold">฿{booking?.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>ref: {booking?.id?.slice(0, 8)}</span>
                        </div>
                    </div>

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
                            <span className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                            <span className="text-xs font-bold">Initializing Secure Connection...</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 text-center border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Lock size={10} /> Payments are processed securely by Stripe. No card data is stored on our servers.
                    </p>
                </div>
            </div>
        </div>
    )
}
