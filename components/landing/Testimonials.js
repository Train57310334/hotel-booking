import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
    const { t } = useLanguage();

    const testimonials = [
        {
            id: 1,
            name: 'K. Somchai',
            role: 'Owner, Riverside Boutique Hotel',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            content: t('testimonial.1.content') || 'Since switching to BookingKub, our direct bookings have increased by 40%. The channel manager is a lifesaver!',
            rating: 5
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            role: 'Manager, Ocean View Resort',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
            content: t('testimonial.2.content') || 'The interface is so intuitive. My staff learned to use the calendar and housekeeping features in just one afternoon.',
            rating: 5
        },
        {
            id: 3,
            name: 'K. Ananya',
            role: 'GM, Mountain Hideaway',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
            content: t('testimonial.3.content') || 'Automated yield management helped us maximize revenue during the peak season without manual price adjustments.',
            rating: 5
        }
    ];

    return (
        <section className="py-24 bg-[#0A0F1C] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-display font-extrabold text-white mb-6"
                    >
                        {t('testimonial.title') || 'Trusted by Hoteliers Worldwide'}
                    </motion.h2>
                    <p className="text-slate-400 text-lg">
                        {t('testimonial.subtitle') || "Don't just take our word for it. Here's what our partners say about BookingKub."}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 relative group hover:border-blue-500/30 transition-all duration-300"
                        >
                            <Quote className="absolute top-6 right-8 text-blue-500/20 group-hover:text-blue-500/40 transition-colors" size={40} />
                            
                            <div className="flex gap-1 mb-6">
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            <p className="text-slate-300 italic mb-8 leading-relaxed">
                                "{item.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20" />
                                <div>
                                    <h4 className="text-white font-bold">{item.name}</h4>
                                    <p className="text-slate-500 text-xs">{item.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
