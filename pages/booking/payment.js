import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '@/lib/api';
import Layout from '@/components/Layout';
import ConfirmationModal from '@/components/ConfirmationModal';
import { CreditCard, QrCode, Building, Lock, CheckCircle, Smartphone, Copy, Tag, Check, X } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation State
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [errors, setErrors] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Promotion State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const [hotelDetails, setHotelDetails] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('bookingPayload');
    if (data) {
      const parsed = JSON.parse(data);
      setBookingData(parsed);

      // Fetch Hotel Details for Payment Config
      if (parsed.hotelId) {
        apiFetch(`/hotels/${parsed.hotelId}`)
          .then(data => setHotelDetails(data))
          .catch(err => console.error('Failed to load hotel details', err));
      }
    } else {
      router.push('/');
    }
  }, [router]);

  // Luhn Algorithm for Credit Card Validation
  const luhnCheck = (val) => {
    let checksum = 0;
    let j = 1;
    for (let i = val.length - 1; i >= 0; i--) {
      let calc = 0;
      calc = Number(val.charAt(i)) * j;
      if (calc > 9) {
        checksum = checksum + 1;
        calc = calc - 10;
      }
      checksum = checksum + calc;
      if (j == 1) { j = 2 } else { j = 1 };
    }
    return (checksum % 10) == 0;
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'number':
        const cleanNumber = value.replace(/\s+/g, '');
        if (!value) error = 'Card number is required';
        else if (!/^\d+$/.test(cleanNumber)) error = 'Card number must contain only digits';
        else if (!luhnCheck(cleanNumber)) error = 'Invalid card number';
        break;
      case 'expiry':
        if (!value) error = 'Expiry date is required';
        else if (!/^\d{2}\/\d{2}$/.test(value)) error = 'Format must be MM/YY';
        else {
          const [expMonth, expYear] = value.split('/');
          const now = new Date();
          const currentYear = now.getFullYear() % 100;
          const currentMonth = now.getMonth() + 1;

          if (Number(expMonth) < 1 || Number(expMonth) > 12) error = 'Invalid month';
          else if (Number(expYear) < currentYear || (Number(expYear) === currentYear && Number(expMonth) < currentMonth)) {
            error = 'Card has expired';
          }
        }
        break;
      case 'cvc':
        if (!value) error = 'CVC is required';
        else if (!/^\d{3,4}$/.test(value)) error = 'Invalid CVC (3-4 digits)';
        break;
      case 'name':
        if (!value.trim()) error = 'Cardholder name is required';
        break;
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validatePayment = () => {
    if (paymentMethod === 'credit_card') {
      const newErrors = {
        number: validateField('number', cardDetails.number),
        expiry: validateField('expiry', cardDetails.expiry),
        cvc: validateField('cvc', cardDetails.cvc),
        name: validateField('name', cardDetails.name)
      };

      setErrors(newErrors);

      if (Object.values(newErrors).some(err => err)) {
        return false;
      }
    }
    return true;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setAppliedPromo(null);

    try {
      // Use apiFetch to call backend directly
      const result = await apiFetch('/promotions/validate', {
        method: 'POST',
        body: JSON.stringify({ code: promoCode, amount: bookingData.totalPrice })
      });

      if (result.valid) {
        setAppliedPromo(result);
      } else {
        setPromoError('Invalid promotion code');
      }
    } catch (err) {
      setPromoError(err.message || 'Failed to validate promotion');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const calculateFinalPrice = () => {
    if (!bookingData) return 0;
    let total = bookingData.totalPrice;
    if (appliedPromo) {
      total = total - appliedPromo.discountAmount;
    }
    return Math.max(0, total);
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate final price again to be safe
    const finalTotal = calculateFinalPrice();

    const payload = {
      hotelId: bookingData.hotelId,
      roomTypeId: bookingData.roomTypeId,
      ratePlanId: bookingData.ratePlanId,
      roomId: bookingData.roomId, // Ensure roomId is passed if selected
      checkIn: new Date(bookingData.checkIn).toISOString(),
      checkOut: new Date(bookingData.checkOut).toISOString(),
      guests: { adult: 2, child: 0 }, // Should ideally come from bookingData
      leadGuest: {
        name: bookingData.guest.name,
        email: bookingData.guest.email,
        phone: bookingData.guest.phone || ''
      },
      paymentMethod,
      paymentStatus: 'confirmed',
      totalAmount: finalTotal,
      promotionCode: appliedPromo ? appliedPromo.code : undefined
    };

    try {
      // Use apiFetch for bookings as well
      const result = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result?.id) {
        localStorage.removeItem('bookingSelection');
        localStorage.removeItem('bookingPayload');
        router.push(`/booking/confirmation?id=${result.id}`);
      } else {
        console.error('Payment Failed:', result);
        setErrorMessage('Payment failed. Please try again.');
        setShowError(true);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Network error. Please try again.');
      setShowError(true);
      setIsProcessing(false);
    }
  };

  if (!bookingData) return null;

  const { hotelName, hotelImage, hotelCity, roomTypeName, ratePlanName, totalPrice, checkIn, checkOut, guest } = bookingData;
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const finalPrice = calculateFinalPrice();

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
                              className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary-100 outline-none font-mono ${errors.number ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-400'}`}
                              value={cardDetails.number}
                              onChange={e => handleInputChange('number', e.target.value)}
                            />
                          </div>
                          {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary-100 outline-none text-center font-mono ${errors.expiry ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-400'}`}
                              value={cardDetails.expiry}
                              onChange={e => handleInputChange('expiry', e.target.value)}
                            />
                            {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">CVC</label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                type="text"
                                placeholder="123"
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary-100 outline-none text-center font-mono ${errors.cvc ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-400'}`}
                                value={cardDetails.cvc}
                                onChange={e => handleInputChange('cvc', e.target.value)}
                              />
                            </div>
                            {errors.cvc && <p className="text-xs text-red-500 mt-1">{errors.cvc}</p>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="JOHN DOE"
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-primary-100 outline-none ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary-400'}`}
                            value={cardDetails.name}
                            onChange={e => handleInputChange('name', e.target.value)}
                          />
                          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
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
                        <p className="mt-2 font-bold text-slate-900">{hotelDetails?.name || 'Hotel Name'}</p>
                        <p className="text-sm text-slate-500">PromptPay ID: {hotelDetails?.promptPayId || 'Not Configured'}</p>
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
                            <p className="font-bold text-slate-900">{hotelDetails?.bankName || 'Bank Name'}</p>
                            <p className="text-sm text-slate-500">Savings Account</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                          <span className="font-mono font-bold text-lg text-slate-700">{hotelDetails?.bankAccountNumber || '000-0-00000-0'}</span>
                          <button className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-colors"><Copy size={18} /></button>
                        </div>
                        <p className="mt-4 text-sm font-bold text-slate-900">{hotelDetails?.bankAccountName || hotelDetails?.name || 'Account Name'}</p>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>Please transfer the exact amount and keep your slip for verification.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-500">
                    Total to pay: <span className="font-bold text-slate-900 text-lg ml-1">฿{finalPrice?.toLocaleString()}</span>
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

                {/* Promo Code Section */}
                <div className="mb-6">
                  <p className="text-sm font-bold text-slate-700 mb-2">Promotion Code</p>
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode}
                        className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors"
                      >
                        {promoLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Tag size={14} />
                        {appliedPromo.code}
                      </div>
                      <button onClick={handleRemovePromo} className="text-green-700 hover:text-green-900"><X size={16} /></button>
                    </div>
                  )}
                  {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900">฿{totalPrice?.toLocaleString()}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedPromo.code})</span>
                      <span className="font-bold">- ฿{appliedPromo.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Total Price</span>
                  <span className="text-2xl font-bold text-primary-600 font-display">฿{finalPrice?.toLocaleString()}</span>
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
        singleButton={true}
        confirmText="OK"
      />
    </Layout >
  );
}