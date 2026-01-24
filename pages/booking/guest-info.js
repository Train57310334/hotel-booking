// ✅ pages/booking/guest-info.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ConfirmationModal from '@/components/ConfirmationModal';
import { User, Mail, Phone, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

export default function GuestInfoPage() {
  const router = useRouter();
  const [bookingInfo, setBookingInfo] = useState(null);
  const [showError, setShowError] = useState(false);
  const [guest, setGuest] = useState({ name: '', email: '', phone: '', requests: '' });

  useEffect(() => {
    const stored = localStorage.getItem('bookingSelection');
    if (stored) {
      setBookingInfo(JSON.parse(stored));
    } else {
      router.push('/');
    }
  }, [router]);

  const handleContinue = () => {
    if (!guest.name || !guest.email || !guest.phone) {
      setShowError(true);
      return;
    }
    const payload = {
      ...bookingInfo,
      guest,
    };
    localStorage.setItem('bookingPayload', JSON.stringify(payload));
    router.push('/booking/payment');
  };

  if (!bookingInfo) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps (Optional) */}
          <div className="flex items-center gap-4 text-sm font-medium mb-8 text-slate-400">
            <span className="text-primary-600">1. Selection</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">2. Guest Info</span>
            <span className="text-slate-300">/</span>
            <span>3. Payment</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Form Section */}
            <div className="flex-1 order-2 lg:order-1">
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Who's checking in?</h1>
              <p className="text-slate-500 mb-8">Please tell us who will be staying at the hotel.</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
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
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
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
                    <label className="text-sm font-bold text-slate-700">Phone Number</label>
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
                  <label className="text-sm font-bold text-slate-700">Special Requests <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <textarea
                    rows="4"
                    placeholder="Any special preferences provided..."
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
                  <ArrowLeft size={20} /> Back
                </button>
                <button
                  className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 group"
                  onClick={handleContinue}
                >
                  Continue to Payment <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <ConfirmationModal
              isOpen={showError}
              onClose={() => setShowError(false)}
              onConfirm={() => setShowError(false)}
              title="Missing Information"
              message="Please fill in all required fields (Name, Email, and Phone) to proceed."
              type="warning"
            />

            {/* Summary Sidebar */}
            <div className="w-full lg:w-96 shrink-0 order-1 lg:order-2">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
                <h3 className="font-display font-bold text-xl text-slate-900 mb-4">Your Booking</h3>

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

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-bold text-slate-900">{new Date(bookingInfo.checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-out</span>
                    <span className="font-bold text-slate-900">{new Date(bookingInfo.checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-bold text-slate-900">{Math.ceil((new Date(bookingInfo.checkOut) - new Date(bookingInfo.checkIn)) / (1000 * 60 * 60 * 24))} Nights</span>
                  </div>
                </div>

                <hr className="border-slate-100 my-4" />

                <div className="bg-slate-50 p-4 rounded-xl space-y-2 mb-4">
                  <p className="font-bold text-slate-900">{bookingInfo.roomTypeName}</p>
                  <p className="text-xs text-slate-500">{bookingInfo.ratePlanName}</p>
                </div>

                <div className="flex justify-between items-end">
                  <span className="text-slate-500 font-medium">Total Price</span>
                  <span className="text-2xl font-bold text-primary-600 font-display">฿{bookingInfo.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
