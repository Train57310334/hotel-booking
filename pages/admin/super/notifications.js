import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import {
    Mail, Server, Save, Send, Eye, EyeOff,
    CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { InfoTooltip } from '@/components/Tooltip';

export default function SuperAdminNotifications() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [settings, setSettings] = useState({
        smtpHost: '',
        smtpPort: '',
        smtpUser: '',
        smtpPass: '',
        smtpFromName: '',
        smtpFromEmail: '',
    });

    useEffect(() => {
        if (user === undefined) return;
        if (user === null) { router.push('/auth/login'); return; }
        if (!user?.roles?.includes('platform_admin')) { router.push('/admin'); return; }
        fetchSettings();
        setTestEmail(user.email || '');
    }, [user]);

    const fetchSettings = async () => {
        try {
            const data = await apiFetch('/settings');
            if (data) {
                setSettings(prev => ({
                    ...prev,
                    smtpHost: data.smtpHost || '',
                    smtpPort: data.smtpPort || '',
                    smtpUser: data.smtpUser || '',
                    smtpPass: data.smtpPass || '',
                    smtpFromName: data.smtpFromName || '',
                    smtpFromEmail: data.smtpFromEmail || '',
                }));
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load email settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiFetch('/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });
            toast.success('Email settings saved successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) { toast.error('Enter a recipient email to test'); return; }
        setTesting(true);
        const toastId = toast.loading(`Sending test email to ${testEmail}...`);
        try {
            const res = await apiFetch('/settings/test-email', {
                method: 'POST',
                body: JSON.stringify({ to: testEmail })
            });
            if (res?.success) {
                toast.success(`Test email sent! Check ${testEmail}`, { id: toastId, duration: 5000 });
            } else {
                toast.error('Test email failed. Check SMTP settings.', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.message || 'Test email failed. Check SMTP settings.', { id: toastId });
        } finally {
            setTesting(false);
        }
    };

    const isConfigured = settings.smtpHost && settings.smtpUser && settings.smtpPass;

    if (isLoading) return <AdminLayout><div className="p-8 text-slate-500">Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-3xl mx-auto pb-20 p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            <Mail className="text-indigo-500" size={28} />
                            Platform Email Settings
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Configure the platform-wide SMTP server used to send all system emails
                            (booking confirmations, password resets, etc.).
                        </p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="shrink-0 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>

                {/* Status Banner */}
                <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 border ${isConfigured
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}>
                    {isConfigured
                        ? <CheckCircle2 size={18} className="shrink-0" />
                        : <AlertCircle size={18} className="shrink-0" />
                    }
                    <p className="text-sm font-medium">
                        {isConfigured
                            ? 'SMTP is configured. System emails are active.'
                            : 'SMTP is not configured. System emails will NOT be sent until this is set up.'
                        }
                    </p>
                </div>

                <div className="space-y-6">
                    {/* SMTP Server */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                            <Server size={18} className="text-indigo-500" />
                            SMTP Server
                        </h3>

                        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl flex gap-3">
                            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                This SMTP config is shared across the entire platform. All hotels' system emails
                                use this server. You can use Gmail, SendGrid, Mailgun, Amazon SES, or any SMTP provider.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    SMTP Host
                                    <InfoTooltip content="Your SMTP server hostname. Example: smtp.gmail.com, smtp.sendgrid.net, email-smtp.us-east-1.amazonaws.com" />
                                </label>
                                <input
                                    value={settings.smtpHost}
                                    onChange={e => handleChange('smtpHost', e.target.value)}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    SMTP Port
                                    <InfoTooltip content="Common ports: 587 (STARTTLS, recommended), 465 (SSL/TLS), 25 (plain, usually blocked)" />
                                </label>
                                <input
                                    value={settings.smtpPort}
                                    onChange={e => handleChange('smtpPort', e.target.value)}
                                    placeholder="587"
                                    type="number"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    SMTP Username
                                    <InfoTooltip content="Your SMTP account username or email address. For Gmail: your full Gmail address. For API providers: usually 'apikey' or 'AKIAIOSFODNN7EXAMPLE'" />
                                </label>
                                <input
                                    value={settings.smtpUser}
                                    onChange={e => handleChange('smtpUser', e.target.value)}
                                    placeholder="noreply@yourdomain.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    SMTP Password / API Key
                                    <InfoTooltip content="Your SMTP password or API key. For Gmail: use an App Password (not your regular password). For SendGrid: use your API key." />
                                </label>
                                <div className="relative">
                                    <input
                                        value={settings.smtpPass}
                                        onChange={e => handleChange('smtpPass', e.target.value)}
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="••••••••••••••••"
                                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sender Identity */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                            <Mail size={18} className="text-emerald-500" />
                            Sender Identity
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            How emails appear to recipients. If left blank, these fall back to the platform name and SMTP username.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    From Name
                                    <InfoTooltip content='The name shown as the email sender. Example: "BookingKub Support" or your platform name. Shown as: BookingKub Support <noreply@yourdomain.com>' />
                                </label>
                                <input
                                    value={settings.smtpFromName}
                                    onChange={e => handleChange('smtpFromName', e.target.value)}
                                    placeholder="BookingKub"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    From Email Address
                                    <InfoTooltip content='The sender "From" email address. Must be verified/allowed by your SMTP provider. If blank, falls back to SMTP Username.' />
                                </label>
                                <input
                                    value={settings.smtpFromEmail}
                                    onChange={e => handleChange('smtpFromEmail', e.target.value)}
                                    placeholder="noreply@yourdomain.com"
                                    type="email"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Preview</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                                From: <span className="text-indigo-500">
                                    {settings.smtpFromName || 'BookingKub'} &lt;{settings.smtpFromEmail || settings.smtpUser || 'noreply@yourdomain.com'}&gt;
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Test Email */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                            <Send size={18} className="text-blue-500" />
                            Test Email
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Send a test email to verify your SMTP configuration is working correctly.
                            <strong className="text-slate-700 dark:text-slate-300"> Save your settings first</strong> before testing.
                        </p>
                        <div className="flex gap-3">
                            <input
                                value={testEmail}
                                onChange={e => setTestEmail(e.target.value)}
                                placeholder="test@example.com"
                                type="email"
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                            <button
                                onClick={handleTestEmail}
                                disabled={testing || !isConfigured}
                                title={!isConfigured ? 'Configure and save SMTP settings first' : ''}
                                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                <Send size={16} />
                                {testing ? 'Sending...' : 'Send Test'}
                            </button>
                        </div>
                        {!isConfigured && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                Configure and save SMTP Host, Username, and Password before testing.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
