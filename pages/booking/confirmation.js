// ✅ pages/booking/confirmation.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { CheckCircle, Calendar, Users, MapPin, Printer, Home, Download, Copy, Lock, CreditCard } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import toast from 'react-hot-toast';

export default function ConfirmationPage() {
  const router = useRouter();
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
    const backend = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';
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
          <p className="text-slate-500">Loading your reservation...</p>
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Not Found</h1>
          <p className="text-slate-500 mb-8">We couldn't retrieve the booking details. Please check the ID or contact support.</p>
          <button onClick={() => router.push('/')} className="btn-primary px-8 py-3">Return to Home</button>
        </div>
      </Layout>
    );
  }

  const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
  const isPaid = booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'checked_out';

  return (
    <Layout>
      <div className="bg-slate-900 pb-32 pt-12 print:hidden">
        <div className="container mx-auto px-4 text-center">
          <div className={`inline-flex items-center justify-center p-4 ${isPaid ? 'bg-green-500/20' : 'bg-yellow-500/20'} backdrop-blur-sm rounded-full mb-6`}>
            {isPaid ? <CheckCircle size={48} className="text-green-400" /> : <Lock size={48} className="text-yellow-400" />}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            {isPaid ? 'Booking Confirmed!' : 'Booking Pending Payment'}
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            {isPaid
              ? <span>Thank you, <span className="text-white font-bold">{booking.leadName}</span>. Your reservation is fully paid and confirmed.</span>
              : <span>Hello, <span className="text-white font-bold">{booking.leadName}</span>. Please complete your payment to secure this room.</span>
            }
          </p>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block p-8 mb-8 border-b border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Booking Confirmation</h1>
            <p className="text-slate-500 text-sm">Thank you for choosing BookingKub.</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-display font-bold tracking-tight text-primary-600 block">
              BookingKub
            </span>
            <p className="text-xs text-slate-400 mt-1">123 Bangkok, Thailand</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 pb-20 relative z-10 print:mt-0 print:pb-0 print:px-0">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 print:shadow-none print:border-none print:max-w-none print:rounded-none">
          <div className="flex flex-col md:flex-row border-b border-slate-100">
            <div className="p-8 md:p-12 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Booking Reference</p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-mono font-bold text-slate-900 text-wrap break-all">{booking.id}</h2>
                    <button onClick={() => { navigator.clipboard.writeText(booking.id); toast.success('Copied') }} className="text-slate-400 hover:text-primary-600 transition-colors print:hidden" title="Copy ID">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-bold rounded-lg border ${isPaid ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                  {isPaid ? 'Confirmed' : 'Pending Payment'}
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Calendar size={20} className="text-slate-400" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Check-in</p>
                      <p className="font-bold text-slate-900">{new Date(booking.checkIn).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">From 14:00</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Check-out</p>
                      <p className="font-bold text-slate-900">{new Date(booking.checkOut).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">Until 12:00</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Users size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Guests</p>
                    <p className="font-bold text-slate-900">
                      {booking.guestsAdult} Adults, {booking.guestsChild} Children
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Hotel</p>
                    <p className="font-bold text-slate-900">{booking.hotel?.name}</p>
                    <p className="text-sm text-slate-500">{booking.hotel?.address}, {booking.hotel?.city}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 md:p-12 w-full md:w-80 shrink-0 print:bg-white print:p-0 print:border-l print:border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6">Payment Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{booking.roomType?.name} x {nights} nights</span>
                  <span className="font-medium text-slate-900">฿{(booking.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Taxes & Fees</span>
                  <span className="font-medium text-slate-900">Included</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-900">Total Paid</span>
                  <span className="text-2xl font-display font-bold text-primary-600">฿{(booking.totalAmount || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">
                  {isPaid ? 'Payment Confirmed' : 'Payment Required'}
                </p>
              </div>

              <div className="space-y-3 print:hidden">
                {!isPaid && (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 animate-pulse"
                  >
                    <CreditCard size={18} /> Pay Now
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Print Confirmation
                </button>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 p-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
            <p className="text-primary-800 font-medium text-sm text-center md:text-left">
              Need to make changes? You can manage your booking online.
            </p>
            <button onClick={() => router.push('/')} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors flex items-center gap-2">
              <Home size={18} /> Return Home
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