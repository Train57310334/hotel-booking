import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch, API_URL } from '@/lib/api';
import { Download, Copy, CheckCircle, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WidgetGenerator() {
    const { currentHotel } = useAdmin() || {};
    const [copied, setCopied] = useState(false);

    if (!currentHotel) {
        return (
            <AdminLayout>
                <div className="p-8 text-center text-slate-500">
                    Please select a hotel to generate a widget.
                </div>
            </AdminLayout>
        )
    }

    const shortcode = `[hotel_booking_search]`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shortcode);
        setCopied(true);
        toast.success('Shortcode copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/downloads/kb-hotel-booking.zip';
        link.download = 'kb-hotel-booking.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started!');
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                        WordPress Widget Generator
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Generate a booking search form for your WordPress website.
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Step 1: Download Plugin */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Download size={100} />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">1</div>
                            Download Plugin
                        </h2>

                        <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-xl">
                            First, download the <strong>KB Hotel Booking</strong> plugin. This plugin connects your WordPress site to our booking engine.
                        </p>

                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            <Download size={20} />
                            Download Plugin (.zip)
                        </button>
                    </div>

                    {/* Step 2: Install */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</div>
                            Install and Configure
                        </h2>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-2">
                            <li>Log in to your WordPress Admin Dashboard.</li>
                            <li>Go to <strong>Plugins &gt; Add New</strong> and click <strong>Upload Plugin</strong>.</li>
                            <li>Upload and activate the <code>kb-hotel-booking.zip</code> file.</li>
                            <li>Go to <strong>Settings &gt; Hotel Booking Widget</strong>.</li>
                            <li>Enter your Hotel ID: <code className="bg-slate-100 px-2 py-1 rounded text-emerald-600 font-bold">{currentHotel.id}</code></li>
                            <li>Click <strong>Save Settings</strong>.</li>
                        </ol>
                    </div>

                    {/* Step 3: Shortcode */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">3</div>
                            Add Shortcode
                        </h2>

                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Copy and paste the following shortcode into any Page, Post, or Widget area on your WordPress site.
                        </p>

                        <div className="relative group">
                            <div className="bg-slate-900 text-slate-200 font-mono p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                                <code>{shortcode}</code>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <CheckCircle size={20} className="text-emerald-500" /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
