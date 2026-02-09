import { useState, useEffect } from 'react';
import { X, LayoutDashboard, Calendar, Users, CreditCard, ChevronRight, Globe, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('admin');
    const [activeFeature, setActiveFeature] = useState(0);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const adminFeatures = [
        { title: "Dashboard", icon: LayoutDashboard, desc: "Real-time overview of check-ins, occupancy, and revenue.", image: "/demo/dashboard.png" },
        { title: "Calendar", icon: Calendar, desc: "Drag-and-drop bookings, manage availability, and pricing.", image: "/demo/calendar.png" },
        { title: "Guests", icon: Users, desc: "CRM for guest profiles, history, and preferences.", image: "/demo/guests.png" },
        { title: "Payments", icon: CreditCard, desc: "Stripe integration for secure deposits and payments.", image: "/demo/payments.png" }
    ];

    const guestFeatures = [
        { title: "Booking Engine", icon: Globe, desc: "Mobile-friendly booking page for your guests.", image: "/demo/booking.png" },
        { title: "Search", icon: Search, desc: "Fast availability search with real-time rates.", image: "/demo/booking.png" }, // Reusing booking image for now
        { title: "Confirmation", icon: ArrowRight, desc: "Instant email confirmation and PDF invoices.", image: "/demo/booking.png" } // Reusing booking image for now
    ];

    const features = activeTab === 'admin' ? adminFeatures : guestFeatures;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-6xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                >
                    {/* Sidebar */}
                    <div className="w-full md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="font-display font-bold text-white text-xl">Product Tour</h3>
                            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="p-4 flex gap-2">
                            <button
                                onClick={() => { setActiveTab('admin'); setActiveFeature(0); }}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                            >
                                Admin View
                            </button>
                            <button
                                onClick={() => { setActiveTab('guest'); setActiveFeature(0); }}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'guest' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                            >
                                Guest View
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {features.map((feature, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveFeature(idx)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${activeFeature === idx ? 'bg-slate-700/50 border-blue-500/50 shadow-md' : 'bg-transparent border-transparent hover:bg-slate-700/30'}`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${activeFeature === idx ? (activeTab === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400') : 'bg-slate-700 text-slate-400'}`}>
                                            <feature.icon size={18} />
                                        </div>
                                        <span className={`font-bold ${activeFeature === idx ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{feature.title}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed pl-11">
                                        {feature.desc}
                                    </p>
                                </button>
                            ))}
                        </div>

                        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                            <a href="/auth/register" className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25">
                                Start Free Trial <ChevronRight size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-slate-900 relative p-8 flex flex-col min-h-[400px]">
                        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-slate-800/50 hover:bg-slate-700 text-white rounded-full backdrop-blur-sm transition-colors border border-slate-700 hidden md:flex">
                            <X size={20} />
                        </button>

                        <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={`${activeTab}-${activeFeature}`}
                                    src={features[activeFeature].image}
                                    alt={features[activeFeature].title}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                                />
                            </AnimatePresence>

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                            {/* Content text over image */}
                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <motion.div
                                    key={`text-${activeTab}-${activeFeature}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2 className="text-3xl font-bold text-white mb-2">{features[activeFeature].title}</h2>
                                    <p className="text-slate-300 text-lg max-w-xl">{features[activeFeature].desc}</p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex justify-center gap-2 mt-6">
                            {features.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveFeature(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${activeFeature === idx ? (activeTab === 'admin' ? 'w-8 bg-blue-500' : 'w-8 bg-emerald-500') : 'w-2 bg-slate-700 hover:bg-slate-600'}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
