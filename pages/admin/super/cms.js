import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Globe, Save, Upload, X, Shield, ToggleLeft, ToggleRight, AlertTriangle, Database, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
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
    const [redisStatus, setRedisStatus] = useState(null); // null = loading
    const [redisChecking, setRedisChecking] = useState(false);

    useEffect(() => {
        if (user === undefined) return;
        if (user === null) { router.push('/auth/login'); return; }
        if (!user?.roles?.includes('platform_admin')) { router.push('/admin'); return; }
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchSettings = async () => {
        try {
            const data = await apiFetch('/settings');
            if (data) setSystemSettings(data);
            // Fetch Redis status alongside settings
            checkRedisStatus();
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const checkRedisStatus = async () => {
        setRedisChecking(true);
        try {
            const status = await apiFetch('/settings/redis-status');
            setRedisStatus(status);
        } catch {
            setRedisStatus({ connected: false, configuredUrl: '', note: 'Could not reach status endpoint.' });
        } finally {
            setRedisChecking(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await apiFetch('/upload', { method: 'POST', body: formData });
            if (response?.url) { handleSystemChange('logoUrl', response.url); toast.success('Logo uploaded successfully'); }
        } catch (error) { toast.error('Failed to upload logo'); }
        finally { setUploading(false); e.target.value = ''; }
    };

    const handleAuthBgUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('Image must be less than 10MB'); return; }
        setUploadingAuthBg(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await apiFetch('/upload', { method: 'POST', body: formData });
            if (response?.url) { handleSystemChange('authBgUrl', response.url); toast.success('Auth Background uploaded successfully'); }
        } catch (error) { toast.error('Failed to upload background'); }
        finally { setUploadingAuthBg(false); e.target.value = ''; }
    };

    const handleSystemChange = (key, value) => {
        setSystemSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiFetch('/settings', { method: 'PUT', body: JSON.stringify(systemSettings) });
            toast.success('Platform settings saved!');
            checkUser();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally { setSaving(false); }
    };

    if (isLoading) return <AdminLayout>Loading...</AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto pb-20 p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Landing CMS</h1>
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

                {/* ── Platform Main Settings ─────────────────────────────── */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">Platform Main Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo */}
                        <div className="space-y-4 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                Platform Logo <InfoTooltip content="The platform logo shown in the admin panel sidebar, all email headers, and the public landing page. Recommended: 200x200px PNG with transparent background. Max 5MB." />
                            </label>
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center relative overflow-hidden group shrink-0 shadow-sm">
                                    {systemSettings.logoUrl ? (
                                        <>
                                            <img src={systemSettings.logoUrl} alt="Platform Logo" className="w-full h-full object-contain p-2" />
                                            <button type="button" onClick={() => handleSystemChange('logoUrl', '')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X size={20} /></button>
                                        </>
                                    ) : <Globe className="text-slate-400" size={32} />}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="relative">
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" />
                                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {uploading ? <span>Uploading...</span> : <><Upload size={18} className="text-slate-400" /> Select New Logo</>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">Recommended size: 200x200px. Max size: 5MB. Supported formats: PNG, JPG, SVG.</p>
                                </div>
                            </div>
                        </div>

                        {/* Auth Background */}
                        <div className="space-y-4 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                Auth Background Image <InfoTooltip content="Shown as the full-height background image on the left panel of the Login and Register pages. Recommended: 1080x1920px portrait. Max 10MB." />
                            </label>
                            <div className="flex items-start gap-6">
                                <div className="w-48 h-32 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center relative overflow-hidden group shrink-0 shadow-sm">
                                    {systemSettings.authBgUrl ? (
                                        <>
                                            <img src={systemSettings.authBgUrl} alt="Auth Background" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => handleSystemChange('authBgUrl', '')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X size={20} /></button>
                                        </>
                                    ) : <div className="text-slate-400 text-sm">Default Image</div>}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="relative">
                                        <input type="file" accept="image/*" onChange={handleAuthBgUpload} disabled={uploadingAuthBg} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" />
                                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {uploadingAuthBg ? <span>Uploading...</span> : <><Upload size={18} className="text-slate-400" /> Select New Background</>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">Recommended size: 1080x1920 (Portrait). Max size: 10MB. Formats: JPG, PNG.</p>
                                </div>
                            </div>
                        </div>

                        {/* Site Name & Currency */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Site Name <InfoTooltip content="Appears in the browser tab title, search engine results (SEO), and email subject lines. e.g. 'BookingKub'. Keep under 60 characters." />
                                </label>
                                <input type="text" value={systemSettings.siteName || ''} onChange={e => handleSystemChange('siteName', e.target.value)} placeholder="BookingKub" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Currency <InfoTooltip content="Sets the default currency symbol displayed across the entire platform. Change with caution — existing pricing data will NOT be automatically converted." />
                                </label>
                                <select value={systemSettings.currency || 'THB'} onChange={e => handleSystemChange('currency', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                                    <option value="THB">THB (฿)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 my-6" />

                    {/* SaaS Landing Content */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">SaaS Landing Page Content</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">Hero Title <InfoTooltip content="The main headline on the landing page hero section. Keep under 80 characters." /></label>
                            <input type="text" value={systemSettings.landingHeroTitle || ''} onChange={e => handleSystemChange('landingHeroTitle', e.target.value)} placeholder="Everything You Need to Run Your Hotel." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">Hero Description <InfoTooltip content="A supporting subtitle below the hero title." /></label>
                            <textarea rows={3} value={systemSettings.landingHeroDescription || ''} onChange={e => handleSystemChange('landingHeroDescription', e.target.value)} placeholder="Manage bookings, guests, and payments in one place..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">CTA Button Text <InfoTooltip content="The label on the primary call-to-action button in the hero section." /></label>
                            <input type="text" value={systemSettings.landingCTA || ''} onChange={e => handleSystemChange('landingCTA', e.target.value)} placeholder="Start for Free" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Features Section Title</label>
                                <input type="text" value={systemSettings.landingFeaturesTitle || ''} onChange={e => handleSystemChange('landingFeaturesTitle', e.target.value)} placeholder="POWER FEATURES" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Features Section Subtitle</label>
                                <input type="text" value={systemSettings.landingFeaturesSubtitle || ''} onChange={e => handleSystemChange('landingFeaturesSubtitle', e.target.value)} placeholder="Everything you need to scale." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Pricing Section Title</label>
                                <input type="text" value={systemSettings.landingPricingTitle || ''} onChange={e => handleSystemChange('landingPricingTitle', e.target.value)} placeholder="SIMPLE PRICING" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Pricing Section Subtitle</label>
                                <input type="text" value={systemSettings.landingPricingSubtitle || ''} onChange={e => handleSystemChange('landingPricingSubtitle', e.target.value)} placeholder="Start free, upgrade as you grow." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Platform Security ──────────────────────────────────────── */}
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                        <Shield size={18} className="text-rose-500" />
                        Platform Security
                    </h3>

                    {/* CORS Allowed Origins */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Allowed CORS Origins
                            <InfoTooltip content="Comma-separated list of frontend URLs allowed to call the API. e.g. https://app.bookingkub.com,https://admin.bookingkub.com — Takes effect on next server restart." />
                        </label>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 font-medium">
                            ⚠️ Changes take effect on the <strong>next server restart</strong>.
                        </p>
                        <textarea
                            id="allowedOrigins"
                            rows={3}
                            value={systemSettings.allowedOrigins || ''}
                            onChange={e => handleSystemChange('allowedOrigins', e.target.value)}
                            placeholder="http://localhost:3000,https://app.bookingkub.com,https://yourdomain.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm resize-none focus:ring-2 focus:ring-rose-500/30 focus:outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">One or more origins separated by commas. Every origin must include the protocol (http:// or https://).</p>
                    </div>

                    {/* Mock Payment Toggle */}
                    <div className="flex items-start justify-between gap-6 p-5 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Enable Mock Payment Checkout</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
                                    Enables the built-in simulated payment endpoint for testing bookings without a real payment gateway.
                                    {' '}<strong className="text-rose-600 dark:text-rose-400">Do NOT enable in production</strong> — integrate Stripe, Omise, or 2c2p instead.
                                </p>
                            </div>
                        </div>
                        <button
                            id="mockPaymentToggle"
                            type="button"
                            onClick={() => handleSystemChange('mockPaymentEnabled', systemSettings.mockPaymentEnabled === 'true' ? 'false' : 'true')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shrink-0 transition-all ${
                                systemSettings.mockPaymentEnabled === 'true'
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            {systemSettings.mockPaymentEnabled === 'true'
                                ? <><ToggleRight size={20} /> Enabled</>
                                : <><ToggleLeft size={20} /> Disabled</>
                            }
                        </button>
                    </div>
                    {/* ── Infrastructure: Redis Cache ─────────────────────── */}
                    <div className="mt-6 space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-5">
                            <Database size={15} className="text-indigo-500" />
                            Redis Cache (Infrastructure)
                        </h4>

                        {/* Live Status Badge */}
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            {redisStatus === null || redisChecking ? (
                                <RefreshCcw size={16} className="animate-spin text-slate-400" />
                            ) : redisStatus.connected ? (
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            ) : (
                                <XCircle size={18} className="text-rose-500 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${
                                    redisStatus?.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                    {redisStatus === null ? 'Checking connection...' :
                                        redisStatus.connected ? 'Redis Connected' : 'Redis Disconnected (using in-memory fallback)'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                    {redisStatus?.note || ''}
                                    {redisStatus?.configuredUrl && (
                                        <span className="ml-2 font-mono opacity-60">{redisStatus.configuredUrl}</span>
                                    )}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={checkRedisStatus}
                                disabled={redisChecking}
                                className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                                title="Refresh status"
                            >
                                <RefreshCcw size={14} className={redisChecking ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        {/* Redis URL Input */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                Redis URL
                                <InfoTooltip content="Connection string for Redis. Format: redis://[:password@]host[:port][/db-number]. Takes effect on next server restart." />
                            </label>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                ⚠️ Takes effect on the <strong>next server restart</strong>.
                            </p>
                            <input
                                type="password"
                                id="redisUrl"
                                value={systemSettings.redisUrl || ''}
                                onChange={e => handleSystemChange('redisUrl', e.target.value)}
                                placeholder="redis://localhost:6379"
                                autoComplete="off"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                            />
                            <p className="text-xs text-slate-400">Leave blank to disable Redis and use in-memory cache (not recommended for production with multiple instances).</p>
                        </div>

                        {/* Cache TTL */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                JWT Cache TTL
                                <InfoTooltip content="How long (in seconds) to cache JWT user profiles in Redis. Shorter = more DB queries but faster role propagation. Default: 300s (5 min)." />
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="30" max="1800" step="30"
                                    value={Number(systemSettings.redisCacheTtl) || 300}
                                    onChange={e => handleSystemChange('redisCacheTtl', e.target.value)}
                                    className="flex-1 accent-indigo-500"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-20 text-right">
                                    {Number(systemSettings.redisCacheTtl) || 300}s
                                    <span className="block text-xs font-normal text-slate-400">
                                        ({Math.round((Number(systemSettings.redisCacheTtl) || 300) / 60)} min)
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
