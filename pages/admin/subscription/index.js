import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch } from '@/lib/api';
import { CheckCircle2, Crown, Zap, Shield, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
    const { user, checkUser } = useAuth();
    const { currentHotel, fetchHotels } = useAdmin() || {};
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [upgradingTo, setUpgradingTo] = useState(null);

    // Enforce role
    useEffect(() => {
        if (user && !user.roles?.includes('owner') && !user.roles?.includes('hotel_admin') && !user.roles?.includes('platform_admin')) {
            router.push('/admin');
        }
    }, [user, router]);

    const handleUpgrade = async (planName) => {
        if (currentHotel?.package === planName) return;

        setUpgradingTo(planName);
        try {
            const res = await apiFetch('/subscriptions/upgrade', {
                method: 'POST',
                body: JSON.stringify({
                    hotelId: currentHotel.id,
                    package: planName
                })
            });

            if (res.success) {
                toast.success(`Successfully upgraded to ${planName}! 🎉`);
                await checkUser(); // Refresh user roles/limits
                if (fetchHotels) await fetchHotels(); // Refresh hotel contexts
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
            toast.error(error.message || 'Failed to upgrade subscription');
        } finally {
            setUpgradingTo(null);
        }
    };

    const plans = [
        {
            name: 'LITE',
            price: 'Free',
            period: 'forever',
            icon: Shield,
            color: 'slate',
            description: 'Perfect for small properties just starting out.',
            features: [
                'Up to 5 Rooms',
                'Basic Booking Engine',
                '1 Staff Account',
                'Standard Support'
            ],
            limits: { maxRooms: 5, hasOnlinePayment: false }
        },
        {
            name: 'PRO',
            price: '฿990',
            period: 'per month',
            icon: Zap,
            color: 'indigo',
            popular: true,
            description: 'Everything you need to grow your hotel business.',
            features: [
                'Up to 50 Rooms',
                'Online Payment Gateway (Stripe/Omise)',
                'Promotions & Discounts',
                '5 Staff Accounts',
                'Priority Support'
            ],
            limits: { maxRooms: 50, hasOnlinePayment: true }
        },
        {
            name: 'ENTERPRISE',
            price: 'Custom',
            period: 'contact us',
            icon: Crown,
            color: 'emerald',
            description: 'Unlimited power for multi-property chains.',
            features: [
                'Unlimited Rooms',
                'Unlimited Staff Accounts',
                'Advanced Custom Analytics',
                'White-glove Onboarding',
                '24/7 Dedicated Account Manager'
            ],
            limits: { maxRooms: 9999, hasOnlinePayment: true }
        }
    ];

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto pb-20 p-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
                        Upgrade Your Plan
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        Choose the perfect package to power {currentHotel?.name || 'your hotel'}. Upgrade anytime to unlock more rooms and features.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan) => {
                        const isActive = currentHotel?.package === plan.name;
                        const isUpgradingThis = upgradingTo === plan.name;

                        return (
                            <div
                                key={plan.name}
                                className={`relative bg-white dark:bg-slate-800 rounded-3xl p-8 border-2 transition-all ${isActive ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' :
                                        plan.popular ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105 z-10' :
                                            'border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-300'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-indigo-500/30">
                                        Most Popular
                                    </div>
                                )}

                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/30">
                                        Current Plan
                                    </div>
                                )}

                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${plan.color === 'slate' ? 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                                        plan.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                                            'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                    <plan.icon size={28} />
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                                    <span className="text-sm font-medium text-slate-500">/{plan.period}</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 line-clamp-2">
                                    {plan.description}
                                </p>

                                <button
                                    onClick={() => handleUpgrade(plan.name)}
                                    disabled={isActive || !!upgradingTo}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' :
                                            plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20' :
                                                'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                                        } disabled:opacity-50`}
                                >
                                    {isUpgradingThis ? <Loader2 className="animate-spin" size={20} /> :
                                        isActive ? 'Current Plan' :
                                            <>Upgrade to {plan.name} <ArrowRight size={18} /></>}
                                </button>

                                <div className="mt-8 space-y-4">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">What's included</p>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className={`mt-0.5 shrink-0 ${isActive ? 'text-emerald-500' :
                                                        plan.popular ? 'text-indigo-500' :
                                                            'text-slate-400'
                                                    }`}>
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <span className="text-sm text-slate-600 dark:text-slate-300 leading-tight">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}
