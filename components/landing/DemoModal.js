import { useState, useEffect, useRef } from 'react';
import { X, LayoutDashboard, Calendar, Users, CreditCard, ChevronRight, Globe, Search, ArrowRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MockDashboard from './MockDashboard';

export default function DemoModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('admin');
    const [activeFeature, setActiveFeature] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const progressRef = useRef(null);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const adminFeatures = [
        { id: "overview", title: "Dashboard", icon: LayoutDashboard, desc: "Real-time overview of check-ins, occupancy, and revenue." },
        { id: "calendar", title: "Calendar", icon: Calendar, desc: "Drag-and-drop bookings, manage availability, and pricing." },
        { id: "guests", title: "Guests", icon: Users, desc: "CRM for guest profiles, history, and preferences." },
        { id: "payments", title: "Payments", icon: CreditCard, desc: "Stripe integration for secure deposits and payments." }
    ];

    const guestFeatures = [
        { id: "booking", title: "Booking Engine", icon: Globe, desc: "Mobile-friendly booking page for your guests." },
        { id: "search", title: "Search", icon: Search, desc: "Fast availability search with real-time rates." },
        { id: "confirmation", title: "Confirmation", icon: ArrowRight, desc: "Instant email confirmation and PDF invoices." }
    ];

    const features = activeTab === 'admin' ? adminFeatures : guestFeatures;

    // Auto-play logic
    useEffect(() => {
        if (!isOpen || !isAutoPlay) return;

        const interval = setInterval(() => {
            setActiveFeature((prev) => {
                if (prev === features.length - 1) {
                    return 0; // Loop back to start
                }
                return prev + 1;
            });
        }, 5000); // 5 seconds per feature

        return () => clearInterval(interval);
    }, [isOpen, isAutoPlay, features.length, activeTab]);

    // Reset autoplay interval on manual selection
    const handleFeatureClick = (idx) => {
        setActiveFeature(idx);
        setIsAutoPlay(false); // Stop autoplay when user manually interacts
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#0A0F1C]/90 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-6xl bg-slate-900 rounded-[2rem] border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                >
                    {/* Sidebar */}
                    <div className="w-full md:w-80 bg-slate-800/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shrink-0 relative z-10">
                        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                            <h3 className="font-display font-bold text-white text-xl flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse"></span>
                                Product Tour
                            </h3>
                            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white bg-slate-700/50 p-1.5 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="p-4 flex gap-2">
                            <button
                                onClick={() => { setActiveTab('admin'); setActiveFeature(0); setIsAutoPlay(true); }}
                                className="flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all relative outline-none"
                            >
                                {activeTab === 'admin' && (
                                    <motion.div layoutId="activeTabBadge" className="absolute inset-0 bg-primary-600 rounded-xl shadow-lg -z-10" />
                                )}
                                <span className={activeTab === 'admin' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}>Admin View</span>
                            </button>
                            <button
                                onClick={() => { setActiveTab('guest'); setActiveFeature(0); setIsAutoPlay(true); }}
                                className="flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all relative outline-none"
                            >
                                {activeTab === 'guest' && (
                                    <motion.div layoutId="activeTabBadge" className="absolute inset-0 bg-emerald-600 rounded-xl shadow-lg -z-10" />
                                )}
                                <span className={activeTab === 'guest' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}>Guest View</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                            {features.map((feature, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleFeatureClick(idx)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${activeFeature === idx ? 'bg-slate-700/50 border-slate-600 shadow-md' : 'bg-transparent border-transparent hover:bg-slate-700/30'}`}
                                >
                                    {/* Active background glow */}
                                    {activeFeature === idx && (
                                        <div className={`absolute -inset-1 bg-gradient-to-r blur opacity-20 ${activeTab === 'admin' ? 'from-primary-500 to-blue-500' : 'from-emerald-500 to-teal-500'}`} />
                                    )}

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2.5 rounded-xl transition-colors ${activeFeature === idx ? (activeTab === 'admin' ? 'bg-primary-500 text-white' : 'bg-emerald-500 text-white') : 'bg-slate-800 text-slate-400 group-hover:text-slate-300 group-hover:bg-slate-700'}`}>
                                                <feature.icon size={18} />
                                            </div>
                                            <span className={`font-bold transition-colors ${activeFeature === idx ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{feature.title}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed pl-[3.25rem]">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="p-6 border-t border-slate-700/50 bg-slate-800 flex justify-between items-center z-10 relative">
                            <button
                                onClick={() => setIsAutoPlay(!isAutoPlay)}
                                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider bg-slate-700/50 px-3 py-2 rounded-lg"
                            >
                                {isAutoPlay ? <Pause size={14} /> : <Play size={14} />} {isAutoPlay ? 'Pause' : 'Play'}
                            </button>

                            <a href="/auth/register" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all shadow-lg ${activeTab === 'admin' ? 'bg-primary-600 hover:bg-primary-500 hover:shadow-primary-600/25' : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-600/25'}`}>
                                Try Free <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-[#0f172a] relative p-6 sm:p-10 flex flex-col min-h-[500px] overflow-hidden">
                        {/* Background subtle gradients */}
                        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] mix-blend-screen opacity-20 pointer-events-none transition-colors duration-1000 ${activeTab === 'admin' ? 'bg-primary-500' : 'bg-emerald-500'}`}></div>

                        <button onClick={onClose} className="absolute top-6 right-6 z-20 p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-md transition-colors border border-slate-700/80 hidden md:flex shadow-xl">
                            <X size={20} />
                        </button>

                        <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-900 group z-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeTab}-${activeFeature}`}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="absolute inset-0 w-full h-full p-2"
                                >
                                    <div className="w-full h-full rounded-xl overflow-hidden pointer-events-none select-none relative">
                                        <MockDashboard activeView={features[activeFeature].id} />
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Floating glassmorphic text card */}
                            <div className="absolute bottom-6 left-6 right-6 z-50 pointer-events-none">
                                <motion.div
                                    key={`text-${activeTab}-${activeFeature}`}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.4 }}
                                    className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-2xl max-w-xl flex items-start gap-4"
                                >
                                    {(() => {
                                        const ActiveIcon = features[activeFeature].icon;
                                        return (
                                            <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === 'admin' ? 'bg-primary-500/20 text-primary-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                <ActiveIcon size={20} />
                                            </div>
                                        );
                                    })()}
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">
                                            {features[activeFeature].title}
                                        </h2>
                                        <p className="text-slate-300 text-sm leading-relaxed">{features[activeFeature].desc}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex justify-center gap-3 mt-8 z-10">
                            {features.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleFeatureClick(idx)}
                                    className="relative h-1.5 rounded-full overflow-hidden bg-slate-800 transition-all duration-300 outline-none"
                                    style={{ width: activeFeature === idx ? '3rem' : '1.5rem' }}
                                >
                                    {activeFeature === idx && (
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: isAutoPlay ? "100%" : "100%" }}
                                            transition={isAutoPlay ? { duration: 5, ease: "linear" } : { duration: 0 }}
                                            className={`absolute top-0 left-0 h-full ${activeTab === 'admin' ? 'bg-primary-500' : 'bg-emerald-500'}`}
                                            onAnimationComplete={() => {
                                                // Handled in useEffect instead
                                            }}
                                        />
                                    )}
                                    {activeFeature < idx && (
                                        <div className="absolute top-0 left-0 h-full w-0" />
                                    )}
                                    {activeFeature > idx && (
                                        <div className={`absolute top-0 left-0 h-full w-full ${activeTab === 'admin' ? 'bg-primary-500' : 'bg-emerald-500'}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
