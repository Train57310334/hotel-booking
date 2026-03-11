import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '@/lib/api';
import Layout from '@/components/Layout';
import ConfirmationModal from '@/components/ConfirmationModal';
import { CreditCard, QrCode, Building, Lock, CheckCircle, Tag, X, Copy, Globe, Info, Loader2 } from 'lucide-react';
import Script from 'next/script';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamic import — avoids SSR issues with browser-only canvas/qrcode APIs
const PromptPayQR = dynamic(() => import('@/components/PromptPayQR'), { ssr: false });


import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

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
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">{t('payment.cardholderName')}</label>
        <input name="name" onChange={handleChange} placeholder="John Doe" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 shadow-sm transition-all font-medium placeholder:text-slate-400" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">{t('payment.cardNumber')}</label>
        <div className="relative group">
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input name="number" onChange={handleChange} maxLength={16} placeholder="4242 4242 4242 4242" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 shadow-sm transition-all font-mono font-medium placeholder:text-slate-400 tracking-wide" required />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">{t('payment.expMonth')}</label>
          <input name="expiration_month" onChange={handleChange} maxLength={2} placeholder="MM" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 shadow-sm transition-all text-center font-mono font-medium placeholder:text-slate-400" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">{t('payment.expYear')}</label>
          <input name="expiration_year" onChange={handleChange} maxLength={4} placeholder="YY" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 shadow-sm transition-all text-center font-mono font-medium placeholder:text-slate-400" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">{t('payment.cvc')}</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
            <input name="security_code" onChange={handleChange} maxLength={4} placeholder="123" className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 shadow-sm transition-all text-center font-mono font-medium placeholder:text-slate-400" required />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
        <div className="text-sm text-slate-500">
          {t('checkout.totalPrice')}: <span className="font-bold text-slate-900 text-lg ml-1">฿{total?.toLocaleString()}</span>
        </div>
        <button type="submit" disabled={isProcessing} className="px-8 py-3.5 bg-[#1C58EA] text-white font-bold rounded-xl shadow-lg shadow-[#1C58EA]/20 hover:bg-[#1642b3] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />
          {isProcessing ? t('payment.processing') : <>{t('payment.payNow')} <CheckCircle size={18} /></>}
        </button>
      </div>
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

      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
        <div className="text-sm text-slate-500">
          {t('checkout.totalPrice')}: <span className="font-bold text-slate-900 text-lg ml-1">฿{total?.toLocaleString()}</span>
        </div>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(59,130,246,0.7)] hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />
          {isProcessing ? t('payment.processing') : <>{t('payment.payNow')} <CheckCircle size={18} /></>}
        </button>
      </div>
    </form>
  );
};

