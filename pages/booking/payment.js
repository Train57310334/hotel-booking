import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '@/lib/api';
import Layout from '@/components/Layout';
import ConfirmationModal from '@/components/ConfirmationModal';
import { CreditCard, QrCode, Building, Lock, CheckCircle, Tag, X, Copy, Globe } from 'lucide-react';
import Script from 'next/script';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamic import — avoids SSR issues with browser-only canvas/qrcode APIs
const PromptPayQR = dynamic(() => import('@/components/PromptPayQR'), { ssr: false });


// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLanguage } from '@/contexts/LanguageContext';

// Init Stripe (Move key to env in production)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51P');

const OmisePaymentForm = ({ total, onSuccess, isProcessing, setIsProcessing }) => {
  const { t } = useLanguage();
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
        <label className="text-sm font-bold text-slate-700">{t('payment.cardholderName')}</label>
        <input name="name" onChange={handleChange} placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">{t('payment.cardNumber')}</label>
        <input name="number" onChange={handleChange} maxLength={16} placeholder="4242424242424242" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 font-mono" required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">{t('payment.expMonth')}</label>
          <input name="expiration_month" onChange={handleChange} maxLength={2} placeholder="MM" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 text-center font-mono" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">{t('payment.expYear')}</label>
          <input name="expiration_year" onChange={handleChange} maxLength={4} placeholder="YYYY" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 text-center font-mono" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">{t('payment.cvc')}</label>
          <input name="security_code" onChange={handleChange} maxLength={4} placeholder="123" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 text-center font-mono" required />
        </div>
      </div>

      <button type="submit" disabled={isProcessing} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-4 hover:bg-blue-700 transition-colors">
        {isProcessing ? t('payment.processing') : `${t('payment.payBtn')} ฿${total?.toLocaleString()}`}
      </button>
    </form>
  );
};

// Internal Stripe Form Component
const StripePaymentForm = ({ total, onSuccess, isProcessing, setIsProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useLanguage();

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
          {t('checkout.totalPrice')}: <span className="font-bold text-slate-900 text-lg ml-1">฿{total?.toLocaleString()}</span>
        </div>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? t('payment.processing') : <>{t('payment.payNow')} <CheckCircle size={18} /></>}
        </button>
      </div>
    </form>
  );
};

