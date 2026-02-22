import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import ConfirmationModal from '@/components/ConfirmationModal'
import { Crown, Check, Zap, Rocket, Package, AlertCircle, Building2, TicketPercent, CreditCard, Banknote, Users, BedDouble, X } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { apiFetch } from '@/lib/api'

export default function SubscriptionPage() {
    const { currentHotel, refreshHotelData } = useAdmin()
    const router = useRouter()
    const [loadingPlan, setLoadingPlan] = useState(null)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, planId: null })

    // Current limits based on the plan
    const currentPlan = currentHotel?.subscriptionPlan || 'LITE'

    const [plans, setPlans] = useState([])
    const [loadingPlans, setLoadingPlans] = useState(true)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiFetch('/subscriptions/plans')
                setPlans(data || [])
            } catch (error) {
                console.error('Failed to fetch plans:', error)
                toast.error('Failed to load subscription plans')
            } finally {
                setLoadingPlans(false)
            }
        }
        fetchPlans()
    }, [])

    useEffect(() => {
        if (!router.isReady) return;
        const { success, canceled, session_id } = router.query;

        if (success) {
            toast.success('Payment successful! Your subscription has been upgraded.');
            refreshHotelData();
            // Clean up the URL
            router.replace('/admin/subscription', undefined, { shallow: true });
        }

        if (canceled) {
            toast.error('Payment was canceled or failed. Please try again.');
            // Clean up the URL
            router.replace('/admin/subscription', undefined, { shallow: true });
        }
    }, [router.isReady, router.query]);

    const iconMap = {
        Package,
        Rocket,
        Zap,
        Crown
    }

    const handleUpgradeClick = (planId) => {
        if (currentPlan === planId) return
        setConfirmModal({ isOpen: true, planId })
    }

    const handleUpgrade = async () => {
        if (!confirmModal.planId) return
        const planId = confirmModal.planId
        setConfirmModal({ isOpen: false, planId: null })

        setLoadingPlan(planId)
        try {
            const data = await apiFetch('/subscriptions/checkout-session', {
                method: 'POST',
                body: JSON.stringify({ hotelId: currentHotel.id, planId: planId })
            })

            if (data.url) {
                // Redirect user to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error("Missing checkout URL");
            }
        } catch (error) {
            console.error('Upgrade failed:', error)
            toast.error(error.message || 'Failed to initiate checkout')
            setLoadingPlan(null)
        }
    }

    const getColorClasses = (color, isPopular, isActive) => {
        const base = 'relative overflow-hidden rounded-2xl border-2 transition-all p-8 flex flex-col bg-white dark:bg-slate-800'

        if (isActive) {
            return `${base} border-${color}-500 shadow-lg shadow-${color}-500/20`
        }

        if (isPopular) {
            return `${base} border-emerald-500 shadow-xl scale-105 z-10 hidden md:flex`
        }

        return `${base} border-transparent hover:border-slate-300 dark:hover:border-slate-600 shadow-sm opacity-90 hover:opacity-100`
    }

    const getButtonClasses = (color, isActive) => {
        if (isActive) {
            return `w-full py-3 px-4 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-default`
        }
        return `w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg bg-${color}-500 hover:bg-${color}-600 transition-colors`
    }

    if (!currentHotel) return null

    return (
        <AdminLayout>
            <Head>
                <title>Subscription & Billing | BookingKub</title>
            </Head>

            <div className="max-w-6xl mx-auto space-y-12 pb-12">
                {/* Header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto pt-8">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-3">
                        <Crown className="text-amber-500" size={40} />
                        Subscription Plans
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        Choose the right plan to power your hotel. Upgrade at any time to unlock more features and increase your room limit.
                    </p>
                </div>

                {/* Pricing Grid */}
                {loadingPlans ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
                        {plans.map((plan) => {
                            const Icon = iconMap[plan.icon] || Zap
                            const isActive = currentPlan === plan.id
                            const isLoading = loadingPlan === plan.id

                            // To handle Tailwind dynamic classes robustly we map them explicitly here
                            const bgColors = { slate: 'bg-slate-500', emerald: 'bg-emerald-500', indigo: 'bg-indigo-500' }
                            const textColors = { slate: 'text-slate-500', emerald: 'text-emerald-500', indigo: 'text-indigo-500' }
                            const borderColors = { slate: 'border-slate-500', emerald: 'border-emerald-500', indigo: 'border-indigo-500' }
                            const shadowColors = { slate: 'shadow-slate-500/20', emerald: 'shadow-emerald-500/20', indigo: 'shadow-indigo-500/20' }

                            let wrapperClasses = 'relative overflow-hidden rounded-3xl border-2 transition-all p-8 flex flex-col bg-white dark:bg-slate-800'
                            if (isActive) {
                                wrapperClasses += ` ${borderColors[plan.color]} ${shadowColors[plan.color]} shadow-2xl scale-105 z-20`
                            } else if (plan.popular) {
                                wrapperClasses += ` border-slate-200 dark:border-slate-700 shadow-xl opacity-95 hover:opacity-100 scale-100 md:scale-105 z-10`
                            } else {
                                wrapperClasses += ` border-slate-100 dark:border-slate-700 shadow-sm opacity-90 hover:opacity-100`
                            }

                            return (
                                <div key={plan.id} className={wrapperClasses}>
                                    {plan.isPopular && !isActive && (
                                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                                    )}
                                    {isActive && (
                                        <div className={`absolute top-0 inset-x-0 h-1.5 ${bgColors[plan.color]}`}></div>
                                    )}

                                    <div className="mb-6 flex justify-between items-start">
                                        <div>
                                            <div className={`flex items-center gap-2 font-bold ${textColors[plan.color]} mb-2`}>
                                                <Icon size={20} />
                                                {plan.name}
                                            </div>
                                            <div className="text-slate-500 dark:text-slate-400 text-sm h-10">{plan.description}</div>
                                        </div>
                                        {plan.isPopular && !isActive && (
                                            <span className={`bg-${plan.color}-100 text-${plan.color}-700 dark:bg-${plan.color}-500/20 dark:text-${plan.color}-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                                                Popular
                                            </span>
                                        )}
                                        {isActive && (
                                            <span className={`bg-${plan.color}-100 text-${plan.color}-700 dark:bg-${plan.color}-500/20 dark:text-${plan.color}-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1`}>
                                                <Check size={14} /> Active
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-8 flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.priceLabel}</span>
                                        {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
                                    </div>

                                    <button
                                        onClick={() => handleUpgradeClick(plan.id)}
                                        disabled={isActive || isLoading} // Prevent downgrade visually for now - simplified
                                        className={`w-full py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isActive
                                            ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 cursor-default'
                                            : `${bgColors[plan.color]} text-white shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`
                                            }`}
                                    >
                                        {isLoading ? (
                                            <span className="animate-pulse">Processing...</span>
                                        ) : isActive ? (
                                            'Current Plan'
                                        ) : (
                                            <>Upgrade to {plan.name} <Rocket size={18} /></>
                                        )}
                                    </button>

                                    <div className="mt-8 space-y-4 flex-1">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Features included</p>
                                        <ul className="space-y-3">
                                            {plan.features && plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                    <div className={`mt-0.5 rounded-full p-0.5 ${bgColors[plan.color]} text-white shrink-0`}>
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                            {plan.missingFeatures && plan.missingFeatures.map((feature, i) => (
                                                <li key={`m-${i}`} className="flex items-start gap-3 text-sm text-slate-400 decoration-slate-300">
                                                    <div className="mt-0.5 rounded-full p-0.5 bg-slate-200 dark:bg-slate-700 text-slate-400 shrink-0">
                                                        <X size={12} strokeWidth={3} />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Current Usage Section */}
                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm mt-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Room Capacity limit</h3>
                                <p className="text-sm text-slate-500">You are currently using {currentHotel.physicalRoomsCount || 0} rooms out of your limit.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-indigo-500">{currentHotel.physicalRoomsCount || 0}</span>
                                <span className="text-slate-400"> / {currentHotel.maxRooms === 9999 ? '∞' : currentHotel.maxRooms}</span>
                            </div>
                        </div>

                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-emerald-500`}
                                style={{ width: currentHotel.maxRooms === 9999 ? '20%' : `${Math.min(((currentHotel.physicalRoomsCount || 0) / (currentHotel.maxRooms || 10)) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, planId: null })}
                onConfirm={handleUpgrade}
                title={`Upgrade to ${confirmModal.planId}?`}
                message={`You will be redirected to our secure payment gateway to complete the transaction for the ${confirmModal.planId} package.`}
                type="info"
                confirmText="Proceed to Checkout"
            />
        </AdminLayout>
    )
}
