import Link from 'next/link';
import { ArrowRight, Download, LayoutTemplate, Settings, Globe } from 'lucide-react';

export default function WordPressSection() {
    return (
        <section id="wordpress" className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-800 text-blue-300 text-sm font-medium">
                            <Globe size={14} />
                            <span>WordPress Integration</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                            Turn your WordPress site into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Booking Powerhouse.</span>
                        </h2>

                        <p className="text-lg text-slate-400 leading-relaxed">
                            Already have a beautiful hotel website built on WordPress? No need to rebuild.
                            Simply install our official plugin to add a powerful booking engine instantly.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: LayoutTemplate, title: "Seamless Widget", desc: "Embed search forms and room calendars anywhere with shortcodes." },
                                { icon: Settings, title: "Easy Configuration", desc: "Connects to your BookingKub account with a single API key." },
                                { icon: Globe, title: "Syncs Instantly", desc: "Real-time availability updates between your site and channel manager." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                        <item.icon className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{item.title}</h4>
                                        <p className="text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <Link href="/auth/register" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group">
                                Get the Plugin <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2">
                                <Download size={20} />
                                Documentation
                            </a>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-2 shadow-2xl">
                            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                                {/* Pseudo-browser header */}
                                <div className="h-8 bg-slate-800 flex items-center px-4 gap-2 border-b border-slate-700">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <div className="ml-4 flex-1 h-5 bg-slate-900 rounded-md text-[10px] text-slate-500 flex items-center px-2 font-mono">
                                        your-hotel.com
                                    </div>
                                </div>
                                {/* Placeholder for Plugin UI preview */}
                                <div className="p-8 flex items-center justify-center min-h-[400px] bg-slate-900 relative">
                                    <div className="text-center space-y-4">
                                        <div className="inline-block p-4 rounded-full bg-blue-500/10 mb-4">
                                            <Globe size={48} className="text-blue-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">BookingKub Widget</h3>
                                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 max-w-xs mx-auto text-left space-y-3">
                                            <div className="h-2 w-24 bg-slate-700 rounded" />
                                            <div className="h-8 bg-slate-900 rounded border border-slate-700" />
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-8 bg-slate-900 rounded border border-slate-700" />
                                                <div className="flex-1 h-8 bg-slate-900 rounded border border-slate-700" />
                                            </div>
                                            <div className="h-8 bg-blue-600 rounded w-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <div className="absolute -bottom-6 -left-6 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl flex items-center gap-3 animate-bounce-slow">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Download size={20} className="text-green-500" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">Downloads</div>
                                <div className="font-bold text-white">1,000+ Installs</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
