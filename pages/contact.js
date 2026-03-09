import Layout from '@/components/Layout';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '@/lib/api';

export default function ContactPage() {
    const router = useRouter();
    const { hotelId } = router.query;

    const [hotel, setHotel] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(!!hotelId);
    const [error, setError] = useState('');

    useEffect(() => {
        if (hotelId) {
            setPageLoading(true);
            apiFetch(`/hotels/public/${hotelId}`)
                .then(data => setHotel(data))
                .catch(err => console.error('Failed to fetch hotel info:', err))
                .finally(() => setPageLoading(false));
        } else {
            setPageLoading(false);
            setHotel(null);
        }
    }, [hotelId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiFetch('/messages', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    content: formData.message,
                    hotelId: hotelId || undefined,
                })
            });
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                    <p>Loading contact information...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout navbarProps={{ mode: hotelId ? 'hotel' : 'saas' }}>
            <div className="relative min-h-screen bg-slate-900 text-slate-200 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 -translate-x-[10%] -translate-y-[10%] w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-[100px]" />
                <div className="absolute bottom-0 right-0 translate-x-[10%] translate-y-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />

                <div className="relative z-10 pt-24 pb-12">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 animate-fade-in-up">
                            {hotel ? `Contact ${hotel.name}` : <>Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Support</span></>}
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto animate-fade-in-up delay-100">
                            {hotel
                                ? `Have questions for ${hotel.name}? We're here to help make your stay perfect.`
                                : `Have questions about BookingKub? We're here to help you scale your hotel business.`}
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 pb-20 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Info Card */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl lg:col-span-1 animate-fade-in-up delay-200 h-fit">
                            <h3 className="text-2xl font-bold font-display text-white mb-8">Get in Touch</h3>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg mb-1">Office</h4>
                                        <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                                            {hotel ? hotel.address : "123 Tech Park, Sukhumvit Road\nBangkok, Thailand 10110"}
                                        </p>
                                    </div>
                                </div>

                                {(hotel?.contactEmail || !hotel) && (
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg mb-1">Email</h4>
                                            <a href={`mailto:${hotel ? hotel.contactEmail : 'support@bookingkub.com'}`} className="text-slate-400 hover:text-emerald-400 transition-colors">
                                                {hotel ? hotel.contactEmail : 'support@bookingkub.com'}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {(hotel?.contactPhone || !hotel) && (
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            {hotel ? <Phone size={24} /> : <MessageSquare size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg mb-1">{hotel ? 'Phone' : 'Live Chat'}</h4>
                                            {hotel ? (
                                                <a href={`tel:${hotel.contactPhone}`} className="text-slate-400 hover:text-blue-400 transition-colors">{hotel.contactPhone}</a>
                                            ) : (
                                                <p className="text-slate-400">Available Mon-Fri, 9am - 6pm</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!hotel && (
                                <div className="mt-12 pt-8 border-t border-slate-700">
                                    <p className="text-slate-500 text-sm">Need urgent help? Check our <a href="#" className="text-primary-400 hover:underline">Knowledge Base</a>.</p>
                                </div>
                            )}
                        </div>

                        {/* Contact Form */}
                        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-8 md:p-10 rounded-3xl lg:col-span-2 animate-fade-in-up delay-300">
                            {submitted ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-10 animate-in fade-in zoom-in py-20">
                                    <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                                        <Send size={40} />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">Message Sent!</h3>
                                    <p className="text-slate-400 max-w-md mx-auto">Thank you for reaching out. Our support team will review your message and get back to you within 24 hours.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="mt-8 px-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-400">Your Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-400">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-600"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm mb-6 border border-red-500/20">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Start with</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-white"
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Sales & Pricing">Sales & Pricing</option>
                                            <option value="Technical Support">Technical Support</option>
                                            <option value="Partnership">Partnership</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400">Message</label>
                                        <textarea
                                            required
                                            rows="6"
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-white placeholder:text-slate-600"
                                            placeholder="How can we help you?"
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Sending...' : 'Send Message'} <Send size={18} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
