import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ConfirmationModal from '@/components/ConfirmationModal';
import { CreditCard, QrCode, Building, Lock, CheckCircle, Smartphone, Copy } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation State
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('bookingPayload');
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      router.push('/');
    }
  }, [router]);

  const validatePayment = () => {
    if (paymentMethod === 'credit_card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
        setErrorMessage('Please fill in all credit card details.');
        setShowError(true);
        return false;
      }
    }
    // For PromptPay and Bank Transfer, we assume user acted offline (scanning/transferring)
    // In a real app, we might ask for a slip upload.
    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const payload = {
      hotelId: bookingData.hotelId,
      roomTypeId: bookingData.roomTypeId,
      ratePlanId: bookingData.ratePlanId,
      checkIn: new Date(bookingData.checkIn).toISOString(),
      checkOut: new Date(bookingData.checkOut).toISOString(),
      guests: { adult: 2, child: 0 }, // Default guests object
      leadGuest: {
        name: bookingData.guest.name,
        email: bookingData.guest.email,
        phone: bookingData.guest.phone || ''
      },
      paymentMethod,
      paymentStatus: 'confirmed',
      totalAmount: bookingData.totalPrice
    };

    try {
      const token = localStorage.getItem('token'); // Get auth token
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result?.id) {
        localStorage.removeItem('bookingSelection');
        localStorage.removeItem('bookingPayload');
        router.push(`/booking/confirmation?id=${result.id}`);
      } else {
        console.error('Payment Failed:', result);
        setErrorMessage(result.message || 'Payment failed. Please try again or check your login status.');
        setShowError(true);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error. Please try again.');
      setShowError(true);
      setIsProcessing(false);
    }
  };

  if (!bookingData) return null;

  const { hotelName, hotelImage, hotelCity, roomTypeName, ratePlanName, totalPrice, checkIn, checkOut, guest } = bookingData;
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center gap-4 text-sm font-medium mb-8 text-slate-400">
            <span className="text-primary-600">1. Selection</span>
            <span className="text-slate-300">/</span>
            <span className="text-primary-600">2. Guest Info</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">3. Payment</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Main Content: Payment Methods */}
            <div className="flex-1 order-2 lg:order-1">
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Secure Payment</h1>
              <p className="text-slate-500 mb-8">All transactions are secure and encrypted.</p>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'credit_card' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <CreditCard size={18} /> Credit/Debit Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'promptpay' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <QrCode size={18} /> PromptPay QR
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'bank_transfer' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Building size={18} /> Bank Transfer
                  </button>
                </div>

                <div className="p-8">
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Card Number</label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                              type="text"
                              placeholder="0000 0000 0000 0000"
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none font-mono"
                              value={cardDetails.number}
                              onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none text-center font-mono"
                              value={cardDetails.expiry}
                              onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">CVC</label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                type="text"
                                placeholder="123"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none text-center font-mono"
                                value={cardDetails.cvc}
                                onChange={e => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="JOHN DOE"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none"
                            value={cardDetails.name}
                            onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                        <Lock size={14} className="text-green-600" />
                        Your payment information is encrypted and secure.
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'promptpay' && (
                    <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-white p-4 inline-block rounded-2xl shadow-sm border border-slate-200">
                        {/* Mock QR */}
                        <div className="w-48 h-48 bg-slate-900 mx-auto rounded-lg flex items-center justify-center text-white/20">
                          <QrCode size={64} />
                        </div>
                        <p className="mt-2 font-bold text-slate-900">BookingKub Co., Ltd.</p>
                        <p className="text-sm text-slate-500">PromptPay ID: 012-345-6789</p>
                      </div>
                      <p className="text-sm text-slate-600 max-w-sm mx-auto">
                        Scan this QR code with your banking app to pay. The system will automatically detect your payment.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            B.
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Bangkok Bank</p>
                            <p className="text-sm text-slate-500">Savings Account</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                          <span className="font-mono font-bold text-lg text-slate-700">123-4-56789-0</span>
                          <button className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors"><Copy size={18} /></button>
                        </div>
                        <p className="mt-4 text-sm font-bold text-slate-900">BookingKub Co., Ltd.</p>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>Please transfer the exact amount and keep your slip for verification.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-500">
                    Total to pay: <span className="font-bold text-slate-900 text-lg ml-1">฿{totalPrice?.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>Pay Now <CheckCircle size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="w-full lg:w-96 shrink-0 order-1 lg:order-2">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
                <h3 className="font-display font-bold text-xl text-slate-900 mb-4">Booking Summary</h3>

                {/* Hotel Info */}
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0 overflow-hidden">
                    {hotelImage && <img src={hotelImage} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-2">{hotelName}</p>
                    <p className="text-xs text-slate-500 mt-1">{hotelCity}</p>
                  </div>
                </div>

                <hr className="border-slate-100 my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-bold text-slate-900">{new Date(checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-out</span>
                    <span className="font-bold text-slate-900">{new Date(checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-bold text-slate-900">{nights} Nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guest</span>
                    <span className="font-bold text-slate-900">{guest?.name}</span>
                  </div>
                </div>

                <hr className="border-slate-100 my-4" />

                <div className="bg-slate-50 p-4 rounded-xl space-y-2 mb-4">
                  <p className="font-bold text-slate-900">{roomTypeName}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600">{ratePlanName}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <span className="text-slate-500 font-medium">Total Price</span>
                  <span className="text-2xl font-bold text-primary-600 font-display">฿{totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        onConfirm={() => setShowError(false)}
        title="Payment Information Required"
        message={errorMessage}
        type="warning"
      />
    </Layout >
  );
}