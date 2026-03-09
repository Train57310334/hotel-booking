import Link from 'next/link';
import { Check, Package, Rocket, Zap, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { motion } from 'framer-motion';

const iconMap = {
    Package,
    Rocket,
    Zap,
    Crown
};

const plansColorMap = {
    slate: {
        borderPopular: 'border-slate-500',
        shadowPopular: 'shadow-[0_0_50px_-12px_rgba(100,116,139,0.3)]',
        badgeBg: 'bg-gradient-to-r from-slate-600 to-slate-400',
        badgeShadow: 'shadow-slate-500/30',
        titleText: 'text-slate-600',
        iconBg: 'bg-slate-100',
        checkBgPopular: 'bg-slate-100',
        checkTextPopular: 'text-slate-600',
        btnBgPopular: 'bg-gradient-to-r from-slate-600 to-slate-500',
        btnHoverPopular: 'hover:from-slate-500 hover:to-slate-400',
        btnShadowPopular: 'shadow-slate-500/30'
    },
    emerald: {
        borderPopular: 'border-emerald-400',
        shadowPopular: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]',
        badgeBg: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
        badgeShadow: 'shadow-emerald-500/30',
        titleText: 'text-emerald-600',
        iconBg: 'bg-emerald-100',
        checkBgPopular: 'bg-emerald-100',
        checkTextPopular: 'text-emerald-600',
        btnBgPopular: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
        btnHoverPopular: 'hover:from-emerald-500 hover:to-emerald-400',
        btnShadowPopular: 'shadow-emerald-500/30'
    },
    indigo: {
        borderPopular: 'border-indigo-400',
        shadowPopular: 'shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]',
        badgeBg: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
        badgeShadow: 'shadow-indigo-500/30',
        titleText: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        checkBgPopular: 'bg-indigo-100',
        checkTextPopular: 'text-indigo-600',
        btnBgPopular: 'bg-gradient-to-r from-indigo-600 to-indigo-500',
        btnHoverPopular: 'hover:from-indigo-500 hover:to-indigo-400',
        btnShadowPopular: 'shadow-indigo-500/30'
    },
    primary: {
        borderPopular: 'border-primary-400',
        shadowPopular: 'shadow-[0_0_50px_-12px_rgba(14,165,233,0.3)]',
        badgeBg: 'bg-gradient-to-r from-primary-600 to-primary-400',
        badgeShadow: 'shadow-primary-500/30',
        titleText: 'text-primary-600',
        iconBg: 'bg-primary-100',
        checkBgPopular: 'bg-primary-100',
        checkTextPopular: 'text-primary-600',
        btnBgPopular: 'bg-gradient-to-r from-primary-600 to-primary-500',
        btnHoverPopular: 'hover:from-primary-500 hover:to-primary-400',
        btnShadowPopular: 'shadow-primary-500/30'
    }
};

export default function Pricing({ saasSettings }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const title = saasSettings?.landingPricingTitle || "Simple Pricing";
    const subtitle = saasSettings?.landingPricingSubtitle || "Start free, upgrade as you grow.";

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
        <section className="py-24 bg-white relative" id="pricing">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-2xl mx-auto mb-16"
                >
                    <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">{title}</h2>
                    <h3 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-5 tracking-tight">{subtitle}</h3>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Transparent pricing with no hidden fees. Cancel anytime.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {plans.map((plan, idx) => {
                        const Icon = iconMap[plan.icon] || Zap;
                        const pColor = plansColorMap[plan.color] || plansColorMap.slate;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: idx * 0.15 }}
                                className={`relative p-8 rounded-3xl border flex flex-col transition-all duration-300 ${plan.isPopular
                                    ? `${pColor.borderPopular} ${pColor.shadowPopular} md:scale-105 z-10 bg-white`
                                    : 'border-slate-200/60 bg-slate-50 hover:shadow-xl hover:-translate-y-1'
                                    }`}
                            >
                                {plan.isPopular && (
                                    <>
                                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${pColor.badgeBg} text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg ${pColor.badgeShadow}`}>
                                            Most Popular
                                        </div>
                                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50" />
                                    </>
                                )}

                                <div className="mb-8">
                                    <h4 className={`text-xl font-bold flex items-center gap-3 mb-4 ${plan.isPopular ? pColor.titleText : 'text-slate-700'}`}>
                                        <div className={`p-2 rounded-xl ${plan.isPopular ? pColor.iconBg : 'bg-slate-200/50'}`}>
                                            <Icon size={20} strokeWidth={2} />
                                        </div>
                                        {plan.name}
                                    </h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{plan.priceLabel}</span>
                                        <span className="text-slate-500 text-sm font-medium">/{plan.period}</span>
                                    </div>
                                    <p className="text-slate-500 mt-4 text-sm leading-relaxed min-h-[44px]">{plan.description}</p>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {plan.features && plan.features.map((feat, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full ${plan.isPopular ? pColor.checkBgPopular : 'bg-emerald-50'} flex items-center justify-center shrink-0`}>
                                                <Check size={12} className={plan.isPopular ? pColor.checkTextPopular : 'text-emerald-500'} strokeWidth={3} />
                                            </div>
                                            {feat}
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={`/auth/register?plan=${plan.id}`}
                                    className={`w-full py-4 text-sm rounded-2xl font-bold text-center transition-all duration-300 ${plan.isPopular
                                        ? `${pColor.btnBgPopular} text-white ${pColor.btnHoverPopular} shadow-xl ${pColor.btnShadowPopular} hover:-translate-y-0.5`
                                        : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                        }`}
                                >
                                    Start with {plan.name}
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
