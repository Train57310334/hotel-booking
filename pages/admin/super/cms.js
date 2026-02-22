import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { InfoTooltip } from '@/components/Tooltip';

export default function PlatformCMS() {
    const { user, checkUser } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [systemSettings, setSystemSettings] = useState({});

    useEffect(() => {
        // Wait until user is fully loaded or confirmed null
        if (user === undefined) return;

        if (user === null) {
            router.push('/auth/login');
            return;
        }

        if (!user?.roles?.includes('platform_admin')) {
            router.push('/admin');
            return;
        }

        fetchSettings();
    }, [user]);

    const fetchSettings = async () => {
        try {
            const data = await apiFetch('/settings');
            if (data) setSystemSettings(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSystemChange = (key, value) => {
        setSystemSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await apiFetch('/settings', {
                method: 'PUT',
                body: JSON.stringify(systemSettings)
            });

            toast.success('Landing CMS saved successfully!');
            checkUser();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return <AdminLayout>Loading...</AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto pb-20 p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Landing CMS</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage the public SaaS platform pages</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">Platform Main Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                Site Name
                                <InfoTooltip content="The name of your website as it appears in the browser tab and search engines." />
                            </label>
                            <input
                                type="text"
                                value={systemSettings.siteName || ''}
                                onChange={e => handleSystemChange('siteName', e.target.value)}
                                placeholder="BookingKub"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                Currency
                                <InfoTooltip content="The currency used across the platform (e.g. THB, USD)." />
                            </label>
                            <select
                                value={systemSettings.currency || 'THB'}
                                onChange={e => handleSystemChange('currency', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                            >
                                <option value="THB">THB (฿)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 my-6" />

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">SaaS Landing Page Content</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Hero Title</label>
                            <input
                                type="text"
                                value={systemSettings.landingHeroTitle || ''}
                                onChange={e => handleSystemChange('landingHeroTitle', e.target.value)}
                                placeholder="Everything You Need to Run Your Hotel."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Hero Description</label>
                            <textarea
                                rows={3}
                                value={systemSettings.landingHeroDescription || ''}
                                onChange={e => handleSystemChange('landingHeroDescription', e.target.value)}
                                placeholder="Manage bookings, guests, and payments in one place..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">CTA Button Text</label>
                            <input
                                type="text"
                                value={systemSettings.landingCTA || ''}
                                onChange={e => handleSystemChange('landingCTA', e.target.value)}
                                placeholder="Start for Free"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
