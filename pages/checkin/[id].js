import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { apiFetch } from '@/lib/api';
import { CheckCircle, ShieldCheck, Mail, Camera, Clock, KeySquare, Hotel, FileText, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

import SignaturePad from '@/components/SignaturePad';

export default function GuestWebCheckin() {
    const router = useRouter();
    const { id } = router.query;

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = Verify, 2 = Form, 3 = Success

    // Verification
    const [email, setEmail] = useState('');
    const [booking, setBooking] = useState(null);

    // Form Payload
    const [eta, setEta] = useState('');
    const [guests, setGuests] = useState([]);
    const [signature, setSignature] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Dynamic guest array initialization once booking is fetched
    useEffect(() => {
        if (booking && guests.length === 0) {
            // Initialize at least one guest (the lead)
            setGuests([
                { name: booking.leadName, idType: 'passport', documentBase64: null }
            ]);
        }
    }, [booking]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email address');
        setLoading(true);
        try {
            const data = await apiFetch(`/public/checkin/${id}/verify?email=${encodeURIComponent(email)}`);
            setBooking(data);
            setStep(2);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Invalid email or booking ID');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGuest = () => {
        setGuests([...guests, { name: '', idType: 'passport', documentBase64: null }]);
    };

    const handleRemoveGuest = (index) => {
        if (guests.length === 1) return;
        const newGuests = [...guests];
        newGuests.splice(index, 1);
        setGuests(newGuests);
    };

    const handleGuestChange = (index, field, value) => {
        const newGuests = [...guests];
        newGuests[index][field] = value;
        setGuests(newGuests);
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Maximum size is 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (upload) => {
            handleGuestChange(index, 'documentBase64', upload.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!signature) return toast.error('Please provide your signature');
        if (!termsAccepted) return toast.error('You must accept the terms and conditions');
        for (let i = 0; i < guests.length; i++) {
            if (!guests[i].name) return toast.error(`Please enter the name for Guest ${i + 1}`);
        }

        setLoading(true);
        const tid = toast.loading('Submitting registration card...');
        try {
            await apiFetch(`/public/checkin/${id}/submit`, {
                method: 'POST',
                body: JSON.stringify({
                    email, // from verification
                    eta,
                    signature,
                    guests
                })
            });
            toast.success('Check-in Complete!', { id: tid });
            setStep(3);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to submit web check-in', { id: tid });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    if (!id) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans selection:bg-blue-500/30">
            <Head>
                <title>Guest Web Check-in</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            <main className="max-w-2xl mx-auto px-4 py-8 md:py-16">
                
                {/* Header Context */}
                {booking && step > 1 && (
                    <div className="flex flex-col items-center justify-center mb-8 animate-in fade-in slide-in-from-top-4">
                        {booking.hotel?.logoUrl ? (
                            <img src={booking.hotel.logoUrl} alt={booking.hotel.name} className="h-16 w-auto object-contain mb-4 rounded-xl" />
                        ) : (
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                                <Hotel size={32} />
                            </div>
                        )}
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center">
                            Welcome to {booking.hotel?.name || 'Our Hotel'}
                        </h1>
                        <p className="text-slate-500 mt-2 text-center text-sm max-w-md">
                            Complete your digital registration card to speed up your arrival and get your keys faster.
                        </p>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                    
                    {/* Top Progress Bar */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 flex">
                        <div className={`h-full bg-blue-500 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* STEP 1: VERIFICATION */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner mx-auto">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">Verify Your Booking</h2>
                                <p className="text-slate-500 text-center text-sm mb-8">For security reasons, please enter the email address used to make the reservation.</p>
                                
                                <form onSubmit={handleVerify} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input 
                                                type="email" 
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                                placeholder="e.g., john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-blue-500/30"
                                    >
                                        {loading ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> : 'Find My Booking'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* STEP 2: REGISTRATION FORM */}
                        {step === 2 && booking && (
                            <div className="animate-in fade-in slide-in-from-right-4">
                                
                                {/* Booking Summary Box */}
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <FileText size={16} /> Booking Summary
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500 block mb-1">Check In</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-lg">{formatDate(booking.checkIn)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block mb-1">Check Out</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-lg">{formatDate(booking.checkOut)}</span>
                                        </div>
                                        <div className="col-span-2 mt-2">
                                            <span className="text-slate-500 block mb-1">Room</span>
                                            <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 inline-block shadow-sm">
                                                {booking.roomType?.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    
                                    {/* Arrival Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Clock className="text-blue-500" size={20} /> Arrival Information
                                        </h3>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Estimated Time of Arrival (Optional)</label>
                                            <input 
                                                type="time" 
                                                value={eta}
                                                onChange={(e) => setEta(e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white font-mono"
                                            />
                                            <p className="text-xs text-slate-500 mt-2">Standard check-in time is usually after 14:00.</p>
                                        </div>
                                    </div>

                                    {/* Guest Documents */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-700 pb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Camera className="text-blue-500" size={20} /> Guest Identification
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            {guests.map((guest, idx) => (
                                                <div key={idx} className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700 relative">
                                                    {idx > 0 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveGuest(idx)}
                                                            className="absolute top-4 right-4 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded"
                                                        >Remove</button>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <h4 className="font-bold text-slate-700 dark:text-slate-200">Guest Details</h4>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 mb-1">Full Legal Name</label>
                                                            <input 
                                                                type="text" 
                                                                required
                                                                value={guest.name}
                                                                onChange={(e) => handleGuestChange(idx, 'name', e.target.value)}
                                                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                                                                placeholder="e.g., John Doe"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-500 mb-1">ID Type</label>
                                                                <select 
                                                                    value={guest.idType}
                                                                    onChange={(e) => handleGuestChange(idx, 'idType', e.target.value)}
                                                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                                                                >
                                                                    <option value="passport">Passport</option>
                                                                    <option value="national_id">National ID</option>
                                                                    <option value="driving_license">Driving License</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-500 mb-1">Document Number</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={guest.idNumber || ''}
                                                                    onChange={(e) => handleGuestChange(idx, 'idNumber', e.target.value)}
                                                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white uppercase"
                                                                    placeholder="Optional"
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Document Upload */}
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 mb-2">Upload ID Document Photo</label>
                                                            {guest.documentBase64 ? (
                                                                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 group h-32 md:h-48 bg-slate-900 flex items-center justify-center">
                                                                    <img src={guest.documentBase64} alt="ID Document" className="w-full h-full object-cover opacity-80" />
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => handleGuestChange(idx, 'documentBase64', null)}
                                                                        className="absolute inset-0 m-auto w-auto h-10 px-4 bg-black/60 text-white text-sm font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                                    >
                                                                        Change Photo
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <label className="w-full h-32 md:h-40 border-2 border-dashed border-blue-200 dark:border-blue-500/30 rounded-xl flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 cursor-pointer hover:bg-blue-100 transition-colors">
                                                                    <Camera size={28} className="mb-2" />
                                                                    <span className="text-sm font-bold">Tap to snap or upload</span>
                                                                    <span className="text-[10px] text-slate-400 mt-1">Accepts JPG, PNG (Max 5MB)</span>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        // capture="environment" // Only for forcing mobile camera
                                                                        className="hidden" 
                                                                        onChange={(e) => handleFileChange(e, idx)} 
                                                                    />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {guests.length < (booking.guestsAdult + booking.guestsChild) && (
                                                <button 
                                                    type="button" 
                                                    onClick={handleAddGuest}
                                                    className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    + Add Another Guest 
                                                    <span className="font-normal opacity-60">
                                                        ({guests.length} of {booking.guestsAdult + booking.guestsChild})
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Digital Signature */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <ShieldCheck className="text-blue-500" size={20} /> Registration Signature
                                        </h3>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-serif">
                                                I hereby confirm that I take full legal responsibility for the accommodation and agree to settle all accumulated charges prior to departure. I consent to the hotel processing my personal data according to local laws.
                                            </p>
                                            <SignaturePad onSign={(sig) => setSignature(sig)} />
                                        </div>
                                        
                                        <label className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30 rounded-xl cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={termsAccepted}
                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                I agree to the Hotel's standard Terms & Conditions and understand that failing to show up may incur penalty charges.
                                            </span>
                                        </label>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={loading || !termsAccepted}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/30 text-lg"
                                    >
                                        {loading ? <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full"></div> : 'Complete Registration'}
                                        {!loading && <ChevronRight size={20} />}
                                    </button>

                                </form>
                            </div>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {step === 3 && (
                            <div className="text-center py-8 animate-in zoom-in-95 fade-in duration-500">
                                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-iner border-4 border-white dark:border-slate-800 relative">
                                    <div className="absolute inset-0 rounded-full border border-blue-500 animate-ping opacity-20"></div>
                                    <CheckCircle size={48} />
                                </div>
                                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">You're All Set!</h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-sm mx-auto mb-8">
                                    Your digital registration is complete. Check-in at the hotel will now be fast and contactless.
                                </p>
                                
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl text-left border border-slate-100 dark:border-slate-700 max-w-sm mx-auto mb-8">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                                        <KeySquare size={18} className="text-blue-500" /> Next Steps
                                    </h4>
                                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 font-bold">1.</span>
                                            Proceed to the Fast-Track counter upon arrival.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 font-bold">2.</span>
                                            Show the receptionist a valid physical ID to pick up your key.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 font-bold">3.</span>
                                            Enjoy your seamless stay!
                                        </li>
                                    </ul>
                                </div>

                                <button onClick={() => window.location.href = '/'} className="font-bold text-blue-600 hover:text-blue-700 px-6 py-2">
                                    Return to Homepage
                                </button>
                            </div>
                        )}

                    </div>
                    
                    {step < 3 && (
                        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-100 dark:border-slate-700 flex justify-center items-center gap-2 text-xs text-slate-400">
                            <ShieldCheck size={14} /> Encrypted & Secure Transmission
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

