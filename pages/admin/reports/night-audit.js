import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Moon, TrendingUp, Users, LogIn, LogOut, BedDouble,
    TriangleAlert, CheckCircle2, Printer, RefreshCw, Clock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const fmt = (n) => `฿${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

const STATUS_BADGE = {
    confirmed:    'bg-blue-50 text-blue-700 border-blue-200',
    checked_in:   'bg-teal-50 text-teal-700 border-teal-200',
    checked_out:  'bg-slate-100 text-slate-600 border-slate-200',
    cancelled:    'bg-red-50 text-red-600 border-red-200',
};

export default function NightAuditPage() {
    const { t } = useLanguage();
    const { currentHotel } = useAdmin() || {};
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [data, setData] = useState(null);

    const fetchLatest = async () => {
        if (!currentHotel?.id) return;
        try {
            const result = await apiFetch(`/reports/${currentHotel.id}/night-audit/latest`);
            setData(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentHotel?.id]);

    const handleRunAudit = async () => {
        const confirmed = window.confirm(t('reports.nightAudit.confirmRun'));
        if (!confirmed) return;

        setRunning(true);
        const t = toast.loading('Running Night Audit...');
        try {
            const result = await apiFetch(`/reports/${currentHotel.id}/night-audit`, { method: 'POST' });
            toast.success(`Night Audit complete! ${result.autoCheckedOut} auto-checkout(s) processed.`, { id: t, duration: 5000 });
            setData({ ...result, hasRun: true, kpis: result.kpis });
        } catch (e) {
            toast.error('Audit failed. Please try again.', { id: t });
        } finally {
            setRunning(false);
        }
    };

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) return (
        <AdminLayout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto pb-16 print:p-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Moon size={22} className="text-indigo-500" />
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('reports.nightAudit.title')}</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{today}</p>
                    </div>
                    <div className="flex gap-2 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition-all"
                        >
                            <Printer size={15} /> {t('reports.nightAudit.printBtn')}
                        </button>
                            onClick={handleRunAudit}
                            disabled={running}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60 shadow-sm"
                        >
                            {running ? <><RefreshCw size={15} className="animate-spin" /> {t('reports.nightAudit.running')}</> : <><Moon size={15} /> {t('reports.nightAudit.runBtn')}</>}
                        </button>
                    </div>
                </div>

                {/* Audit Status Banner */}
                {data?.hasRun ? (
                    <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-400 rounded-2xl px-5 py-3 mb-6 text-sm font-medium">
                        <CheckCircle2 size={18} />
                        {t('reports.nightAudit.statusRun')}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-2xl px-5 py-3 mb-6 text-sm font-medium">
                        <TriangleAlert size={18} />
                        {t('reports.nightAudit.statusPending')}
                    </div>
                )}

                {/* KPI Cards */}
                {data?.kpis ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {[
                            { label: t('reports.nightAudit.occupiedRooms'), value: `${data.kpis.occupiedCount} / ${data.kpis.totalRooms}`, icon: BedDouble, color: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-500/20' },
                            { label: t('reports.nightAudit.occupancyRate'), value: pct(data.kpis.occupancyRate), icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-500/20' },
                            { label: t('reports.nightAudit.todayRevenue'), value: fmt(data.kpis.totalRevenue), icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-500/20' },
                            { label: t('reports.nightAudit.adr'), value: fmt(data.kpis.adr), icon: TrendingUp, color: 'text-violet-600 bg-violet-50 border-violet-100 dark:bg-violet-900/20 dark:border-violet-500/20' },
                            { label: t('reports.nightAudit.revpar'), value: fmt(data.kpis.revPar), icon: TrendingUp, color: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-500/20' },
                            { label: t('reports.nightAudit.totalRooms'), value: data.kpis.totalRooms, icon: BedDouble, color: 'text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700' },
                        ].map(card => (
                            <div key={card.label} className={`rounded-2xl border p-5 ${card.color}`}>
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{card.label}</p>
                                <p className="text-2xl font-bold">{card.value}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 mb-8">
                        <Moon size={32} className="mx-auto mb-2 opacity-40" />
                        <p className="font-bold">No KPI snapshot yet</p>
                        <p className="text-sm mt-1">Run the Night Audit to capture today's numbers.</p>
                    </div>
                )}

                {/* Booking Tables */}
                <div className="space-y-8">
                    <BookingSection
                        title={t('reports.nightAudit.checkins')}
                        icon={<LogIn size={16} className="text-blue-500" />}
                        bookings={data?.checkIns || []}
                        emptyMsg={t('admin.hotel.noGuests')}
                    />
                    <BookingSection
                        title={t('reports.nightAudit.checkouts')}
                        icon={<LogOut size={16} className="text-red-400" />}
                        bookings={data?.checkOuts || []}
                        emptyMsg={t('admin.hotel.noGuests')}
                    />
                    <BookingSection
                        title={t('reports.nightAudit.staying')}
                        icon={<Clock size={16} className="text-amber-500" />}
                        bookings={data?.staying || []}
                        emptyMsg={t('admin.hotel.noGuests')}
                    />
                </div>

                {/* Print Footer */}
                <div className="hidden print:block mt-8 pt-4 border-t border-slate-200 text-xs text-slate-400">
                    <p>Generated: {new Date().toLocaleString()} · {data?.hotelName}</p>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    aside, nav, .print\\:hidden { display: none !important; }
                    body { background: white !important; }
                    .dark * { color: black !important; background: white !important; border-color: #e2e8f0 !important; }
                }
            `}</style>
        </AdminLayout>
    );
}

function BookingSection({ title, icon, bookings, emptyMsg }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                {icon}
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h3>
                <span className="ml-auto text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    {bookings.length}
                </span>
            </div>
            {bookings.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">{emptyMsg}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-700">
                                {['Guest', 'Room Type', 'Check-in', 'Check-out', 'Amount', 'Status'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{b.leadName}</td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{b.roomType || '—'}</td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {b.checkIn ? new Date(b.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {b.checkOut ? new Date(b.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white whitespace-nowrap">{fmt(b.totalAmount)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[b.status] || STATUS_BADGE.confirmed}`}>
                                            {b.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
