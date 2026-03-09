import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { BarChart2, ExternalLink, Settings, CheckCircle, Circle, ArrowRight } from 'lucide-react';

export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const { currentHotel } = useAdmin() || {};
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentHotel) return;
        fetchHotel(currentHotel.id);
    }, [currentHotel]);

    const fetchHotel = async (id) => {
        try {
            const data = await apiFetch(`/hotels/${id}`);
            setHotel(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const hasGaId = !!hotel?.googleAnalyticsId;
    const hasEmbedUrl = !!hotel?.analyticsEmbedUrl;

    const setupSteps = [
        {
            done: hasGaId,
            label: 'Set up Google Analytics 4',
            desc: 'Enter your GA4 Measurement ID (G-XXXXXXX) in Hotel Settings → SEO & Marketing.',
            action: { label: 'Go to SEO Settings', href: '/admin/settings?tab=seo' }
        },
        {
            done: false,
            label: 'Connect GA4 to Looker Studio',
            desc: 'Create a free Looker Studio report at lookerstudio.google.com and add your GA4 as a data source.',
            action: { label: 'Open Looker Studio', href: 'https://lookerstudio.google.com', external: true }
        },
        {
            done: false,
            label: 'Get the Embed URL',
            desc: 'In Looker Studio: Share → Embed Report → Copy the URL from the src="..." attribute of the embed code.',
            action: null
        },
        {
            done: hasEmbedUrl,
            label: 'Paste Embed URL in Settings',
            desc: 'Enter the Looker Studio embed URL in Hotel Settings → SEO & Marketing → Analytics Dashboard.',
            action: { label: 'Go to SEO Settings', href: '/admin/settings?tab=seo' }
        }
    ];

    if (loading) return <AdminLayout><div className="p-8 text-slate-500">Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto pb-20 p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <BarChart2 className="text-emerald-500" size={28} />
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        View your hotel&apos;s traffic and conversion data powered by Google Analytics.
                    </p>
                </div>

                {/* Status Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${hasGaId ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        {hasGaId ? <CheckCircle size={20} className="text-emerald-500 shrink-0" /> : <Circle size={20} className="text-slate-400 shrink-0" />}
                        <div>
                            <p className={`text-sm font-bold ${hasGaId ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>GA4 Tracking</p>
                            <p className="text-xs text-slate-500">{hasGaId ? hotel.googleAnalyticsId : 'Not configured'}</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${hotel?.googleTagManagerId ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        {hotel?.googleTagManagerId ? <CheckCircle size={20} className="text-emerald-500 shrink-0" /> : <Circle size={20} className="text-slate-400 shrink-0" />}
                        <div>
                            <p className={`text-sm font-bold ${hotel?.googleTagManagerId ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>GTM</p>
                            <p className="text-xs text-slate-500">{hotel?.googleTagManagerId || 'Not configured'}</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${hotel?.facebookPixelId ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        {hotel?.facebookPixelId ? <CheckCircle size={20} className="text-emerald-500 shrink-0" /> : <Circle size={20} className="text-slate-400 shrink-0" />}
                        <div>
                            <p className={`text-sm font-bold ${hotel?.facebookPixelId ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>Facebook Pixel</p>
                            <p className="text-xs text-slate-500">{hotel?.facebookPixelId || 'Not configured'}</p>
                        </div>
                    </div>
                </div>

                {hasEmbedUrl ? (
                    /* Dashboard Embed */
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white">Looker Studio Report</h3>
                            <a
                                href={hotel.analyticsEmbedUrl.replace('/embed/', '/')}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-sm text-blue-500 hover:underline"
                            >
                                <ExternalLink size={14} /> Open Full Report
                            </a>
                        </div>
                        <iframe
                            src={hotel.analyticsEmbedUrl}
                            title="Analytics Dashboard"
                            className="w-full"
                            style={{ height: '75vh', minHeight: '600px', border: 'none' }}
                            allowFullScreen
                        />
                    </div>
                ) : (
                    /* Setup Guide */
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Set Up Your Analytics Dashboard</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">Follow these steps to connect your Google Analytics data and view it directly in your admin panel.</p>
                            <div className="space-y-4">
                                {setupSteps.map((step, idx) => (
                                    <div key={idx} className={`flex gap-4 p-4 rounded-xl border transition-all ${step.done ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}>
                                        <div className="shrink-0 mt-0.5">
                                            {step.done
                                                ? <CheckCircle size={22} className="text-emerald-500" />
                                                : <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-500">{idx + 1}</div>
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-bold text-sm mb-1 ${step.done ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-900 dark:text-white'}`}>{step.label}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
                                            {step.action && !step.done && (
                                                <a
                                                    href={step.action.href}
                                                    target={step.action.external ? '_blank' : '_self'}
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                                >
                                                    {step.action.label} <ArrowRight size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Settings size={18} className="text-slate-400" /> Alternative: View in Google Analytics Directly
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">You can also view your analytics by logging into Google Analytics directly.</p>
                            <a
                                href="https://analytics.google.com"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                            >
                                <ExternalLink size={16} /> Open Google Analytics
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
