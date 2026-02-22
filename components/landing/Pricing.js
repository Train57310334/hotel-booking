import Link from 'next/link';
import { Check, Package, Rocket, Zap, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const iconMap = {
    Package,
    Rocket,
    Zap,
    Crown
};

export default function Pricing() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiFetch('/subscriptions/plans');
                setPlans(data || []);
            } catch (err) {
                console.error("Failed to fetch plans", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) {
        return (
            <div className="py-24 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
        );
    }
    return (
        <section className="py-24 bg-white" id="pricing">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-lg font-bold text-emerald-600 uppercase tracking-wide mb-2">Simple Pricing</h2>
                    <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Start free, upgrade as you grow.</h3>
                    <p className="text-slate-500 text-lg">
                        Transparent pricing with no hidden fees. Cancel anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => {
                        const Icon = iconMap[plan.icon] || Zap;
                        return (
                            <div key={plan.id} className={`relative p-8 rounded-3xl border flex flex-col ${plan.isPopular ? `border-${plan.color}-500 shadow-2xl scale-105 z-10 bg-white` : 'border-slate-200 bg-slate-50'
                                }`}>
                                {plan.isPopular && (
                                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-${plan.color}-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg`}>
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h4 className={`text-xl font-bold flex items-center gap-2 mb-2 text-${plan.color}-600`}>
                                        <Icon size={20} />
                                        {plan.name}
                                    </h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-slate-900">{plan.priceLabel}</span>
                                        <span className="text-slate-500">{plan.period}</span>
                                    </div>
                                    <p className="text-slate-500 mt-4 text-sm leading-relaxed min-h-[40px]">{plan.description}</p>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {plan.features && plan.features.map((feat, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full bg-${plan.color}-100 flex items-center justify-center shrink-0`}>
                                                <Check size={12} className={`text-${plan.color}-600`} />
                                            </div>
                                            {feat}
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={`/auth/register?plan=${plan.id}`}
                                    className={`w-full py-4 rounded-xl font-bold text-center transition-all ${plan.isPopular
                                        ? `bg-${plan.color}-600 text-white hover:bg-${plan.color}-700 shadow-lg hover:shadow-${plan.color}-500/30`
                                        : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    Start with {plan.name}
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
