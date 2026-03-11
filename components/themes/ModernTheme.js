import Link from 'next/link';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import ComingSoon from '@/components/ComingSoon';
import RoomCard from '@/components/RoomCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Wifi, Tv, Coffee, Star, MapPin, ChevronRight, Check } from 'lucide-react';
import { useRef } from 'react';

export default function ModernTheme({ hotel }) {
    const { t } = useLanguage();

    // Parallax logic for Hero
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
        return <ComingSoon hotelName={hotel.name} />;
    }

    const heroTitle = hotel.heroTitle || `Welcome to ${hotel.name}`;
    const heroDescription = hotel.heroDescription || hotel.description || "Experience luxury and comfort in the heart of the city.";
    const heroImage = hotel.imageUrl || "/images/hero-bg.png";
    const heroVideo = hotel.heroVideoUrl || "https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_24fps.mp4"; // Modern city skyline fallback

    const defaultParams = `checkIn=${new Date().toISOString().split('T')[0]}&checkOut=${new Date(Date.now() + 86400000).toISOString().split('T')[0]}&guests=1`;

    return (
        <div className="bg-slate-950 min-h-screen text-slate-50 font-sans selection:bg-emerald-500/30">
            {/* Header / Navbar Replacement for Modern Theme */}
            <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4 transition-all">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {hotel.logoUrl ? (
                            <img src={hotel.logoUrl} alt={hotel.name} className="h-10 w-auto" />
                        ) : (
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl text-slate-950">
                                {hotel.name.charAt(0)}
                            </div>
                        )}
                        <span className="font-bold text-xl hidden sm:block tracking-tight text-white">{hotel.name}</span>
                    </div>
                    <Link href={`/search?${defaultParams}`} className="bg-white text-slate-950 hover:bg-emerald-400 hover:text-slate-950 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:-translate-y-0.5">
                        Book Now
                    </Link>
                </div>
            </header>

            {/* Immersive Hero */}
            <div className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
                <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
                    <video key={heroVideo} src={heroVideo} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
                </motion.div>

                <div className="container mx-auto px-6 relative z-10 text-center mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-6">
                            Luxury Redefined
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
                            {heroTitle}
                        </h1>
                        <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 font-light">
                            {heroDescription}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="max-w-4xl mx-auto backdrop-blur-2xl bg-white/5 border border-white/10 p-4 rounded-3xl shadow-2xl"
                    >
                        {/* We use the SearchBar component here but it will inherit some root styles if any, 
                            ideally we'd style it specifically for dark mode but standard SearchBar should work okay */}
                        <div className="dark-mode-search-wrapper">
                            <SearchBar />
                        </div>
                    </motion.div>
                </div>

                <motion.div style={{ opacity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <div className="w-8 h-12 rounded-full border-2 border-white/20 flex justify-center p-2">
                        <div className="w-1 h-3 bg-emerald-400 rounded-full animate-scroll" />
                    </div>
                </motion.div>
            </div>

            {/* Premium Features */}
            <section className="py-32 relative z-20 bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Wifi, title: "Fiber Internet", desc: "Gigabit connection in every room." },
                            { icon: Tv, title: "Smart Entertainment", desc: "85' OLED TVs with streaming." },
                            { icon: Coffee, title: "Artisan Dining", desc: "Michelin-star rated restaurant." },
                            { icon: Star, title: "Butler Service", desc: "Personalized 24/7 care." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                            >
                                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rooms Gallery */}
            <section className="py-32 bg-slate-900 border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">Exceptional Stays</h2>
                            <p className="text-slate-400 text-lg max-w-xl">Discover our carefully curated collection of rooms and suites designed for the ultimate comfort.</p>
                        </div>
                        <Link href={`/search?${defaultParams}`} className="flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors group">
                            Explore All Rooms <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {hotel.roomTypes.slice(0, 3).map((room, index) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="group"
                            >
                                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
                                    <img
                                        src={room.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000'}
                                        alt={room.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">{room.name}</h3>
                                                <div className="flex gap-4 text-sm text-slate-300">
                                                    <span>{room.sizeSqm} m²</span>
                                                    <span>•</span>
                                                    <span>Up to {room.maxAdults} Guests</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors">
                                                <ChevronRight />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 pt-32 pb-12 border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Ready for an elevated experience?</h2>
                    <Link href={`/search?${defaultParams}`} className="inline-block bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-lg px-12 py-5 rounded-full shadow-[0_0_40px_rgba(52,211,153,0.3)] hover:scale-105 hover:shadow-[0_0_60px_rgba(52,211,153,0.5)] transition-all">
                        Reserve Your Stay
                    </Link>

                    <div className="mt-32 pt-8 border-t border-white/10 text-slate-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© {new Date().getFullYear()} {hotel.name}. All rights reserved.</p>
                        <div className="flex gap-6">
                            {hotel.facebookUrl && <a href={hotel.facebookUrl} className="hover:text-emerald-400 transition-colors">Facebook</a>}
                            {hotel.instagramUrl && <a href={hotel.instagramUrl} className="hover:text-emerald-400 transition-colors">Instagram</a>}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
