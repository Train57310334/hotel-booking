import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Hotel, Calendar, Award } from 'lucide-react';

export default function TrustStats() {
    const { t } = useLanguage();

    const stats = [
        {
            id: 'hotels',
            label: t('stats.hotels') || 'Hotels Trust Us',
            value: '500+',
            icon: Hotel,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10'
        },
        {
            id: 'bookings',
            label: t('stats.bookings') || 'Bookings Managed',
            value: '1M+',
            icon: Calendar,
            color: 'text-teal-400',
            bg: 'bg-teal-400/10'
        },
        {
            id: 'users',
            label: t('stats.guests') || 'Happy Guests',
            value: '250k+',
            icon: Users,
            color: 'text-indigo-400',
            bg: 'bg-indigo-400/10'
        },
        {
            id: 'uptime',
            label: t('stats.uptime') || 'System Uptime',
            value: '99.9%',
            icon: Award,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10'
        }
    ];

    return (
        <section className="py-20 bg-[#0A0F1C] border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={stat.color} size={28} />
                            </div>
                            <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                                {stat.value}
                            </div>
                            <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
