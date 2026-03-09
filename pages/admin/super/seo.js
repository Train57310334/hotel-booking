import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Search, Save, Globe, BarChart2, Shield, ExternalLink, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { InfoTooltip } from '@/components/Tooltip';

export default function SuperAdminSEO() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        seoGoogleVerification: '',
        seoBingVerification: '',
        seoPlatformGaId: '',
        seoPlatformGtmId: '',
        seoPlatformFbPixel: '',
        seoPlatformGadsId: '',
        seoDefaultOgImage: '',
        seoDefaultDescription: '',
        seoRobotsCustom: ''
    });

    useEffect(() => {
        if (user === undefined) return;
        if (user === null) { router.push('/auth/login'); return; }
        if (!user?.roles?.includes('platform_admin')) { router.push('/admin'); return; }
        fetchSettings();
    }, [user]);

    const fetchSettings = async () => {
        try {
            const data = await apiFetch('/settings');
            if (data) {
                setSettings(prev => ({
                    ...prev,
                    seoGoogleVerification: data.seoGoogleVerification || '',
                    seoBingVerification: data.seoBingVerification || '',
                    seoPlatformGaId: data.seoPlatformGaId || '',
                    seoPlatformGtmId: data.seoPlatformGtmId || '',
                    seoPlatformFbPixel: data.seoPlatformFbPixel || '',
                    seoPlatformGadsId: data.seoPlatformGadsId || '',
                    seoDefaultOgImage: data.seoDefaultOgImage || '',
                    seoDefaultDescription: data.seoDefaultDescription || '',
                    seoRobotsCustom: data.seoRobotsCustom || ''
                }));
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load SEO settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleOgImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }

        const toastId = toast.loading('Uploading...');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await apiFetch('/upload', { method: 'POST', body: formData });
            if (response?.url) {
                handleChange('seoDefaultOgImage', response.url);
                toast.success('Image uploaded', { id: toastId });
            }
        } catch (err) {
            toast.error('Upload failed', { id: toastId });
        } finally {
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiFetch('/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });
            toast.success('SEO settings saved successfully!');
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
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            <Search className="text-indigo-500" size={28} />
                            Platform SEO & Marketing
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage platform-wide SEO settings and tracking. These act as fallbacks for all hotels.</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Site Verification */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                            <Shield size={18} className="text-green-500" /> Search Engine Site Verification
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Verify your platform domain with search engines to access Search Console and Webmaster Tools.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Google Search Console Code
                                    <InfoTooltip content="HTML meta tag verification code from Google Search Console. Go to Search Console → Add Property → HTML Tag method → Copy only the content= value. e.g. 'abcdef123456'" />
                                </label>
                                <input
                                    value={settings.seoGoogleVerification}
                                    onChange={e => handleChange('seoGoogleVerification', e.target.value)}
                                    placeholder="google-site-verification content value"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                />
                                <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                    <ExternalLink size={11} /> Open Google Search Console
                                </a>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Bing Webmaster Tools Code
                                    <InfoTooltip content="Verification meta tag from Bing Webmaster Tools. Go to Bing Webmaster → Add Site → Meta Tag method → Copy the content= value." />
                                </label>
                                <input
                                    value={settings.seoBingVerification}
                                    onChange={e => handleChange('seoBingVerification', e.target.value)}
                                    placeholder="Bing verification content value"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                />
                                <a href="https://www.bing.com/webmasters" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                    <ExternalLink size={11} /> Open Bing Webmaster Tools
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Platform-wide Tracking */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                            <BarChart2 size={18} className="text-purple-500" /> Platform-wide Analytics & Advertising
                        </h3>
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl">
                            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                ⚠️ These IDs fire on <strong>all pages</strong> of the platform and every hotel page. Use these for platform-level reporting only.
                                Hotels can add their own separate IDs in their Hotel Settings.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Platform Google Analytics 4 ID
                                    <InfoTooltip content="Platform-level GA4 Measurement ID that tracks traffic across ALL hotel pages on this platform. Format: G-XXXXXXXXXX. Separate from individual hotel GA4 IDs." />
                                </label>
                                <input
                                    value={settings.seoPlatformGaId}
                                    onChange={e => handleChange('seoPlatformGaId', e.target.value)}
                                    placeholder="G-XXXXXXXXXX"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Platform Google Tag Manager ID
                                    <InfoTooltip content="Platform-level GTM container ID. If set, all tracking tags are managed from this GTM workspace. Format: GTM-XXXXXXX" />
                                </label>
                                <input
                                    value={settings.seoPlatformGtmId}
                                    onChange={e => handleChange('seoPlatformGtmId', e.target.value)}
                                    placeholder="GTM-XXXXXXX"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Platform Facebook Pixel ID
                                    <InfoTooltip content="Platform-level Facebook Pixel for tracking across all pages. Useful for retargeting all visitors of the platform. Hotels can add their own Pixel in Hotel Settings." />
                                </label>
                                <input
                                    value={settings.seoPlatformFbPixel}
                                    onChange={e => handleChange('seoPlatformFbPixel', e.target.value)}
                                    placeholder="1234567890123456"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Platform Google Ads ID
                                    <InfoTooltip content="Platform-level Google Ads Conversion ID. Used to track signups and bookings across the entire platform. Format: AW-XXXXXXXXX" />
                                </label>
                                <input
                                    value={settings.seoPlatformGadsId}
                                    onChange={e => handleChange('seoPlatformGadsId', e.target.value)}
                                    placeholder="AW-XXXXXXXXX"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-500">
                            <span className="font-bold text-slate-600 dark:text-slate-400">Quick links:</span>
                            <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><ExternalLink size={11} />GA4</a>
                            <a href="https://tagmanager.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><ExternalLink size={11} />GTM</a>
                            <a href="https://business.facebook.com/events_manager" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><ExternalLink size={11} />Meta Pixel</a>
                            <a href="https://ads.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><ExternalLink size={11} />Google Ads</a>
                        </div>
                    </div>

                    {/* Default SEO Fallbacks */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                            <Globe size={18} className="text-blue-500" /> Default SEO Fallbacks
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">These are used when a hotel has not set their own SEO values.</p>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Default Platform Description
                                <InfoTooltip content="Used as the meta description for pages that don't have a hotel-specific description set. Keep under 160 characters." />
                            </label>
                            <textarea
                                value={settings.seoDefaultDescription}
                                onChange={e => handleChange('seoDefaultDescription', e.target.value)}
                                rows={3}
                                placeholder="Book hotels directly and save. Flexible rates, instant confirmation, and 24/7 support."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Default Open Graph Image
                                <InfoTooltip content="The default social sharing image used when a hotel hasn't set its own OG image. Shown when pages are shared on Facebook, LINE, etc. Recommended: 1200×630px." />
                            </label>
                            <div className="flex gap-4 items-start">
                                {settings.seoDefaultOgImage && (
                                    <div className="w-40 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 shrink-0 relative group">
                                        <img src={settings.seoDefaultOgImage} alt="OG Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleChange('seoDefaultOgImage', '')}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <input
                                        value={settings.seoDefaultOgImage}
                                        onChange={e => handleChange('seoDefaultOgImage', e.target.value)}
                                        placeholder="https://your-cdn.com/default-og.jpg"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                                    />
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-bold cursor-pointer transition-colors">
                                        <Upload size={15} /> Upload Image
                                        <input type="file" className="hidden" accept="image/*" onChange={handleOgImageUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Robots.txt Custom Rules */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                            <Shield size={18} className="text-slate-500" /> Custom robots.txt Rules
                        </h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-mono whitespace-pre">
                                {`# Default rules (always included):
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Sitemap: [platform-url]/api/sitemap.xml`}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">Your custom rules below will be appended after these defaults.</p>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Additional robots.txt Rules
                                <InfoTooltip content="Custom rules appended to the end of robots.txt. Use standard robots.txt syntax. e.g. to block a specific bot: User-agent: BadBot\nDisallow: /" />
                            </label>
                            <textarea
                                value={settings.seoRobotsCustom}
                                onChange={e => handleChange('seoRobotsCustom', e.target.value)}
                                rows={6}
                                placeholder={`# Custom crawl rules\nUser-agent: AhrefsBot\nDisallow: /`}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm"
                            />
                        </div>
                        <a
                            href="/api/robots.txt"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:underline"
                        >
                            <ExternalLink size={14} /> Preview robots.txt
                        </a>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