export default function PaymentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

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
    // 1. Fetch Payment Config
    apiFetch('/public-settings').then(config => {
      if (config.stripePublicKey) setStripePromiseState(loadStripe(config.stripePublicKey));
      if (config.omisePublicKey) setOmiseKey(config.omisePublicKey);
      setMsg('');
    }).catch(err => {
      console.error('Failed to load payment config', err);
      setMsg('Failed to load payment configuration.');
    });

    // 2. Load Booking Payload — 3-tier resilience strategy:
    //    Tier 1: sessionStorage (fast, same-tab, survives F5)
    //    Tier 2: Server draft via URL ?ref= (survives tab close, 15-min TTL)
    //    Tier 3: Show "Session Expired" UI (never silently redirect to home)
    const loadBookingData = async () => {
      // Tier 1: sessionStorage
      const stored = sessionStorage.getItem('bookingPayload');
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookingData(parsed);
        if (parsed.hotelId) {
          apiFetch(`/hotels/${parsed.hotelId}`).then(r => setHotelDetails(r)).catch(() => { });
        }
        return;
      }

      // Tier 2: Server draft via URL ref param
      const refId = router.query.ref;
      if (refId) {
        try {
          const draft = await apiFetch(`/bookings/draft/${refId}`);
          if (draft) {
            setBookingData(draft);
            // Restore sessionStorage from server
            sessionStorage.setItem('bookingPayload', JSON.stringify(draft));
            if (draft.hotelId) {
              apiFetch(`/hotels/${draft.hotelId}`).then(r => setHotelDetails(r)).catch(() => { });
            }
            return;
          }
        } catch (e) {
          // Draft expired or not found — fall through to expired UI
          console.warn('Booking draft not found or expired:', e.message);
        }
      }

      // Tier 3: Session expired
      setSessionExpired(true);
    };

    if (router.isReady) loadBookingData();
  }, [router.isReady, router.query.ref]);

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

  // ✅ Single point of booking creation — called AFTER payment succeeds
  // Uses /bookings/public which supports multi-room, atomic transactions, and inventory deduction
  const completeBooking = async (method, status) => {
    setIsProcessing(true);

    const guestDetails = bookingData.guestDetails || {};
    const selections = bookingData.selections || [];

    // Build multi-room payload for /bookings/public
    const payload = {
      hotelId: bookingData.hotelId,
      checkInDate: new Date(bookingData.checkIn).toISOString(),
      checkOutDate: new Date(bookingData.checkOut).toISOString(),
      adults: bookingData.adults ?? 2,
      children: bookingData.children ?? 0,
      totalPrice: finalPrice,
      rooms: selections.map(sel => ({
        roomTypeId: sel.roomTypeId,
        ratePlanId: sel.ratePlanId,
        quantity: sel.quantity,
      })),
      promotionCode: appliedPromo?.code || null,
      guestDetails: {
        name: guestDetails.name || '',
        email: guestDetails.email || '',
        phone: guestDetails.phone || '',
        requests: guestDetails.requests || '',
      },
      paymentMethod: method,
      paymentStatus: status,
      promotionCode: appliedPromo ? appliedPromo.code : undefined,
    };

    try {
      const result = await apiFetch('/bookings/public', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result?.id) {
        // Clean up all session storage after successful booking
        localStorage.removeItem('bookingCart');
        localStorage.removeItem('bookingPayload');
        sessionStorage.removeItem('bookingPayload');
        sessionStorage.removeItem('bookingDraftId');
        router.push(`/booking/confirmation?id=${result.id}`);
      } else {
        throw new Error('Booking could not be created');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Booking creation failed. Please try again.');
      setShowError(true);
      setIsProcessing(false);
    }
  };

  const handleManualPayment = () => {
    completeBooking(paymentMethod === 'promptpay' ? 'PromptPay' : 'Bank Transfer', 'pending');
  };

  if (sessionExpired) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-2 border-amber-200">
            <Lock size={36} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">{t('payment.sessionExpiredTitle')}</h1>
          <p className="text-slate-500 max-w-md mb-8">
            {t('payment.sessionExpiredDesc')}
          </p>
          <button
            onClick={() => router.push('/search')}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
          >
            {t('payment.startNewBooking')}
          </button>
        </div>
      </Layout>
    );
  }

  if (!bookingData) return null;

  const { hotelName, hotelImage, hotelCity, roomTypeName, ratePlanName, checkIn, checkOut } = bookingData;
  const guest = bookingData.guestDetails || {};
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
            <span className="text-primary-600">{t('checkout.step1')}</span>
            <span className="text-slate-300">/</span>
            <span className="text-primary-600">{t('checkout.step2')}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">{t('checkout.step3')}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Main Content: Payment Methods */}
            <div className="flex-1 order-2 lg:order-1">
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{t('payment.securePayment')}</h1>
              <p className="text-slate-500 mb-8">{t('payment.secureSubtitle')}</p>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'credit_card' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <CreditCard size={18} /> {t('payment.stripe')}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('omise')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'omise' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Globe size={18} /> {t('payment.omise')}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'promptpay' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <QrCode size={18} /> {t('payment.promptPay')}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${paymentMethod === 'bank_transfer' ? 'bg-white text-primary-600 border-t-2 border-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Building size={18} /> {t('payment.transfer')}
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
                      {/* ✅ Real PromptPay QR Code — generated from hotel's promptPayId */}
                      {hotelDetails?.promptPayId ? (
                        <PromptPayQR
                          promptPayId={hotelDetails.promptPayId}
                          amount={finalPrice}
                          hotelName={hotelDetails.name}
                        />
                      ) : (
                        <div className="w-60 h-60 mx-auto flex flex-col items-center justify-center bg-amber-50 rounded-2xl border-2 border-dashed border-amber-200 text-amber-600 text-center p-4">
                          <span className="text-4xl mb-3">⚙️</span>
                          <p className="font-bold">PromptPay Not Configured</p>
                          <p className="text-xs mt-1 text-amber-500">Hotel admin needs to set a PromptPay ID in Settings</p>
                        </div>
                      )}
                      <p className="text-sm text-slate-600 max-w-sm mx-auto">
                        Scan this QR code with any banking app that supports PromptPay.
                      </p>
                      <button
                        onClick={handleManualPayment}
                        disabled={isProcessing}
                        className="w-full px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'I have paid ✓'}
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
                <h3 className="font-display font-bold text-xl text-slate-900 mb-4">{t('payment.bookingSummary')}</h3>

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
                    <span className="text-slate-500">{t('search.checkIn')}</span>
                    <span className="font-bold text-slate-900">{new Date(checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('search.checkOut')}</span>
                    <span className="font-bold text-slate-900">{new Date(checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('checkout.duration')}</span>
                    <span className="font-bold text-slate-900">{nights} {t('search.nights')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('payment.guest')}</span>
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
                  <p className="text-sm font-bold text-slate-700 mb-2">{t('payment.promoCode')}</p>
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                        placeholder={t('payment.enterCode')}
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode}
                        className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors"
                      >
                        {promoLoading ? '...' : t('payment.apply')}
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
                    <span className="text-slate-500">{t('payment.subtotal')}</span>
                    <span className="font-bold text-slate-900">฿{bookingData?.totalPrice?.toLocaleString()}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t('payment.discount')} ({appliedPromo.code})</span>
                      <span className="font-bold">- ฿{appliedPromo.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">{t('checkout.totalPrice')}</span>
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