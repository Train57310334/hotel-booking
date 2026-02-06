import Layout from '@/components/Layout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage({ hotel, error }) {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, send to API. For now, just show success.
        setSubmitted(true);
    };

    if (error) return <Layout><div className="p-20 text-center text-red-600">{error}</div></Layout>;

    return (
        <Layout>
            <div className="relative py-24 bg-slate-900">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2000')] bg-cover bg-center opacity-20 blur-sm"></div>
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Contact Us</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">Have questions? We're here to help. Reach out to our team for any inquiries or assistance.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Info Card */}
                    <div className="bg-primary-600 text-white p-10 rounded-3xl shadow-xl lg:col-span-1">
                        <h3 className="text-2xl font-bold font-display mb-8">Get in Touch</h3>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Visit Us</h4>
                                    <p className="text-primary-100 leading-relaxed">
                                        {hotel.address || "123 Hotel Street"}<br />
                                        {hotel.city}, {hotel.country}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Email Us</h4>
                                    <p className="text-primary-100">{hotel.contactEmail || "info@hotel.com"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Call Us</h4>
                                    <p className="text-primary-100">{hotel.contactPhone || "+66 2 123 4567"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/20">
                            <p className="text-primary-100 text-sm">We are open 24/7 to assist you with your booking needs.</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 lg:col-span-2">
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10 animate-in fade-in zoom-in">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <Send size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                                <p className="text-slate-500">Thank you for reaching out. We will get back to you shortly.</p>
                                <button onClick={() => setSubmitted(false)} className="mt-8 text-primary-600 font-bold hover:underline">Send another message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Message</label>
                                    <textarea
                                        required
                                        rows="6"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all resize-none"
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="btn-primary px-8 py-3 w-full md:w-auto font-bold flex items-center justify-center gap-2">
                                    Send Message <Send size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-12 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 h-96 overflow-hidden relative">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent((hotel.address || '') + ' ' + (hotel.city || '') + ' ' + (hotel.country || ''))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        className="rounded-2xl w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                    ></iframe>
                </div>
            </div>
        </Layout>
    );
}

export async function getServerSideProps() {
    try {
        const backend = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:3001/api';
        const res = await fetch(`${backend}/hotels`);
        if (!res.ok) throw new Error('Failed to fetch hotel');
        const hotels = await res.json();
        // Pick the most recently updated hotel (the one user is likely editing)
        const activeHotel = hotels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        return { props: { hotel: activeHotel || {} } };
    } catch (err) {
        return { props: { error: err.message } };
    }
}
