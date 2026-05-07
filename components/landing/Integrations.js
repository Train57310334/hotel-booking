import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Integrations() {
    const { t } = useLanguage();

    const partners = [
        { name: 'Agoda', logo: '/img/partners/agoda.svg', width: 'w-24' },
        { name: 'Booking.com', logo: '/img/partners/booking.svg', width: 'w-32' },
        { name: 'Expedia', logo: '/img/partners/expedia.svg', width: 'w-28' },
        { name: 'Stripe', logo: '/img/partners/stripe.svg', width: 'w-20' },
        { name: 'LINE', logo: '/img/partners/line.svg', width: 'w-16' },
        { name: 'Airbnb', logo: '/img/partners/airbnb.svg', width: 'w-24' }
    ];

    return (
        <section className="py-24 bg-[#0A0F1C]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] mb-4"
                    >
                        {t('integrations.title') || 'Sync With World-Class Platforms'}
                    </motion.h3>
                    <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full opacity-50" />
                </div>

                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    {partners.map((partner, idx) => (
                        <motion.div
                            key={partner.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`${partner.width} h-8 flex items-center justify-center`}
                        >
                            {/* In a real app we'd use images, here we use text/placeholder style since we don't have SVGs yet */}
                            <span className="text-white font-bold text-xl tracking-tighter opacity-80">{partner.name}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-400 text-sm italic">
                        {t('integrations.andMore') || 'And 50+ other OTAs and payment gateways...'}
                    </p>
                </div>
            </div>
        </section>
    );
}
