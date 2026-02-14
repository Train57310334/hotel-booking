import { X, Check, Star, Zap, Shield, Sparkles, Loader2, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { apiFetch } from '@/lib/api'
import { useAdmin } from '@/contexts/AdminContext'
import toast from 'react-hot-toast'

function CheckoutForm({ onSuccess, onError }) {
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
            toast.success('Upgrade Successful!')
            onSuccess && onSuccess()
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
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        Confirm Upgrade <Zap size={18} className="group-hover:text-yellow-300 transition-colors" />
                    </>
                )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
                Secure payment via Stripe. Cancel anytime.
            </p>
        </form>
    )
}

export default function UpgradeModal({ isOpen, onClose }) {
    const { currentHotel } = useAdmin()
    const [success, setSuccess] = useState(false)
    const [clientSecret, setClientSecret] = useState('')
    const [stripePromise, setStripePromise] = useState(null)
    const [error, setError] = useState(null)

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setSuccess(false)
            setError(null)
            setClientSecret('')
        }
    }, [isOpen])

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

    // 2. Create Upgrade Intent
    useEffect(() => {
        if (isOpen && currentHotel && stripePromise) {
            apiFetch(`/hotels/${currentHotel.id}/upgrade`, {
                method: 'POST'
            })
                .then(res => setClientSecret(res.clientSecret))
                .catch(err => {
                    console.error(err)
                    setError(err.message || 'Failed to initialize upgrade payment')
                })
        }
    }, [isOpen, currentHotel, stripePromise])

    if (!isOpen) return null

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Check size={32} strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Upgrade Successful!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Your hotel is now on the <b>PRO</b> plan. Enjoy unlimited rooms and advanced features!
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header with Gradient */}
                <div className="bg-slate-900 text-white p-6 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10">
                        <X size={24} />
                    </button>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-300 mb-3 border border-white/10 uppercase tracking-wider">
                            <Sparkles size={12} /> Recommended
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-2">Upgrade to PRO</h2>
                        <p className="text-slate-300">Unlock the full potential of your hotel management system.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex items-end gap-2 mb-6">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">฿990</span>
                        <span className="text-slate-500 dark:text-slate-400 mb-1">/ month</span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <FeatureItem icon={<Zap className="text-amber-500" />} title="Unlimited Rooms" desc="Remove the 5-room limit and manage your entire property." />
                        <FeatureItem icon={<Shield className="text-emerald-500" />} title="Automated Payments" desc="Accept credit cards via Stripe/Omise directly." />
                        <FeatureItem icon={<Star className="text-blue-500" />} title="Advanced Analytics" desc="Deep dive into occupancy rates, RevPAR, and trends." />
                        <FeatureItem icon={<Check className="text-slate-400" />} title="Priority Support" desc="24/7 dedicated support channel." />
                    </div>

                    {/* Payment Form */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                        {error ? (
                            <div className="text-center text-rose-500 font-bold p-4 bg-rose-50 rounded-xl mb-4">
                                {error}
                            </div>
                        ) : clientSecret && stripePromise ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <CheckoutForm onSuccess={() => setSuccess(true)} />
                            </Elements>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                <span className="text-xs font-bold">Initializing Secure Connection...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureItem({ icon, title, desc }) {
    return (
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
