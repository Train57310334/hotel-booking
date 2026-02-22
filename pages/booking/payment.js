import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '@/lib/api';
import Layout from '@/components/Layout';
import ConfirmationModal from '@/components/ConfirmationModal';
import { CreditCard, QrCode, Building, Lock, CheckCircle, Tag, X, Copy, Globe } from 'lucide-react';
import Script from 'next/script';
import toast from 'react-hot-toast';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Init Stripe (Move key to env in production)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51P');

const OmisePaymentForm = ({ total, onSuccess, isProcessing, setIsProcessing }) => {
  const [card, setCard] = useState({ name: '', number: '', expiration_month: '', expiration_year: '', security_code: '' });

  const handleChange = (e) => setCard({ ...card, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const { Omise } = window;
    if (!Omise) {
      toast.error('Omise not loaded');
      setIsProcessing(false);
      return;
    }

    Omise.createToken('card', card, (statusCode, response) => {
      if (statusCode === 200) {
        onSuccess(response.id);
      } else {
        setIsProcessing(false);
        toast.error(`Omise Token Failed: ${response.message}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Cardholder Name</label>
        <input name="name" onChange={handleChange} placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Card Number</label>
        <input name="number" onChange={handleChange} maxLength={16} placeholder="4242424242424242" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 font-mono" required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Exp Month</label>
          <input name="expiration_month" onChange={handleChange} maxLength={2} placeholder="MM" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 text-center font-mono" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Exp Year</label>
          <input name="expiration_year" onChange={handleChange} maxLength={4} placeholder="YYYY" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 text-center font-mono" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">CVC</label>
          <input name="security_code" onChange={handleChange} maxLength={4} placeholder="123" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 text-center font-mono" required />
        </div>
      </div>

      <button type="submit" disabled={isProcessing} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-4 hover:bg-blue-700 transition-colors">
        {isProcessing ? 'Processing Omise...' : `Pay ฿${total?.toLocaleString()}`}
      </button>
    </form>
  );
};

// Internal Stripe Form Component
const StripePaymentForm = ({ total, onSuccess, isProcessing, setIsProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return; // Not ready

    setIsProcessing(true);
    setErrorMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // We handle redirection manually or backend confirms updates
        // If return_url is needed by payment method (e.g. 3DS), Stripe will redirect.
        return_url: window.location.origin + '/booking/confirmation',
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment Successful
      onSuccess(paymentIntent.id);
    } else {
      setErrorMessage('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-4">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mt-6 p-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl -mx-8 -mb-8">
        <div className="text-sm text-slate-500">
          Total to pay: <span className="font-bold text-slate-900 text-lg ml-1">฿{total?.toLocaleString()}</span>
        </div>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? 'Processing...' : <>Pay Now <CheckCircle size={18} /></>}
        </button>
      </div>
    </form>
  );
};

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card'); // credit_card | omise | promptpay | bank_transfer
  const [isProcessing, setIsProcessing] = useState(false);

  // Config State
  const [msg, setMsg] = useState('Loading Secure Gateway...');
  const [stripePromiseState, setStripePromiseState] = useState(null);
  const [omiseKey, setOmiseKey] = useState(null);

  // Stripe State
  const [clientSecret, setClientSecret] = useState('');
  const [stripeError, setStripeError] = useState('');

  // Promotion State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [hotelDetails, setHotelDetails] = useState(null);

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 1. Fetch Config
    apiFetch('/public-settings').then(config => {
      if (config.stripePublicKey) {
        setStripePromiseState(loadStripe(config.stripePublicKey));
      }
      if (config.omisePublicKey) {
        setOmiseKey(config.omisePublicKey);
      }
      setMsg(''); // Clear loading message once config is fetched
    }).catch(err => {
      console.error("Failed to load payment config", err);
      setMsg('Failed to load payment configuration.');
    });

    // 2. Load Booking Data
    const data = localStorage.getItem('bookingPayload');
    if (data) {
      const parsed = JSON.parse(data);
      setBookingData(parsed);

      if (parsed.hotelId) {
        apiFetch(`/hotels/${parsed.hotelId}`)
          .then(data => setHotelDetails(data))
          .catch(err => console.error('Failed to load hotel details', err));
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const calculateFinalPrice = () => {
    if (!bookingData) return 0;
    let total = bookingData.totalPrice;
    if (appliedPromo) {
      total = total - appliedPromo.discountAmount;
    }
    return Math.max(0, total);
  };

  const finalPrice = calculateFinalPrice();

  // Fetch Payment Intent when Price or Method changes
  useEffect(() => {
    if (paymentMethod === 'credit_card' && finalPrice > 0) {
      setStripeError('');
      // In dev, if key is missing, show error
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        // Optionally warn: console.warn("No Stripe Key");
      }

      apiFetch('/payments/intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: finalPrice,
          currency: 'thb', // Backend will lowercase
          description: `Booking for ${bookingData?.guest?.name}`
        })
      })
        .then(res => {
          setClientSecret(res.clientSecret);
        })
        .catch(err => {
          console.error("Stripe Intent Error:", err);
          setStripeError('Could not initialize payment gateway.');
        });
    }
  }, [paymentMethod, finalPrice, bookingData]);


  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setAppliedPromo(null);

    try {
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

  // Called when Stripe confirms OK
  const handleStripeSuccess = async (paymentIntentId) => {
    // Optionally save paymentIntentId to DB
    await completeBooking('Stripe Credit Card', 'confirmed');
  };

  // Called when Omise confirms OK
  const handleOmiseSuccess = async (tokenId) => {
    // Need to charge backend
    try {
      // Charge on backend
      await apiFetch('/payments/omise/charge', {
        method: 'POST',
        body: JSON.stringify({
          amount: finalPrice,
          token: tokenId,
          description: `Booking ${bookingData?.guest?.name}` // TODO add ID
        })
      });

      await completeBooking('Omise Credit Card', 'confirmed');
    } catch (e) {
      toast.error('Omise Charge Failed Backend: ' + e.message);
      setIsProcessing(false);
    }
  }

  // Standard Booking Submission
  const completeBooking = async (method, status) => {
    setIsProcessing(true);
    const payload = {
      hotelId: bookingData.hotelId,
      roomTypeId: bookingData.roomTypeId,
      ratePlanId: bookingData.ratePlanId,
      roomId: bookingData.roomId,
      checkIn: new Date(bookingData.checkIn).toISOString(),
      checkOut: new Date(bookingData.checkOut).toISOString(),
      guests: {
        adult: bookingData.guestsAdult || 2,
        child: bookingData.guestsChild || 0
      },
      leadGuest: {
        name: bookingData.guest.name,
        email: bookingData.guest.email,
        phone: bookingData.guest.phone || ''
      },
      paymentMethod: method,
      paymentStatus: status,
      totalAmount: finalPrice,
      promotionCode: appliedPromo ? appliedPromo.code : undefined
    };

    try {
      const result = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result?.id) {
        localStorage.removeItem('bookingSelection');
        localStorage.removeItem('bookingPayload');
        router.push(`/booking/confirmation?id=${result.id}`);
      } else {
        throw new Error('Booking could not be created');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Booking Creation Failed');
      setShowError(true);
      setIsProcessing(false);
    }
  };

  const handleManualPayment = () => {
    completeBooking(paymentMethod === 'promptpay' ? 'PromptPay' : 'Bank Transfer', 'pending');
  };

  if (!bookingData) return null;

  const { hotelName, hotelImage, hotelCity, roomTypeName, ratePlanName, checkIn, checkOut, guest } = bookingData;
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  return (
    <Layout>
      {omiseKey && (
        <Script
          id="omise-js"
          src="https://cdn.omise.co/omise.js"
          onLoad={() => {
            if (window.Omise) {
              window.Omise.setPublicKey(omiseKey);
            }
          }}
        />
      )}
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
                    <CreditCard size={18} /> Stripe
                  </button>
                  <button
                    onClick={() => setPaymentMethod('omise')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'omise' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Globe size={18} /> Omise
                  </button>
                  <button
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'promptpay' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <QrCode size={18} /> PromptPay
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'bank_transfer' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Building size={18} /> Transfer
                  </button>
                </div>

                <div className="p-8">
                  {paymentMethod === 'credit_card' && (
                    <div className="min-h-[300px]">
                      {stripeError ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{stripeError}</div>
                      ) : (clientSecret && stripePromiseState) ? (
                        <Elements stripe={stripePromiseState} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                          <StripePaymentForm
                            total={finalPrice}
                            onSuccess={handleStripeSuccess}
                            isProcessing={isProcessing}
                            setIsProcessing={setIsProcessing}
                          />
                        </Elements>
                      ) : (
                        <div className="flex items-center justify-center h-48 text-slate-400">
                          <div className="animate-spin mr-2">⏳</div> {msg || 'Loading Secure Gateway...'}
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'omise' && (
                    <div className="min-h-[300px]">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Pay via Omise</h3>
                      {omiseKey ? (
                        <OmisePaymentForm
                          total={finalPrice}
                          onSuccess={handleOmiseSuccess}
                          isProcessing={isProcessing}
                          setIsProcessing={setIsProcessing}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-48 text-slate-400">
                          <div className="animate-spin mr-2">⏳</div> Loading Omise...
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'promptpay' && (
                    <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-white p-4 inline-block rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-48 h-48 bg-slate-900 mx-auto rounded-lg flex items-center justify-center text-white/20">
                          <QrCode size={64} />
                        </div>
                        <p className="mt-2 font-bold text-slate-900">{hotelDetails?.name || 'Hotel Name'}</p>
                        <p className="text-sm text-slate-500">PromptPay ID: {hotelDetails?.promptPayId || 'Not Configured'}</p>
                      </div>
                      <p className="text-sm text-slate-600 max-w-sm mx-auto">
                        Scan with your banking app.
                      </p>
                      <button
                        onClick={handleManualPayment}
                        disabled={isProcessing}
                        className="w-full px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition"
                      >
                        {isProcessing ? 'Processing' : 'I have paid'}
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
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
                      <button
                        onClick={handleManualPayment}
                        disabled={isProcessing}
                        className="w-full px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition"
                      >
                        {isProcessing ? 'Processing' : 'I have transferred'}
                      </button>
                    </div>
                  )}
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
                    <span className="font-bold text-slate-900">฿{bookingData?.totalPrice?.toLocaleString()}</span>
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
        title="Error"
        message={errorMessage}
        type="warning"
        singleButton={true}
        confirmText="OK"
      />
    </Layout>
  );
}