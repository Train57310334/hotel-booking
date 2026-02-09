import { CalendarDays, CreditCard, Users, BarChart3, Globe, ShieldCheck } from 'lucide-react';

const features = [
    {
        icon: CalendarDays,
        title: 'Smart Calendar',
        description: 'Drag-and-drop bookings, view availability at a glance, and manage room assignments effortlessly.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        icon: Globe,
        title: 'Direct Booking Engine',
        description: 'Commission-free bookings directly from your website. Customizable to match your brand.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    {
        icon: CreditCard,
        title: 'Automated Payments',
        description: 'Securely collect payments via Stripe or Omise. Handle deposits and refunds automatically.',
        color: 'text-violet-500',
        bg: 'bg-violet-500/10'
    },
    {
        icon: Users,
        title: 'Guest Management',
        description: 'Keep track of guest preferences, history, and loyalty. deliver personalized experiences.',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
    {
        icon: BarChart3,
        title: 'Insightful Reports',
        description: 'Track revenue, occupancy rates, and RevPAR. Make data-driven decisions to grow your business.',
        color: 'text-rose-500',
        bg: 'bg-rose-500/10'
    },
    {
        icon: ShieldCheck,
        title: 'Role-Based Access',
        description: 'Secure your data with granular permissions for owners, managers, and receptionists.',
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10'
    }
];

export default function Features() {
    return (
        <section className="py-24 bg-slate-50" id="features">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-lg font-bold text-primary-600 uppercase tracking-wide mb-2">Power Features</h2>
                    <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Everything you need to scale.</h3>
                    <p className="text-slate-500 text-lg">
                        Built for modern hoteliers who want to spend less time on admin and more time on guests.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                                <feature.icon size={28} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                            <p className="text-slate-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
