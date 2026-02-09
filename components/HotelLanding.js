import Link from 'next/link';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import ComingSoon from '@/components/ComingSoon';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Star, MapPin, CheckCircle } from 'lucide-react';
import RoomCard from '@/components/RoomCard';
import { motion } from 'framer-motion';

export default function HotelLanding({ hotel }) {
    const { user } = useAuth();

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

    // Placeholder video for demo purposes
    const heroVideo = hotel.heroVideoUrl || "https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_30fps.mp4";

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
            <section className="py-32 bg-slate-50 relative">
                <div className="container mx-auto px-4">
                    <div className="mb-16">
                        <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm mb-2 block animate-fade-in-up">Accommodations</span>
                        <div className="flex justify-between items-end flex-wrap gap-4 animate-fade-in-up delay-100">
                            <h2 className="text-5xl font-display font-bold text-slate-900">Find Your Sanctuary</h2>
                            <Link href={`/search?${defaultParams}`} className="group flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors">
                                View All Rooms <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <p className="text-slate-500 mt-4 max-w-2xl text-lg animate-fade-in-up delay-200">
                            Choose from our wide range of premium rooms and suites, designed for your ultimate comfort.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {hotel.roomTypes.slice(0, 3).map((room, index) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <RoomCard roomType={room} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Amenities Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 space-y-8 animate-fade-in-left">
                            <div>
                                <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm mb-2 block">Our Amenities</span>
                                <h2 className="text-5xl font-display font-bold text-slate-900 mb-6">Designed for your <br /> ultimate comfort.</h2>
                                <p className="text-slate-500 text-lg leading-relaxed">
                                    We go above and beyond to ensure your stay is memorable. From our world-class amenities to our personalized service, every detail is curated for you.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { icon: "Wifi", title: "High-Speed Wi-Fi", desc: "Stay connected everywhere." },
                                    { icon: "Tv", title: "Smart TV", desc: "Netflix, YouTube ready." },
                                    { icon: "Coffee", title: "Premium Dining", desc: "Culinary delights daily." },
                                    { icon: "Star", title: "5-Star Service", desc: "24/7 Concierge." }
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-50 p-6 rounded-2xl hover:bg-slate-100 transition-colors">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                                            {/* Icon mapping would go here, simplified for brevity */}
                                            <CheckCircle size={20} />
                                        </div>
                                        <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 relative animate-fade-in-right">
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000" alt="Amenities" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-2/3 border-8 border-white rounded-[2rem] overflow-hidden shadow-xl hidden md:block">
                                <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000" alt="Detail" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-primary-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8">Ready for an unforgettable stay?</h2>
                    <p className="text-primary-100 text-xl max-w-2xl mx-auto mb-12">Book directly with us for the best rates and exclusive amenities.</p>
                    <Link href={`/search?${defaultParams}`} className="inline-flex px-12 py-5 bg-white text-primary-700 font-bold text-lg rounded-full shadow-2xl hover:bg-slate-50 hover:scale-105 transition-all duration-300 items-center gap-3">
                        Book Your Stay Now <ArrowRight size={24} />
                    </Link>
                </div>
            </section>
        </Layout>
    );
}
