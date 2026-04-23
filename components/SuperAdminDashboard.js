import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Activity,
    Building2,
    DollarSign
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function SuperAdminDashboard() {
    const { language, t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const locale = language === 'th' ? 'th-TH' : 'en-US';

    const formatCurrency = (value) => new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'THB',
        maximumFractionDigits: 0
    }).format(value || 0);

    useEffect(() => {
        fetchPlatformStats();
    }, []);

    const fetchPlatformStats = async () => {
        try {
            const data = await apiFetch('/hotels/super/stats');
            setStats(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-slate-400">
                <div className="animate-pulse">{t('admin.super.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                {t('admin.super.errorPrefix')} {error}
            </div>
        );
    }

    const cards = [
        {
            label: t('admin.super.estimatedMrr'),
            value: formatCurrency(stats?.estimatedMRR),
            icon: DollarSign,
            color: 'bg-indigo-500',
            trend: '+15%',
            sub: t('admin.super.monthlyRecurringRevenue')
        },
        {
            label: t('admin.super.activeTenants'),
            value: stats?.totalHotels || 0,
            icon: Building2,
            color: 'bg-blue-500',
            trend: '+2',
            sub: t('admin.super.registeredHotels')
        },
        {
            label: t('admin.super.totalRoomsManaged'),
            value: stats?.totalRooms || 0,
            icon: Activity,
            color: 'bg-rose-500',
            trend: null,
            sub: t('admin.super.acrossActiveProperties')
        },
    ];

    return (
        <div className="animate-fade-in-up">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {t('admin.super.platformOverview')}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('admin.super.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {cards.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white shadow-sm`}>
                                <item.icon size={20} />
                            </div>
                            {item.trend && (
                                <span className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {item.trend}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mb-0.5">{item.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{item.value}</h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('admin.super.mrrGrowth')}</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.revenueChart || []}>
                                <defs>
                                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => `${Math.round(val / 1000)}k`} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMrr)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('admin.super.subscriptions')}</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('admin.super.plan.enterprise')}</span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats?.planCounts?.ENTERPRISE || 0}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${((stats?.planCounts?.ENTERPRISE || 0) / (stats?.totalHotels || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('admin.super.plan.pro')}</span>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats?.planCounts?.PRO || 0}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${((stats?.planCounts?.PRO || 0) / (stats?.totalHotels || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('admin.super.plan.lite')}</span>
                                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{stats?.planCounts?.LITE || 0}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: `${((stats?.planCounts?.LITE || 0) / (stats?.totalHotels || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
