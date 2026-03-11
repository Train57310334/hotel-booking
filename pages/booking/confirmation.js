// ✅ pages/booking/confirmation.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { API_BASE } from '@/lib/api';
import Navbar from '@/components/NavBar';
import Layout from '@/components/Layout';
import { CheckCircle, Calendar, Users, MapPin, Printer, Home, Download, Copy, Lock, CreditCard } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';

export default function ConfirmationPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setTheme } = useTheme();
  const { id } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = () => {
    const backend = API_BASE;
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${backend}/bookings/${id}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Booking not found');
        return res.json();
      })
      .then(data => {
        setBooking(data);
        if (data.hotel && data.hotel.theme) {
          setTheme(data.hotel.theme);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    fetchBooking(); // Refresh status
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-slate-500">{t('confirmation.loading')}</p>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-bold">!</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('confirmation.notFoundTitle')}</h1>
          <p className="text-slate-500 mb-8">{t('confirmation.notFoundDesc')}</p>
          <button onClick={() => router.push('/')} className="btn-primary px-8 py-3">{t('confirmation.returnHome')}</button>
        </div>
      </Layout>
    );
  }

  const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
  const isPaid = booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out';

  return (
    <Layout navbarProps={{ brandName: booking?.hotel?.name, logo: booking?.hotel?.logoUrl, facebookUrl: booking?.hotel?.facebookUrl, instagramUrl: booking?.hotel?.instagramUrl, twitterUrl: booking?.hotel?.twitterUrl, footerDescription: booking?.hotel?.footerDescription }}>
      <div className="relative bg-slate-900 pb-32 pt-16 md:pt-24 print:hidden overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-primary-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block relative">
            <div className={`absolute inset-0 rounded-full blur-xl ${isPaid ? 'bg-emerald-500/30 animate-pulse' : 'bg-amber-500/30 animate-pulse'}`} />
            <div className={`relative inline-flex items-center justify-center p-5 ${isPaid ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30' : 'bg-gradient-to-b from-amber-500/20 to-amber-500/10 border border-amber-500/30'} backdrop-blur-xl rounded-full mb-8 shadow-2xl`}>
              {isPaid ? <CheckCircle size={56} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" /> : <Lock size={56} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />}
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-6 tracking-tight drop-shadow-md">
            {isPaid ? t('confirmation.titlePaid') : t('confirmation.titlePending')}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            {isPaid
              ? <span>{t('confirmation.thankYouName')} <span className="text-white font-bold border-b border-white/20 pb-0.5">{booking.leadName}</span>. {t('confirmation.descPaid')}</span>
              : <span>{t('confirmation.helloName')} <span className="text-white font-bold border-b border-white/20 pb-0.5">{booking.leadName}</span>. {t('confirmation.descPending')}</span>
            }
          </p>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block p-8 mb-8 border-b border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{t('confirmation.heading')}</h1>
            <p className="text-slate-500 text-sm">{t('confirmation.thankYou')}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-display font-bold tracking-tight text-primary-600 block">
              BookingKub
            </span>
            <p className="text-xs text-slate-400 mt-1">123 Bangkok, Thailand</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 pb-24 relative z-20 print:mt-0 print:pb-0 print:px-0">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-900/10 overflow-hidden border border-slate-200/60 print:shadow-none print:border-none print:max-w-none print:rounded-none">
          <div className="flex flex-col md:flex-row border-b border-slate-100">
            <div className="p-8 md:p-12 flex-1 border-b md:border-b-0 md:border-r border-slate-100 min-w-0">
              <div className="flex justify-between items-start mb-10 pb-8 border-b border-slate-100 flex-wrap gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">{t('confirmation.bookingReference')}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl md:text-3xl font-mono font-bold text-slate-900 tracking-tight break-all">{booking.id.split('-')[0] || booking.id}</h2>
                    <button onClick={() => { navigator.clipboard.writeText(booking.id); toast.success('Copied') }} className="p-2 shrink-0 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all print:hidden" title="Copy ID">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <span className={`shrink-0 px-4 py-2 text-sm font-bold rounded-xl border ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'}`}>
                  {isPaid ? t('confirmation.statusConfirmed') : t('confirmation.statusPending')}
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Calendar size={20} className="text-slate-400" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">{t('search.checkIn')}</p>
                      <p className="font-bold text-slate-900">{new Date(booking.checkIn).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">{t('confirmation.fromTime')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">{t('search.checkOut')}</p>
                      <p className="font-bold text-slate-900">{new Date(booking.checkOut).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">{t('confirmation.untilTime')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Users size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{t('confirmation.guests')}</p>
                    <p className="font-bold text-slate-900">
                      {booking.guestsAdult} {t('confirmation.adults')}, {booking.guestsChild} {t('confirmation.children')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{t('confirmation.hotel')}</p>
                    <p className="font-bold text-slate-900">{booking.hotel?.name}</p>
                    <p className="text-sm text-slate-500">{booking.hotel?.address}, {booking.hotel?.city}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 md:p-12 w-full md:w-80 shrink-0 print:bg-white print:p-0 print:border-l print:border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6">{t('confirmation.paymentSummary')}</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{booking.roomType?.name} x {nights} {t('search.nights')}</span>
                  <span className="font-medium text-slate-900">฿{(booking.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('confirmation.taxesAndFees')}</span>
                  <span className="font-medium text-slate-900">{t('confirmation.included')}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-900">{t('confirmation.totalPaid')}</span>
                  <span className="text-2xl font-display font-bold text-primary-600">฿{(booking.totalAmount || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">
                  {isPaid ? t('confirmation.paymentConfirmed') : t('confirmation.paymentRequired')}
                </p>
              </div>

              <div className="space-y-4 print:hidden mt-10">
                {!isPaid && (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full py-4 bg-[#1C58EA] text-white rounded-xl font-bold hover:bg-[#1642b3] shadow-[0_8px_20px_-6px_rgba(28,88,234,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(28,88,234,0.7)] flex items-center justify-center gap-2 animate-pulse relative overflow-hidden group transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />
                    <CreditCard size={20} /> {t('payment.payNow')}
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> {t('confirmation.print')}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 p-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
            <p className="text-primary-800 font-medium text-sm text-center md:text-left">
              {t('confirmation.needChanges')}
            </p>
            <button onClick={() => router.push('/')} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors flex items-center gap-2">
              <Home size={18} /> {t('confirmation.returnHome')}
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          booking={booking}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Layout>
  );
}