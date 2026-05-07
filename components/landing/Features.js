import { motion } from 'framer-motion';
import { RefreshCcw, TrendingUp, CalendarDays, Globe, CheckSquare, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};

export default function Features({ saasSettings }) {
    const { t } = useLanguage();
    const title = saasSettings?.landingFeaturesTitle || t('features.title') || "Powerful Features";
    const subtitle = saasSettings?.landingFeaturesSubtitle || t('features.subtitle') || "Everything you need to scale your hotel.";

    return (
        <section className="py-24 bg-[#0A0F1C] relative overflow-hidden" id="features">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('/img/grid.svg')] bg-center opacity-[0.03] [mask-image:linear-gradient(180deg,transparent,black)]" />

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-2xl mx-auto mb-16"
                >
                    <h2 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400 uppercase tracking-widest mb-3">{title}</h2>
                    <h3 className="text-3xl md:text-5xl font-display font-extrabold text-white mb-5 tracking-tight">{subtitle}</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        {t('features.description') || "Built for modern hoteliers who want to automate operations, maximize revenue, and delight guests."}
                    </p>
                </motion.div>

                {/* Bento Grid Layout */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]"
                >
                    
                    {/* 1. Channel Manager (Large - 2x2) */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-2 md:row-span-2 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-blue-500/50 transition-colors group relative overflow-hidden flex flex-col"
                    >
                        <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" 
                        />
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <RefreshCcw size={20} />
                            </div>
                            <h4 className="text-xl font-bold text-white">{t('features.cmTitle') || "Two-Way Channel Manager"}</h4>
                        </div>
                        <p className="text-slate-400 text-sm mb-8 max-w-sm">
                            {t('features.cmDesc') || "Sync inventory and rates automatically across Agoda, Booking.com, Expedia, and your direct site in real-time. Say goodbye to overbookings."}
                        </p>
                        
                        {/* UI Mockup: Channel Sync */}
                        <div className="mt-auto relative w-full h-40 bg-slate-900/60 rounded-2xl border border-slate-700/50 p-4 overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <div className="h-2 w-20 bg-slate-700 rounded-full"></div>
                                <div className="h-2 w-12 bg-slate-700 rounded-full"></div>
                            </div>
                            <div className="space-y-3 relative z-10">
                                {/* Booking.com row */}
                                <motion.div 
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">B.</div>
                                        <div className="h-2 w-24 bg-slate-600 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary-400 text-xs font-medium">
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                            <RefreshCcw size={12} />
                                        </motion.div>
                                        Synced
                                    </div>
                                </motion.div>
                                {/* Agoda row */}
                                <motion.div 
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">ag</div>
                                        <div className="h-2 w-16 bg-slate-600 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary-400 text-xs font-medium">
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}>
                                            <RefreshCcw size={12} />
                                        </motion.div>
                                        Synced
                                    </div>
                                </motion.div>
                            </div>
                            {/* Glowing line sync effect */}
                            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)] transform -translate-y-1/2 z-0 overflow-hidden">
                                <motion.div 
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="w-1/3 h-full bg-blue-400" 
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Yield Management (Medium - 2x1) */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-1 lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-colors group relative overflow-hidden flex flex-col"
                    >
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="text-xl font-bold text-white">{t('features.ymTitle') || "Dynamic Yield Management"}</h4>
                        </div>
                        <p className="text-slate-400 text-sm mb-6 max-w-sm">
                            {t('features.ymDesc') || "Automate pricing based on occupancy rules. Maximize revenue when demand is high."}
                        </p>
                        
                        {/* UI Mockup: Chart */}
                        <div className="mt-auto relative w-full h-24 flex items-end justify-between gap-2 px-2 pb-2">
                            {[40, 55, 45, 70, 85, 60, 90, 75, 95].map((h, i) => (
                                <div key={i} className="w-full relative group/bar h-full flex items-end cursor-pointer">
                                    <motion.div 
                                        initial={{ height: "0%" }}
                                        whileInView={{ height: `${h}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.2 + (i * 0.05), type: "spring" }}
                                        className={`w-full rounded-t-sm transition-colors duration-300 ${h >= 80 ? 'bg-primary-500 group-hover/bar:bg-primary-400' : 'bg-slate-700 group-hover/bar:bg-slate-500'}`}
                                    />
                                    {h >= 80 && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            whileHover={{ opacity: 1, y: 0 }}
                                            className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-slate-800 text-xs text-white px-2 py-1 rounded z-10 font-bold border border-slate-700"
                                        >
                                            +{Math.floor(h/5)}%
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 3. Direct Booking Engine (Medium - 1x1) */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-1 lg:col-span-1 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 hover:border-violet-500/50 transition-colors group relative overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                                <Globe size={16} />
                            </div>
                            <h4 className="text-lg font-bold text-white leading-tight">{t('features.dbTitle') || "Direct Booking"}</h4>
                        </div>
                        <p className="text-slate-400 text-xs mb-4">
                            {t('features.dbDesc') || "0% Commission. Fast, responsive, and matches your brand perfectly."}
                        </p>

                        {/* UI Mockup: Booking Widget */}
                        <div className="mt-auto bg-slate-900 rounded-xl p-3 border border-slate-700/50">
                            <div className="h-6 bg-slate-800 rounded mb-2 flex items-center px-2">
                                <CalendarDays size={10} className="text-slate-500 mr-2" />
                                <div className="h-1.5 w-16 bg-slate-600 rounded-full"></div>
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-8 bg-violet-600/90 hover:bg-violet-500 transition-colors rounded flex items-center justify-center relative overflow-hidden"
                            >
                                <div className="h-2 w-12 bg-white/80 rounded-full relative z-10"></div>
                                <motion.div 
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                    className="absolute top-0 bottom-0 w-4 bg-white/30 skew-x-12"
                                />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* 4. Smart Calendar (Large - 2x1) */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-2 lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-amber-500/50 transition-colors group relative overflow-hidden flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                    <CalendarDays size={20} />
                                </div>
                                <h4 className="text-xl font-bold text-white">{t('features.calTitle') || "Interactive Calendar"}</h4>
                            </div>
                            <p className="text-slate-400 text-sm mb-4 max-w-md">
                                {t('features.calDesc') || "Drag-and-drop bookings directly on the calendar. Try dragging the colorful blocks below!"}
                            </p>
                        </div>
                        
                        {/* UI Mockup: Calendar Grid */}
                        <div className="w-full bg-slate-900/80 rounded-xl border border-slate-700/50 p-3 overflow-hidden">
                            <div className="flex gap-2 mb-2">
                                <div className="w-12 shrink-0"></div>
                                <div className="flex-1 flex gap-1">
                                    {[1, 2, 3, 4, 5, 6].map(d => <div key={d} className="flex-1 h-2 bg-slate-700/50 rounded-sm"></div>)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex gap-2 items-center">
                                    <div className="w-12 h-2 bg-slate-700 rounded-sm shrink-0"></div>
                                    <div className="flex-1 relative h-6 bg-slate-800 rounded-sm overflow-hidden flex items-center px-1">
                                        <motion.div 
                                            drag="x"
                                            dragConstraints={{ left: -20, right: 100 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                                            className="w-[30%] h-4 bg-amber-500/80 hover:bg-amber-400 rounded flex items-center px-2 cursor-grab shadow-lg relative z-10"
                                        >
                                            <div className="h-1 w-6 bg-white/50 rounded-full pointer-events-none"></div>
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="w-12 h-2 bg-slate-700 rounded-sm shrink-0"></div>
                                    <div className="flex-1 relative h-6 bg-slate-800 rounded-sm overflow-hidden flex items-center px-1 justify-center">
                                        <motion.div 
                                            drag="x"
                                            dragConstraints={{ left: -100, right: 20 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                                            className="w-[40%] h-4 bg-blue-500/80 hover:bg-blue-400 rounded flex items-center px-2 cursor-grab shadow-lg relative z-10"
                                        >
                                            <div className="h-1 w-8 bg-white/50 rounded-full pointer-events-none"></div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 5. Housekeeping (Small - 1x1) */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-1 lg:col-span-1 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 hover:border-teal-500/50 transition-colors group relative flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                                <CheckSquare size={16} />
                            </div>
                            <h4 className="text-lg font-bold text-white leading-tight">{t('features.hkTitle') || "Housekeeping"}</h4>
                        </div>
                        <p className="text-slate-400 text-xs mb-4">
                            {t('features.hkDesc') || "Real-time room status updates and staff tracking."}
                        </p>
                        <div className="mt-auto space-y-2">
                            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                                    <div className="h-1.5 w-12 bg-slate-600 rounded-full"></div>
                                </div>
                                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                                    <CheckSquare size={12} className="text-teal-500" />
                                </motion.div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/50 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                    <div className="h-1.5 w-16 bg-slate-600 rounded-full"></div>
                                </div>
                                <div className="w-3 h-3 border border-slate-500 rounded-sm"></div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* 6. Insightful Analytics (Small - 1x1) */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-1 lg:col-span-1 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 hover:border-rose-500/50 transition-colors group relative flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                                <BarChart3 size={16} />
                            </div>
                            <h4 className="text-lg font-bold text-white leading-tight">{t('features.anTitle') || "Insightful Analytics"}</h4>
                        </div>
                        <p className="text-slate-400 text-xs mb-4">
                            {t('features.anDesc') || "Track RevPAR, ADR, and occupancy rates with ease."}
                        </p>
                        <div className="mt-auto flex justify-center pb-2">
                            {/* Animated Donut Chart */}
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative w-20 h-20 rounded-full border-4 border-slate-700 flex items-center justify-center cursor-pointer"
                            >
                                <motion.div 
                                    initial={{ clipPath: 'polygon(50% 50%, 50% 0, 50% 0, 50% 50%, 50% 50%, 50% 50%)' }}
                                    whileInView={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%)' }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                                    className="absolute inset-0 rounded-full border-4 border-rose-500" 
                                />
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="text-white text-sm font-bold z-10"
                                >
                                    85%
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
}

