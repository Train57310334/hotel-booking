// ✅ pages/booking/checkout.js (Guest Info - No API Call for Booking)
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ConfirmationModal from '@/components/ConfirmationModal';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Mail, Phone, Calendar, ArrowRight, ArrowLeft, BedDouble, Info, CheckCircle, Loader2, Building } from 'lucide-react';

export default function GuestInfoPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [bookingInfo, setBookingInfo] = useState(null);
  const [guest, setGuest] = useState({ name: '', email: '', phone: '', requests: '' });
  const { user } = useAuth();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('bookingCart');
    if (stored) {
      setBookingInfo(JSON.parse(stored));
    } else {
      router.push('/');
    }
  }, [router]);

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (user && !guest.name) {
      setGuest(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);

  // handleContinue: Saves draft to backend, uses URL ref as primary session key.
  // This prevents booking data loss if localStorage is cleared (e.g. iOS Safari, private mode).
  const handleContinue = async () => {
    if (!guest.name) {
      nameRef.current?.focus();
      return;
    }
    if (!guest.email) {
      emailRef.current?.focus();
      return;
    }
    if (!guest.phone) {
      phoneRef.current?.focus();
      return;
    }
    setLoading(true);

    try {
      const payload = { ...bookingInfo, guestDetails: guest };

      // 1. Save draft to server — returns a draftId (15-min TTL)
      const { draftId } = await apiFetch('/bookings/draft', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // 2. Keep a fast-access copy in sessionStorage (survives refresh within same tab)
      sessionStorage.setItem('bookingDraftId', draftId);
      sessionStorage.setItem('bookingPayload', JSON.stringify(payload));

      // 3. Redirect with draftId in URL — this is the resilient session key
      router.push(`/booking/payment?ref=${draftId}`);
    } catch (e) {
      console.error('Failed to save booking draft:', e);
      // Fallback: store locally and proceed anyway
      const payload = { ...bookingInfo, guestDetails: guest };
      sessionStorage.setItem('bookingPayload', JSON.stringify(payload));
      router.push('/booking/payment');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingInfo) return null;

  return (
    <Layout navbarProps={{ brandName: bookingInfo.hotelName, logo: bookingInfo.hotelImage, facebookUrl: bookingInfo.facebookUrl, instagramUrl: bookingInfo.instagramUrl, twitterUrl: bookingInfo.twitterUrl, footerDescription: bookingInfo.footerDescription }}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps (Optional) */}
          <div className="flex items-center gap-4 text-sm font-medium mb-8 text-slate-400">
            <span className="text-primary-600">{t('checkout.step1')}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">{t('checkout.step2')}</span>
            <span className="text-slate-300">/</span>
            <span>{t('checkout.step3')}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Form Section */}
            <div className="flex-1 order-2 lg:order-1">
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{t('checkout.title')}</h1>
              <p className="text-slate-500 mb-8">{t('checkout.subtitle')}</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{t('auth.fullName')}</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input
                      ref={nameRef}
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm font-medium placeholder:text-slate-400"
                      value={guest.name}
                      onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{t('auth.emailLabel')}</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                      <input
                        ref={emailRef}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm font-medium placeholder:text-slate-400"
                        value={guest.email}
                        onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{t('booking.phone')}</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                      <input
                        ref={phoneRef}
                        type="tel"
                        placeholder="+66 81 234 5678"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm font-medium placeholder:text-slate-400"
                        value={guest.phone}
                        onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{t('checkout.specialRequests')} <span className="text-slate-400 font-normal">{t('checkout.optional')}</span></label>
                  <textarea
                    rows="4"
                    placeholder={t('checkout.specialRequestsPlaceholder')}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm font-medium placeholder:text-slate-400 resize-none"
                    value={guest.requests}
                    onChange={(e) => setGuest({ ...guest, requests: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4 pt-8 border-t border-slate-100">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2 border border-transparent hover:border-slate-200"
                >
                  <ArrowLeft size={20} /> {t('checkout.back')}
                </button>
                <button
                  className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(59,130,246,0.7)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden text-lg"
                  onClick={handleContinue}
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />
                  {loading ? (
                    <><Loader2 size={24} className="animate-spin" /> {t('checkout.saving')}</>
                  ) : (
                    <>{t('checkout.continuePayment')} <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </div>



            {/* Summary Sidebar */}
            <div className="w-full lg:w-96 shrink-0 order-1 lg:order-2">
              <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-28 group">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h3 className="font-display font-bold text-2xl text-slate-900 mb-6 relative z-10">{t('checkout.yourBooking')}</h3>

                {/* Hotel Info */}
                <div className="flex gap-5 mb-8 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                    <img src={bookingInfo.hotelImage || '/images/hero-bg.png'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-bold text-slate-900 leading-tight text-lg line-clamp-2">{bookingInfo.hotelName}</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">{bookingInfo.hotelCity}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm font-bold relative z-10">
                  <div className="flex justify-between items-center px-5 py-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2.5 text-slate-500"><Calendar size={18} className="text-slate-400" /> {t('search.checkIn')}</span>
                    <span className="text-slate-900">{new Date(bookingInfo.checkIn).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between items-center px-5 py-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2.5 text-slate-500"><Calendar size={18} className="text-slate-400" /> {t('search.checkOut')}</span>
                    <span className="text-slate-900">{new Date(bookingInfo.checkOut).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between items-center px-5 py-3.5 bg-primary-50/50 rounded-xl border border-primary-100 text-primary-800">
                    <span className="flex items-center gap-2.5"><Info size={18} className="text-primary-500" /> {t('checkout.duration')}</span>
                    <span className="font-black text-primary-900">{Math.ceil((new Date(bookingInfo.checkOut) - new Date(bookingInfo.checkIn)) / (1000 * 60 * 60 * 24))} {t('search.nights')}</span>
                  </div>
                </div>

                <hr className="border-slate-100 my-6 relative z-10" />

                <div className="space-y-3 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                  {bookingInfo.selections.map((sel, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border-2 border-slate-100 hover:border-primary-200 transition-colors shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-primary-400 transition-colors" />
                      <div className="flex justify-between items-start pl-3">
                        <div className="pr-4">
                          <p className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                            <BedDouble size={16} className="text-slate-400" />
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{sel.quantity}x</span>
                            {sel.roomTypeName}
                          </p>
                          <p className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-1.5"><CheckCircle size={14} className="text-primary-500" /> {sel.ratePlanName}</p>
                        </div>
                        <span className="font-bold text-slate-800 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-lg">฿{sel.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-end bg-gradient-to-br from-primary-50 to-emerald-50 p-5 rounded-2xl border border-primary-100/50 shadow-inner relative z-10">
                  <span className="text-primary-800 font-bold uppercase tracking-wider text-sm">{t('checkout.totalPrice')}</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-600 font-display">฿{bookingInfo.subtotal?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
