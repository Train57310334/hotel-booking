import { Mail } from 'lucide-react';

export default function ComingSoon({ hotelName }) {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000"
                    alt="Luxury Hotel Lobby"
                    className="w-full h-full object-cover opacity-40 blur-sm scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
                <div className="mb-8 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 border border-amber-400/30 rounded-full text-amber-400 text-xs font-bold tracking-widest uppercase mb-6 bg-amber-400/5 backdrop-blur-sm">
                        Coming Soon
                    </span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
                        {hotelName || 'Grand Opening'}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
                        We are currently curating an exceptional experience for you.
                        Our team is working on the final touches to ensure your stay is nothing short of perfection.
                    </p>
                </div>

                {/* Newsletter / Contact Mockup */}
                <div className="max-w-md mx-auto mt-12 bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex items-center shadow-2xl">
                    <div className="pl-4 text-slate-400">
                        <Mail size={20} />
                    </div>
                    <input
                        type="email"
                        placeholder="Enter your email for updates"
                        className="flex-1 bg-transparent border-none text-white placeholder:text-slate-500 text-sm px-4 focus:ring-0 outline-none h-12"
                    />
                    <button className="h-10 px-6 bg-white text-slate-900 rounded-full text-sm font-bold hover:bg-amber-50 transition-colors">
                        Notify Me
                    </button>
                </div>

                <div className="mt-16 text-slate-500 text-sm font-medium tracking-wide">
                    © 2026 {hotelName || 'BookingKub'}. All rights reserved.
                </div>
            </div>
        </div>
    );
}
