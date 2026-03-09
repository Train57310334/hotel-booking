import { Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactSection() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, send to API. For now, just show success.
        setTimeout(() => setSubmitted(true), 1000);
    };

    return (
        <section id="contact" className="relative bg-[#0A0F1C] overflow-hidden py-24">
            {/* Background Mesh Gradients */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] mix-blend-screen -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] mix-blend-screen translate-y-1/3" />
            <div className="absolute inset-0 bg-[url('/img/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0),white)]" opacity="0.05" />

            <div className="container mx-auto px-4 relative z-10 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-5 tracking-tight">
                        Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Support</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Have questions about BookingKub? We're here to help you scale your hotel business.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Info Card - Takes up 2 cols on lg */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6 }}
                        className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2rem] lg:col-span-2 h-fit shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-2xl font-bold font-display text-white mb-8">Get in Touch</h3>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-start gap-4 group/item">
                                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0 group-hover/item:scale-110 group-hover/item:bg-primary-500/20 transition-all duration-300">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base mb-2">Office</h4>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        123 Tech Park, Sukhumvit Road<br />
                                        Bangkok, Thailand 10110
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group/item">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover/item:scale-110 group-hover/item:bg-emerald-500/20 transition-all duration-300">
                                    <Mail size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base mb-2">Email</h4>
                                    <a href="mailto:support@bookingkub.com" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">support@bookingkub.com</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group/item">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover/item:scale-110 group-hover/item:bg-blue-500/20 transition-all duration-300">
                                    <MessageSquare size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base mb-2">Live Chat</h4>
                                    <p className="text-slate-400 text-sm">Available Mon-Fri, 9am - 6pm</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-700/50 relative z-10">
                            <p className="text-slate-400 text-sm text-center">Need urgent help? Check our <a href="#" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Knowledge Base</a>.</p>
                        </div>
                    </motion.div>

                    {/* Contact Form - Takes up 3 cols on lg */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-6 md:p-10 rounded-[2rem] lg:col-span-3 shadow-2xl relative"
                    >
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10 py-24 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                                    <Send size={40} />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">Message Sent!</h3>
                                <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed">Thank you for reaching out. Our support team will review your message and get back to you within 24 hours.</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-10 px-8 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all hover:shadow-xl"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <label className="text-sm font-medium text-slate-300">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-5 py-4 bg-slate-900/40 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-300 text-white placeholder:text-slate-600 focus:bg-slate-900/60 shadow-inner"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-5 py-4 bg-slate-900/40 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-300 text-white placeholder:text-slate-600 focus:bg-slate-900/60 shadow-inner"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-slate-300">Start with</label>
                                    <select className="w-full px-5 py-4 bg-slate-900/40 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-300 text-white appearance-none cursor-pointer focus:bg-slate-900/60 shadow-inner">
                                        <option className="bg-slate-800 text-white">General Inquiry</option>
                                        <option className="bg-slate-800 text-white">Sales & Pricing</option>
                                        <option className="bg-slate-800 text-white">Technical Support</option>
                                        <option className="bg-slate-800 text-white">Partnership</option>
                                    </select>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-sm font-medium text-slate-300">Message</label>
                                    <textarea
                                        required
                                        rows="5"
                                        className="w-full px-5 py-4 bg-slate-900/40 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-300 resize-none text-white placeholder:text-slate-600 focus:bg-slate-900/60 shadow-inner"
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.6)] transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1">
                                    Send Message <Send size={18} className="transition-transform group-hover:translate-x-1" />
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
