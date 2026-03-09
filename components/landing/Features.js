import { CalendarDays, CreditCard, Users, BarChart3, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        icon: CalendarDays,
        title: 'Smart Calendar',
        description: 'Drag-and-drop bookings, view availability at a glance, and manage room assignments effortlessly.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        hoverGradient: 'to-blue-100'
    },
    {
        icon: Globe,
        title: 'Direct Booking Engine',
        description: 'Commission-free bookings directly from your website. Customizable to match your brand.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        hoverGradient: 'to-emerald-100'
    },
    {
        icon: CreditCard,
        title: 'Automated Payments',
        description: 'Securely collect payments via Stripe or Omise. Handle deposits and refunds automatically.',
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        hoverGradient: 'to-violet-100'
    },
    {
        icon: Users,
        title: 'Guest Management',
        description: 'Keep track of guest preferences, history, and loyalty. deliver personalized experiences.',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        hoverGradient: 'to-amber-100'
    },
    {
        icon: BarChart3,
        title: 'Insightful Reports',
        description: 'Track revenue, occupancy rates, and RevPAR. Make data-driven decisions to grow your business.',
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        hoverGradient: 'to-rose-100'
    },
    {
        icon: ShieldCheck,
        title: 'Role-Based Access',
        description: 'Secure your data with granular permissions for owners, managers, and receptionists.',
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
        hoverGradient: 'to-cyan-100'
    }
];

export default function Features({ saasSettings }) {
    const title = saasSettings?.landingFeaturesTitle || "Power Features";
    const subtitle = saasSettings?.landingFeaturesSubtitle || "Everything you need to scale.";

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden" id="features">
            {/* Soft background decoration */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-2xl mx-auto mb-16"
                >
                    <h2 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-3">{title}</h2>
                    <h3 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-5 tracking-tight">{subtitle}</h3>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Built for modern hoteliers who want to spend less time on admin and more time on guests.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent ${feature.hoverGradient} opacity-0 group-hover:opacity-30 rounded-bl-full transition-opacity duration-500`} />

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${feature.bg} ${feature.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                <feature.icon size={28} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">{feature.title}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
