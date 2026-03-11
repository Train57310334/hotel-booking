import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import ComingSoon from '@/components/ComingSoon';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Wifi, Tv, Coffee, Star, MapPin, ArrowRight } from 'lucide-react';

export default function BoutiqueTheme({ hotel }) {
    const { t } = useLanguage();

    // Smooth parallax
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, 150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
        return <ComingSoon hotelName={hotel.name} />;
    }

    const heroTitle = hotel.heroTitle || `Welcome to ${hotel.name}`;
    const heroDescription = hotel.heroDescription || hotel.description || "Experience serene luxury, thoughtful design, and unparalleled hospitality.";
    // New boutique video from Pexels
    const heroVideo = hotel.heroVideoUrl || "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4";

    const defaultParams = `checkIn=${new Date().toISOString().split('T')[0]}&checkOut=${new Date(Date.now() + 86400000).toISOString().split('T')[0]}&guests=1`;

    return (
        <div className="bg-[#FAF9F6] min-h-screen text-slate-800 font-sans selection:bg-amber-600/30 selection:text-amber-900">
            {/* Elegant Header */}
            <header className="fixed top-0 w-full z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-amber-900/10 py-5 transition-all">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {hotel.logoUrl ? (
                            <img src={hotel.logoUrl} alt={hotel.name} className="h-12 w-auto" />
                        ) : (
                            <div className="font-serif italic text-2xl font-bold text-amber-900 tracking-wider">
                                {hotel.name}
                            </div>
                        )}
                    </div>
                    <Link href={`/search?${defaultParams}`} className="bg-amber-800 text-[#FAF9F6] hover:bg-amber-900 px-8 py-3 rounded-none font-medium tracking-widest text-sm uppercase transition-all shadow-md">
                        Reserve
                    </Link>
                </div>
            </header>

            {/* Cinematic Hero */}
            <div className="relative h-screen min-h-[800px] flex flex-col justify-end pb-32 overflow-hidden">
                <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
                    <video key={heroVideo} src={heroVideo} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                    {/* Warm overlay gradient */}
                    <div className="absolute inset-0 bg-neutral-900/40 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/20 to-transparent" />
                </motion.div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-amber-900 tracking-tight mb-6 drop-shadow-sm">
                            {heroTitle}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto mb-16 font-light leading-relaxed">
                            {heroDescription}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-amber-900/10 p-4 shadow-xl"
                    >
                        <SearchBar />
                    </motion.div>
                </div>
            </div>

            {/* Earthy Amenities Section */}
            <section className="py-32 relative bg-[#FAF9F6]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold tracking-[0.3em] text-amber-700 uppercase mb-4">The Experience</h2>
                        <h3 className="text-4xl md:text-5xl font-serif text-amber-900">Curated for your senses</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { icon: Wifi, title: "Seamless Connectivity", desc: "High-speed Wi-Fi in every corner." },
                            { icon: Tv, title: "In-Room Theater", desc: "Curated entertainment selection." },
                            { icon: Coffee, title: "Artisan Breakfast", desc: "Locally sourced morning delights." },
                            { icon: Star, title: "Bespoke Service", desc: "Anticipating your every need." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="text-center group"
                            >
                                <div className="w-20 h-20 mx-auto bg-amber-100/50 text-amber-800 rounded-full flex items-center justify-center mb-6 border border-amber-200 transition-transform duration-500 group-hover:-translate-y-2">
                                    <item.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h4 className="text-xl font-serif text-amber-900 mb-3">{item.title}</h4>
                                <p className="text-slate-600 leading-relaxed font-light">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Spaces Gallery with Asymmetrical Layout */}
            <section className="py-32 bg-amber-50 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-100/30 transform -skew-x-12 translate-x-32" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-sm font-bold tracking-[0.3em] text-amber-700 uppercase mb-4">Our Spaces</h2>
                            <h3 className="text-4xl md:text-6xl font-serif text-amber-900">Sanctuaries of rest</h3>
                        </div>
                        <Link href={`/search?${defaultParams}`} className="flex items-center gap-3 text-amber-800 font-medium tracking-widest uppercase text-sm hover:text-amber-600 transition-colors group">
                            View Collection <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" strokeWidth={1} />
                        </Link>
                    </div>

                    <div className="space-y-32">
                        {hotel.roomTypes.slice(0, 3).map((room, index) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
                            >
                                <div className="w-full lg:w-3/5">
                                    <div className="relative aspect-[4/3] overflow-hidden group shadow-2xl">
                                        <img
                                            src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=1000'}
                                            alt={room.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </div>
                                <div className="w-full lg:w-2/5 space-y-6">
                                    <h4 className="text-3xl md:text-4xl font-serif text-amber-900">{room.name}</h4>
                                    <p className="text-slate-600 text-lg font-light leading-relaxed">
                                        {room.description || "A breathtaking space designed with natural materials, soft earthy palettes, and uncompromising comfort. Perfect for unwinding after a long day of exploration."}
                                    </p>
                                    <div className="flex gap-6 py-6 border-y border-amber-900/10 text-sm text-amber-800 font-medium tracking-wide">
                                        <span>{room.sizeSqm} m² Explorer</span>
                                        <span>•</span>
                                        <span>Up to {room.maxAdults} Guests</span>
                                    </div>
                                    <Link href={`/search?${defaultParams}`} className="inline-flex items-center gap-2 text-amber-800 font-bold uppercase tracking-widest text-sm hover:gap-4 transition-all">
                                        Discover Room <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Refined Footer */}
            <footer className="bg-amber-950 pt-32 pb-12 text-amber-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-serif mb-10 text-amber-100">Begin your journey.</h2>
                    <Link href={`/search?${defaultParams}`} className="inline-block bg-[#FAF9F6] text-amber-950 px-14 py-4 font-medium tracking-widest uppercase hover:bg-amber-100 transition-colors shadow-xl">
                        Make a Reservation
                    </Link>

                    <div className="mt-32 pt-8 border-t border-amber-900/50 flex flex-col md:flex-row justify-between items-center gap-6 text-amber-200/60 text-sm font-light">
                        <p>© {new Date().getFullYear()} {hotel.name}. Elegance reserved.</p>
                        <div className="flex gap-8 tracking-widest uppercase text-xs">
                            {hotel.facebookUrl && <a href={hotel.facebookUrl} className="hover:text-amber-100 transition-colors">Facebook</a>}
                            {hotel.instagramUrl && <a href={hotel.instagramUrl} className="hover:text-amber-100 transition-colors">Instagram</a>}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
