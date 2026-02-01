import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Building2, MapPin, CheckCircle } from 'lucide-react';
import { InfoTooltip } from '@/components/Tooltip';

export default function SetupHotel() {
    const { user, checkUser } = useAuth();
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        country: 'Thailand',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiFetch('/hotels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Refresh User Profile to get the new Hotel Role
            await checkUser();

            success('Hotel created successfully! Welcome aboard.');

            // Redirect to Admin Dashboard
            router.push('/admin/dashboard');

        } catch (err) {
            console.error('Setup failed:', err);
            if (err.message.includes('Unauthorized') || err.message.includes('401')) {
                toastError('Session expired. Please login again.');
                localStorage.removeItem('token');
                setTimeout(() => window.location.href = '/auth/login', 1500);
                return;
            }
            toastError(`Failed to create hotel: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-emerald-600 p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                        <Building2 className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Setup Your Property</h1>
                    <p className="text-emerald-100 text-sm">Welcome to BookingKub! Let's get your hotel started.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            Property Name
                            <InfoTooltip content="The official name of your hotel as it will appear to guests." />
                        </label>
                        <input
                            name="name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            placeholder="e.g. Seaside Resort"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                City
                                <InfoTooltip content="The city where your property is located." />
                            </label>
                            <input
                                name="city"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                placeholder="Bangkok"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                Country
                                <InfoTooltip content="The country where your property is located." />
                            </label>
                            <input
                                name="country"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                value={formData.country}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                            Full Address
                            <InfoTooltip content="Detailed address including street, zip code for Google Maps." />
                        </label>
                        <textarea
                            name="address"
                            required
                            rows="3"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-slate-900 placeholder:text-slate-400"
                            placeholder="123 Sukhumvit Road..."
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating...' : (
                            <>
                                <span>Launch My Hotel</span>
                                <CheckCircle size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
