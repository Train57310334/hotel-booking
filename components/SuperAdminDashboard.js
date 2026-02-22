import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
    Activity,
    Building2,
    DollarSign,
    TrendingUp,
    Users
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                <div className="animate-pulse">Loading Platform Metrics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                Failed to load platform data: {error}
            </div>
        );
    }

    const cards = [
        {
            label: 'Estimated MRR',
            value: `฿ ${stats?.estimatedMRR?.toLocaleString() || 0}`,
            icon: DollarSign,
            color: 'bg-indigo-500',
            trend: '+15%',
            sub: 'Monthly Recurring Revenue'
        },
        {
            label: 'Active Tenants',
            value: stats?.totalHotels || 0,
            icon: Building2,
            color: 'bg-emerald-500',
            trend: '+2',
            sub: 'Registered Hotels'
        },
        {
            label: 'Total Rooms Managed',
            value: stats?.totalRooms || 0,
            icon: Activity,
            color: 'bg-rose-500',
            trend: null,
            sub: 'Across all active properties'
        },
    ];

    return (
        <div className="animate-fade-in-up">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                    Platform Overview
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    High-level metrics across the entire SaaS infrastructure
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {cards.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg shadow-indigo-500/10`}>
                                <item.icon size={24} />
                            </div>
                            {item.trend && (
                                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-full">
                                    {item.trend}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{item.label}</p>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{item.value}</h3>
                            <p className="text-xs text-slate-400 mt-2 font-medium">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">MRR Growth (Estimated)</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.revenueChart || []}>
                                <defs>
                                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Plan Distribution */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Subscriptions</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">ENTERPRISE</span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats?.planCounts?.ENTERPRISE || 0}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${((stats?.planCounts?.ENTERPRISE || 0) / (stats?.totalHotels || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">PRO</span>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats?.planCounts?.PRO || 0}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${((stats?.planCounts?.PRO || 0) / (stats?.totalHotels || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">LITE (Free)</span>
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
