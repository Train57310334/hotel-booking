import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Lite',
        price: 'Free',
        period: 'Forever',
        description: 'Perfect for small guesthouses and startups.',
        features: [
            '1 Property',
            'Up to 5 Rooms',
            'Direct Booking Page',
            'Basic Calendar',
            'Manual Payments',
            'Email Support'
        ],
        cta: 'Start for Free',
        ctaLink: '/partner/register?plan=lite',
        popular: false
    },
    {
        name: 'Pro',
        price: '฿990',
        period: '/month',
        description: 'Everything you need for a growing hotel business.',
        features: [
            'Unlimited Rooms',
            'Channel Manager Sync',
            'Automated Payments (Stripe/Omise)',
            'Advanced Analytics & Reports',
            'Multiple Staff Accounts',
            'Priority Support 24/7'
        ],
        cta: 'Start Pro Trial',
        ctaLink: '/partner/register?plan=pro',
        popular: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For chains and large scale operations.',
        features: [
            'Multi-Property Management',
            'API Access',
            'Custom Branding (White Label)',
            'Dedicated Account Manager',
            'On-site Training',
            'SLA Guarantee'
        ],
        cta: 'Contact Sales',
        ctaLink: '/contact',
        popular: false
    }
];

export default function Pricing() {
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
                    {plans.map((plan, idx) => (
                        <div key={idx} className={`relative p-8 rounded-3xl border flex flex-col ${plan.popular ? 'border-primary-500 shadow-2xl scale-105 z-10 bg-white' : 'border-slate-200 bg-slate-50'
                            }`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h4 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h4>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>
                                <p className="text-slate-500 mt-4 text-sm leading-relaxed min-h-[40px]">{plan.description}</p>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-emerald-600" />
                                        </div>
                                        {feat}
                                    </div>
                                ))}
                            </div>

                            <Link
                                href={plan.ctaLink}
                                className={`w-full py-4 rounded-xl font-bold text-center transition-all ${plan.popular
                                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-primary-500/30'
                                    : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