export default function PaymentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setTheme } = useTheme();
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
    // 1. Load Booking Payload — 3-tier resilience strategy:
    const loadBookingData = async () => {
      let currentBookingData = null;

      // Tier 1: sessionStorage
      const stored = sessionStorage.getItem('bookingPayload');
      if (stored) {
        currentBookingData = JSON.parse(stored);
        if (currentBookingData.hotelTheme) {
          setTheme(currentBookingData.hotelTheme);
        }
      } else {
        // Tier 2: Server draft via URL ref param
        const refId = router.query.ref;
        if (refId) {
          try {
            const draft = await apiFetch(`/bookings/draft/${refId}`);
            if (draft) {
              currentBookingData = draft;
              if (draft.hotelTheme) {
                setTheme(draft.hotelTheme);
              }
              sessionStorage.setItem('bookingPayload', JSON.stringify(draft));
            }
          } catch (e) {
            console.warn('Booking draft not found or expired:', e.message);
          }
        }
      }

      if (!currentBookingData) {
        // Tier 3: Session expired
        setSessionExpired(true);
        return;
      }

      setBookingData(currentBookingData);

      // 2. Fetch Hotel Details for Public Keys
      let hotelPubKeys = {};
      if (currentBookingData.hotelId) {
        try {
          const res = await apiFetch(`/hotels/${currentBookingData.hotelId}`);
          setHotelDetails(res);
          hotelPubKeys = {
            stripePublicKey: res.stripePublicKey,
            omisePublicKey: res.omisePublicKey
          };
        } catch (e) { }
      }

      // 3. Fetch Global Settings Fallback and Init Gateways
      apiFetch('/public-settings').then(config => {
        const finalStripeKey = hotelPubKeys.stripePublicKey || config.stripePublicKey;
        const finalOmiseKey = hotelPubKeys.omisePublicKey || config.omisePublicKey;

        if (finalStripeKey) setStripePromiseState(loadStripe(finalStripeKey));
        if (finalOmiseKey) setOmiseKey(finalOmiseKey);
        setMsg('');
      }).catch(err => {
        console.error('Failed to load payment config', err);
        setMsg('Failed to load payment configuration.');
      });
    };

    if (router.isReady) loadBookingData();
  }, [router.isReady, router.query.ref]);

  const calculateFinalPrice = () => {
    if (!bookingData) return 0;
    let total = bookingData.subtotal || bookingData.totalPrice || 0;
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
          description: `Booking for ${bookingData?.guest?.name}`,
          bookingId: bookingData.id
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
      // ✅ BUG #7 FIX: Removed duplicate promotionCode key (was declared twice, second undefined overwrote first)
      promotionCode: appliedPromo ? appliedPromo.code : null,
      guestDetails: {
        name: guestDetails.name || '',
        email: guestDetails.email || '',
        phone: guestDetails.phone || '',
        requests: guestDetails.requests || '',
      },
      paymentMethod: method,
      paymentStatus: status,
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
    <Layout navbarProps={{ brandName: hotelDetails?.name || hotelName, logo: hotelDetails?.logoUrl, facebookUrl: hotelDetails?.facebookUrl || bookingData?.facebookUrl, instagramUrl: hotelDetails?.instagramUrl || bookingData?.instagramUrl, twitterUrl: hotelDetails?.twitterUrl || bookingData?.twitterUrl, footerDescription: hotelDetails?.footerDescription || bookingData?.footerDescription }}>
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
                    className={`flex-1 py-4 font-bold text-sm flex flex-col md:flex-row items-center justify-center gap-2 transition-all ${paymentMethod === 'credit_card' ? 'bg-white text-primary-600 border-t-2 border-primary-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] scale-100' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700 border-t-2 border-transparent hover:border-slate-200'}`}
                  >
                    <CreditCard size={18} className={paymentMethod === 'credit_card' ? 'text-primary-500' : 'text-slate-400'} /> <span className="hidden sm:inline">{t('payment.stripe')}</span><span className="sm:hidden">Stripe</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('omise')}
                    className={`flex-1 py-4 font-bold text-sm flex flex-col md:flex-row items-center justify-center gap-2 transition-all ${paymentMethod === 'omise' ? 'bg-white text-primary-600 border-t-2 border-primary-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] scale-100' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700 border-t-2 border-transparent hover:border-slate-200'}`}
                  >
                    <Globe size={18} className={paymentMethod === 'omise' ? 'text-primary-500' : 'text-slate-400'} /> <span className="hidden sm:inline">{t('payment.omise')}</span><span className="sm:hidden">Omise</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`flex-1 py-4 font-bold text-sm flex flex-col md:flex-row items-center justify-center gap-2 transition-all ${paymentMethod === 'promptpay' ? 'bg-white text-primary-600 border-t-2 border-primary-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] scale-100' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700 border-t-2 border-transparent hover:border-slate-200'}`}
                  >
                    <QrCode size={18} className={paymentMethod === 'promptpay' ? 'text-primary-500' : 'text-slate-400'} /> <span className="hidden sm:inline">{t('payment.promptPay')}</span><span className="sm:hidden">QR</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex-1 py-4 font-bold text-sm flex flex-col md:flex-row items-center justify-center gap-2 transition-all ${paymentMethod === 'bank_transfer' ? 'bg-white text-primary-600 border-t-2 border-primary-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] scale-100' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700 border-t-2 border-transparent hover:border-slate-200'}`}
                  >
                    <Building size={18} className={paymentMethod === 'bank_transfer' ? 'text-primary-500' : 'text-slate-400'} /> <span className="hidden sm:inline">{t('payment.transfer')}</span><span className="sm:hidden">Transfer</span>
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
                          <Loader2 className="animate-spin mr-2" size={20} /> {msg || 'Loading Secure Gateway...'}
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
                          <Loader2 className="animate-spin mr-2" size={20} /> Loading Omise...
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
              <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-28 group">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h3 className="font-display font-bold text-2xl text-slate-900 mb-6 relative z-10">{t('payment.bookingSummary')}</h3>

                {/* Hotel Info */}
                <div className="flex gap-5 mb-8 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                    <img src={hotelImage || '/images/hero-bg.png'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-bold text-slate-900 leading-tight text-lg line-clamp-2">{hotelName}</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">{hotelCity}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm font-bold relative z-10">
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500">{t('search.checkIn')}</span>
                    <span className="text-slate-900">{new Date(checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500">{t('search.checkOut')}</span>
                    <span className="text-slate-900">{new Date(checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500">{t('payment.guest')}</span>
                    <span className="text-slate-900 truncate max-w-[120px]">{guest?.name}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-primary-50/50 rounded-xl border border-primary-100 text-primary-800">
                    <span className="flex items-center gap-2"><Info size={16} className="text-primary-500" /> {t('checkout.duration')}</span>
                    <span className="font-black text-primary-900">{nights} {t('search.nights')}</span>
                  </div>
                </div>

                <hr className="border-slate-100 my-6 relative z-10" />

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 mb-6 relative z-10 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200" />
                  <p className="font-bold text-slate-900 ml-2">{roomTypeName}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 ml-2">
                    <CheckCircle size={14} className="text-primary-500" /> {ratePlanName}
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="mb-6 relative z-10">
                  <p className="text-sm font-bold text-slate-700 mb-2">{t('payment.promoCode')}</p>
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm font-medium placeholder:text-slate-400"
                        placeholder={t('payment.enterCode')}
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode}
                        className="px-5 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-800/20 hover:bg-slate-900 disabled:opacity-50 transition-colors active:scale-95"
                      >
                        {promoLoading ? '...' : t('payment.apply')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Tag size={16} />
                        {appliedPromo.code}
                      </div>
                      <button onClick={handleRemovePromo} className="text-green-700 hover:text-green-900 hover:scale-110 transition-transform"><X size={18} /></button>
                    </div>
                  )}
                  {promoError && <p className="text-xs text-red-500 mt-2 font-medium">{promoError}</p>}
                </div>

                <div className="space-y-3 font-medium relative z-10">
                  <div className="flex justify-between text-sm px-2">
                    <span className="text-slate-500">{t('payment.subtotal')}</span>
                    <span className="font-bold text-slate-900">฿{bookingData?.totalPrice?.toLocaleString()}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-green-600 px-2 animate-in slide-in-from-right-2 fade-in">
                      <span>{t('payment.discount')} ({appliedPromo.code})</span>
                      <span className="font-bold">- ฿{appliedPromo.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end bg-gradient-to-br from-primary-50 to-emerald-50 p-5 rounded-2xl border border-primary-100/50 shadow-inner mt-6 relative z-10">
                  <span className="text-primary-800 font-bold uppercase tracking-wider text-sm">{t('checkout.totalPrice')}</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-600 font-display">฿{finalPrice?.toLocaleString()}</span>
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