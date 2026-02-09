import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CheckCircle, PlayCircle } from 'lucide-react';
import DemoModal from './DemoModal';

export default function Hero() {
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    return (
        <div className="relative overflow-hidden bg-slate-900 pt-8 pb-32">
            <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 -translate-x-[10%] -translate-y-[10%] w-[500px] h-[500px] rounded-full bg-primary-500/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 translate-x-[10%] translate-y-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[100px]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8 pt-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        v1.0 is Live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-tight animate-fade-in-up delay-100">
                        Everything You Need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Run Your Hotel.</span>
                    </h1>

                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-200">
                        Manage bookings, guests, and payments in one place. No more spreadsheets, no more double bookings. Start with our Lite Plan for free.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in-up delay-300">
                        <Link href="/auth/register" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all flex items-center gap-2 transform hover:-translate-y-1">
                            Start for Free <ArrowRight size={20} />
                        </Link>
                        <button
                            onClick={() => setIsDemoOpen(true)}
                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all flex items-center gap-2 group"
                        >
                            <PlayCircle size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                            View Demo
                        </button>
                    </div>

                    <div className="pt-8 flex items-center justify-center gap-6 text-sm text-slate-500 animate-fade-in-up delay-500">
                        <span className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> No Credit Card Required</span>
                        <span className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Cancel Anytime</span>
                        <span className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Free Support</span>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="mt-20 relative mx-auto max-w-5xl animate-fade-in-up delay-700 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop" alt="Dashboard Preview" className="w-full opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </div>
    );
}
