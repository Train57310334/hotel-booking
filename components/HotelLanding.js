import Link from 'next/link';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import ComingSoon from '@/components/ComingSoon';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Star, MapPin, CheckCircle, Wifi, Tv, Coffee } from 'lucide-react';
import RoomCard from '@/components/RoomCard';
import { motion } from 'framer-motion';

export default function HotelLanding({ hotel }) {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Use dynamic content or fallbacks
    const heroTitle = hotel.heroTitle || `Welcome to ${hotel.name}`;
    const heroDescription = hotel.heroDescription || hotel.description || "Experience luxury and comfort in the heart of the city.";
    const heroImage = hotel.imageUrl || "/images/hero-bg.png"; // Fallback image

    // Default parameters for links
    const now = new Date();
    const tmr = new Date(now);
    tmr.setDate(now.getDate() + 1);
    const formatDate = (d) => d.toISOString().split('T')[0];

    const defaultParams = `checkIn=${formatDate(now)}&checkOut=${formatDate(tmr)}&guests=1`;

    // 🔌 SAAS MODE: If hotel has no room types, show Coming Soon
    if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
        return <ComingSoon hotelName={hotel.name} />;
    }

    // Placeholder video for demo purposes. Force fallback if empty string or null.
    const heroVideo = hotel.heroVideoUrl?.trim() ? hotel.heroVideoUrl : "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

    return (
        <Layout navbarProps={{ logo: hotel.logoUrl, brandName: hotel.heroTitle ? hotel.name : 'BookingKub' }}>
            {/* Hero Section */}
            <Hero
                title={heroTitle}
                description={heroDescription}
                backgroundImage={heroImage}
                backgroundVideo={heroVideo}
            >
                <SearchBar />
            </Hero>

            {/* Featured Rooms Section */}
            <section className="py-24 bg-slate-50 relative">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div className="space-y-2">
                            <div className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-xs animate-fade-in-up">Accommodations</div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 leading-tight">{t('landing.findSanctuary')}</h2>
                        </div>
                        <Link href={`/search?${defaultParams}`} className="group flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors pb-2">
                            {t('landing.viewRooms')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {hotel.roomTypes.slice(0, 3).map((room, index) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                            >
                                <RoomCard
                                    roomType={room}
                                    availability={5} /* Mock availability for landing */
                                    ratePlans={[{ name: "Standard Rate", pricePerNight: 990, cancellation: "Free Cancel", includesBreakfast: true }]}
                                    onBook={() => window.location.href = `/search?${defaultParams}`}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Amenities Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        {/* Text Content */}
                        <div className="flex-1 order-2 lg:order-1 space-y-8 animate-fade-in-left">
                            <div className="space-y-4">
                                <span className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-xs">{t('landing.ourAmenities')}</span>
                                <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 leading-tight">
                                    {t('landing.comfortTitle')} <br /><span className="text-slate-400">{t('landing.comfortSubtitle')}</span>
                                </h2>
                                <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
                                    {t('landing.comfortDesc')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: Wifi, title: "High-Speed Wi-Fi", desc: "Stay connected everywhere." },
                                    { icon: Tv, title: "Smart TV", desc: "Netflix, YouTube ready." },
                                    { icon: Coffee, title: "Premium Dining", desc: "Culinary delights daily." },
                                    { icon: Star, title: "5-Star Service", desc: "24/7 Concierge." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                                            <item.icon size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                                            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Showcase */}
                        <div className="flex-1 order-1 lg:order-2 w-full">
                            <div className="relative">
                                {/* Main large image */}
                                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 aspect-[4/3] w-full">
                                    <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000" alt="Amenities" className="w-full h-full object-cover" />
                                </div>

                                {/* Floating smaller image */}
                                <div className="absolute -bottom-10 -left-10 w-2/3 rounded-3xl overflow-hidden shadow-2xl border-8 border-white hidden md:block z-20 aspect-video">
                                    <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000" alt="Detail" className="w-full h-full object-cover" />
                                </div>

                                {/* Abstract decorative elements */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl -z-10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-slate-200 rounded-[3rem] -z-10 rotate-3" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 relative overflow-hidden bg-slate-900 text-white">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1571896349842-6e5c48dc52e3?q=80&w=2000" className="w-full h-full object-cover opacity-20" alt="CTA BG" />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 to-slate-900/80" />
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">{t('landing.readyStay')}</h2>
                        <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10">
                            {t('landing.bookDirectly')}
                        </p>
                        <Link href={`/search?${defaultParams}`} className="inline-flex items-center gap-3 bg-white text-emerald-900 font-bold text-lg px-10 py-5 rounded-full shadow-2xl hover:scale-105 hover:bg-emerald-50 transition-all duration-300">
                            {t('landing.bookStay')} <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}
