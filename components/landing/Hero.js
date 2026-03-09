import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CheckCircle, PlayCircle } from 'lucide-react';
import DemoModal from './DemoModal';
import MockDashboard from './MockDashboard';
import { motion } from 'framer-motion';

export default function Hero({ title, description, ctaText }) {
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    return (
        <div className="relative overflow-hidden bg-[#0A0F1C] pt-6 pb-24">
            <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

            {/* Background Mesh Gradients */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/15 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
            <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 bg-[url('/img/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" opacity="0.1" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8 pt-16">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-slate-300 text-sm font-medium shadow-xl"
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        BookingKub v1.0 is Live
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.1]"
                    >
                        {title ? (
                            <div dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br/>') }} />
                        ) : (
                            <>
                                Everything You Need to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-400 to-teal-400">
                                    Run Your Hotel.
                                </span>
                            </>
                        )}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
                    >
                        {description || "Manage bookings, guests, and payments in one place. No more spreadsheets, no more double bookings. Start with our Lite Plan for free."}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6"
                    >
                        <Link href="/auth/register" className="px-8 py-4 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)] transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1">
                            {ctaText || "Start for Free"} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button
                            onClick={() => setIsDemoOpen(true)}
                            className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 text-white font-bold rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300 flex items-center gap-2 group hover:shadow-xl"
                        >
                            <PlayCircle size={22} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                            View Demo
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="pt-10 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm font-medium text-slate-400"
                    >
                        <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> No Credit Card Required</span>
                        <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Cancel Anytime</span>
                        <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Free Support</span>
                    </motion.div>
                </div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 1.2, delay: 0.5 }}
                    className="mt-16 relative mx-auto max-w-5xl group perspective-1000"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="relative transform transition-transform duration-700 hover:rotate-x-2"
                    >
                        <MockDashboard />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
