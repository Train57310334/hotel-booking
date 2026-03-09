import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Globe, Save, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { InfoTooltip } from '@/components/Tooltip';

export default function PlatformCMS() {
    const { user, checkUser } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingAuthBg, setUploadingAuthBg] = useState(false);
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

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiFetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response?.url) {
                handleSystemChange('logoUrl', response.url);
                toast.success('Logo uploaded successfully');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload logo');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleAuthBgUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }

        setUploadingAuthBg(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiFetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response?.url) {
                handleSystemChange('authBgUrl', response.url);
                toast.success('Auth Background uploaded successfully');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload background');
        } finally {
            setUploadingAuthBg(false);
            e.target.value = '';
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
                        <div className="space-y-4 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                Platform Logo
                                <InfoTooltip content="The platform logo shown in the admin panel sidebar, all email headers, and the public landing page. Recommended: 200×200px PNG with transparent background. Max 5MB." />
                            </label>

                            <div className="flex items-start gap-6">
                                {/* Logo Preview */}
                                <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center relative overflow-hidden group shrink-0 shadow-sm">
                                    {systemSettings.logoUrl ? (
                                        <>
                                            <img
                                                src={systemSettings.logoUrl}
                                                alt="Platform Logo"
                                                className="w-full h-full object-contain p-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleSystemChange('logoUrl', '')}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                            >
                                                <X size={20} />
                                            </button>
                                        </>
                                    ) : (
                                        <Globe className="text-slate-400" size={32} />
                                    )}
                                </div>

                                {/* Upload Action */}
                                <div className="flex-1 space-y-2">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={uploading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                        />
                                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {uploading ? (
                                                <span className="flex items-center gap-2">Uploading...</span>
                                            ) : (
                                                <>
                                                    <Upload size={18} className="text-slate-400" />
                                                    Select New Logo
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Recommended size: 200x200px. Max size: 5MB. Supported formats: PNG, JPG, SVG.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                Auth Background Image
                                <InfoTooltip content="Shown as the full-height background image on the left panel of the Login and Register pages. Use a professional hotel/hospitality photo. Recommended: 1080×1920px portrait. Max 10MB." />
                            </label>

                            <div className="flex items-start gap-6">
                                {/* Auth Background Preview */}
                                <div className="w-48 h-32 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center relative overflow-hidden group shrink-0 shadow-sm">
                                    {systemSettings.authBgUrl ? (
                                        <>
                                            <img
                                                src={systemSettings.authBgUrl}
                                                alt="Auth Background"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleSystemChange('authBgUrl', '')}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                            >
                                                <X size={20} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-slate-400 text-sm">Default Image</div>
                                    )}
                                </div>

                                {/* Upload Action */}
                                <div className="flex-1 space-y-2">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAuthBgUpload}
                                            disabled={uploadingAuthBg}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                        />
                                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {uploadingAuthBg ? (
                                                <span className="flex items-center gap-2">Uploading...</span>
                                            ) : (
                                                <>
                                                    <Upload size={18} className="text-slate-400" />
                                                    Select New Background
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Recommended size: 1080x1920 (Portrait). Max size: 10MB. Formats: JPG, PNG.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Site Name
                                    <InfoTooltip content="Appears in the browser tab title, search engine results (SEO), and email subject lines. e.g. 'BookingKub – Hotel Management Platform'. Keep under 60 characters for best SEO results." />
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
                                    <InfoTooltip content="Sets the default currency symbol displayed across the entire platform (e.g. all room prices, reports, and invoices). Hotel owners will see prices in this currency. Change with caution — existing pricing data will NOT be automatically converted." />
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
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">Hero Title <InfoTooltip content="The main headline on the landing page hero section. Should clearly communicate the key value proposition. e.g. 'Everything You Need to Run Your Hotel, In One Place.' Keep under 80 characters." /></label>
                                <input
                                    type="text"
                                    value={systemSettings.landingHeroTitle || ''}
                                    onChange={e => handleSystemChange('landingHeroTitle', e.target.value)}
                                    placeholder="Everything You Need to Run Your Hotel."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">Hero Description <InfoTooltip content="A supporting subtitle below the hero title. Should summarize what the platform does in 1-2 sentences. e.g. 'Manage bookings, guests, and payments — all in one powerful dashboard.'" /></label>
                                <textarea
                                    rows={3}
                                    value={systemSettings.landingHeroDescription || ''}
                                    onChange={e => handleSystemChange('landingHeroDescription', e.target.value)}
                                    placeholder="Manage bookings, guests, and payments in one place..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">CTA Button Text <InfoTooltip content="The label on the primary call-to-action button in the hero section. Keep it short and action-oriented. e.g. 'Start Free Trial', 'Get Started', 'Sign Up Free'." /></label>
                                <input
                                    type="text"
                                    value={systemSettings.landingCTA || ''}
                                    onChange={e => handleSystemChange('landingCTA', e.target.value)}
                                    placeholder="Start for Free"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Features Section Title</label>
                                <input
                                    type="text"
                                    value={systemSettings.landingFeaturesTitle || ''}
                                    onChange={e => handleSystemChange('landingFeaturesTitle', e.target.value)}
                                    placeholder="POWER FEATURES"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Features Section Subtitle</label>
                                <input
                                    type="text"
                                    value={systemSettings.landingFeaturesSubtitle || ''}
                                    onChange={e => handleSystemChange('landingFeaturesSubtitle', e.target.value)}
                                    placeholder="Everything you need to scale."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Pricing Section Title</label>
                                <input
                                    type="text"
                                    value={systemSettings.landingPricingTitle || ''}
                                    onChange={e => handleSystemChange('landingPricingTitle', e.target.value)}
                                    placeholder="SIMPLE PRICING"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Pricing Section Subtitle</label>
                                <input
                                    type="text"
                                    value={systemSettings.landingPricingSubtitle || ''}
                                    onChange={e => handleSystemChange('landingPricingSubtitle', e.target.value)}
                                    placeholder="Start free, upgrade as you grow."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
