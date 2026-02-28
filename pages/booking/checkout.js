// ✅ pages/booking/checkout.js (Guest Info - No API Call for Booking)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ConfirmationModal from '@/components/ConfirmationModal';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Mail, Phone, Calendar, ArrowRight, ArrowLeft, BedDouble, Info, CheckCircle, Loader2 } from 'lucide-react';

export default function GuestInfoPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [bookingInfo, setBookingInfo] = useState(null);
  const [showError, setShowError] = useState(false);
  const [guest, setGuest] = useState({ name: '', email: '', phone: '', requests: '' });
  const { user } = useAuth();

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
    if (!guest.name || !guest.email || !guest.phone) {
      setShowError(true);
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
    <Layout>
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
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                      value={guest.name}
                      onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{t('auth.emailLabel')}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
                        value={guest.email}
                        onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">{t('booking.phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="tel"
                        placeholder="+66 81 234 5678"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all"
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
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all resize-none"
                    value={guest.requests}
                    onChange={(e) => setGuest({ ...guest, requests: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4 pt-8 border-t border-slate-100">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={20} /> {t('checkout.back')}
                </button>
                <button
                  className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 group"
                  onClick={handleContinue}
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 size={20} className="animate-spin" /> {t('checkout.saving')}</>
                  ) : (
                    <>{t('checkout.continuePayment')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </div>

            <ConfirmationModal
              isOpen={showError}
              onClose={() => setShowError(false)}
              onConfirm={() => setShowError(false)}
              title={t('checkout.missingInfoTitle')}
              message={t('checkout.missingInfoMessage')}
              type="warning"
              singleButton={true}
              confirmText="OK"
            />

            {/* Summary Sidebar */}
            <div className="w-full lg:w-96 shrink-0 order-1 lg:order-2">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
                <h3 className="font-display font-bold text-xl text-slate-900 mb-4">{t('checkout.yourBooking')}</h3>

                {/* Hotel Info */}
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0 overflow-hidden">
                    {bookingInfo.hotelImage && <img src={bookingInfo.hotelImage} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-2">{bookingInfo.hotelName}</p>
                    <p className="text-xs text-slate-500 mt-1">{bookingInfo.hotelCity}</p>
                  </div>
                </div>

                <hr className="border-slate-100 my-4" />

                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2 text-slate-500"><Calendar size={16} /> {t('search.checkIn')}</span>
                    <span className="text-slate-900">{new Date(bookingInfo.checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2 text-slate-500"><Calendar size={16} /> {t('search.checkOut')}</span>
                    <span className="text-slate-900">{new Date(bookingInfo.checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
                    <span className="flex items-center gap-2"><Info size={16} /> {t('checkout.duration')}</span>
                    <span className="font-bold">{Math.ceil((new Date(bookingInfo.checkOut) - new Date(bookingInfo.checkIn)) / (1000 * 60 * 60 * 24))} {t('search.nights')}</span>
                  </div>
                </div>

                <hr className="border-slate-100 my-4" />

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {bookingInfo.selections.map((sel, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-200 transition-colors shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-emerald-400 transition-colors" />
                      <div className="flex justify-between items-start pl-2">
                        <div className="pr-4">
                          <p className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                            <BedDouble size={16} className="text-slate-400" />
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{sel.quantity}x</span>
                            {sel.roomTypeName}
                          </p>
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-500" /> {sel.ratePlanName}</p>
                        </div>
                        <span className="font-bold text-slate-700 whitespace-nowrap">฿{sel.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-end bg-emerald-50 p-4 rounded-xl border border-emerald-100 mt-6">
                  <span className="text-emerald-800 font-bold uppercase tracking-wider text-sm">{t('checkout.totalPrice')}</span>
                  <span className="text-3xl font-black text-emerald-600 font-display">฿{bookingInfo.subtotal?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
