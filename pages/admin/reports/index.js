import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Calendar, Download, TrendingUp, DollarSign, PieChart as PieChartIcon, Activity } from 'lucide-react'
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts'

export default function ReportsDashboard() {
    const [dateRange, setDateRange] = useState('30d') // 30d, ytd, 1y
    const [revenueData, setRevenueData] = useState([])
    const [occupancyData, setOccupancyData] = useState([])
    const [sourceData, setSourceData] = useState([])
    const [summary, setSummary] = useState({ totalRevenue: 0, totalBookings: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [dateRange])

    const getDateParams = () => {
        const end = new Date()
        const start = new Date()
        if (dateRange === '30d') start.setDate(end.getDate() - 30)
        if (dateRange === '90d') start.setDate(end.getDate() - 90)
        if (dateRange === 'ytd') start.setMonth(0, 1)

        return `from=${start.toISOString()}&to=${end.toISOString()}`
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = getDateParams()
            const [rev, occ, src, sum] = await Promise.all([
                apiFetch(`/reports/revenue?${params}`),
                apiFetch(`/reports/occupancy?${params}`),
                apiFetch(`/reports/sources?${params}`),
                apiFetch(`/reports/summary?${params}`)
            ])

            setRevenueData(rev)
            setOccupancyData(occ)
            setSourceData(src)
            setSummary(sum)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        // Simple CSV export of revenue data
        const headers = ['Date', 'Revenue', 'Occupancy (%)']
        const rows = revenueData.map((r, i) => {
            const occ = occupancyData.find(o => o.date === r.date)?.rate || 0
            return [r.date, r.value, occ]
        })

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Reports & Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400">Deep dive into your hotel performance</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                        {['30d', '90d', 'ytd'].map(r => (
                            <button
                                key={r}
                                onClick={() => setDateRange(r)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${dateRange === r
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                            >
                                {r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : 'This Year'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-bold uppercase">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">฿{summary.totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Activity size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-bold uppercase">Total Bookings</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{summary.totalBookings}</h3>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500" /> Revenue Trend
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={val => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                                <YAxis tickFormatter={val => `฿${val / 1000}k`} />
                                <ReTooltip />
                                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Occupancy Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" /> Occupancy Rate
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={occupancyData}>
                                <defs>
                                    <linearGradient id="colorOcc2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={val => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                                <YAxis unit="%" domain={[0, 100]} />
                                <ReTooltip />
                                <Area type="monotone" dataKey="rate" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOcc2)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Room Popularity (Pie) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-purple-500" /> Room Popularity
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ReTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insight Box (Placeholder for future AI insights) */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4">💡 Business Insights</h3>
                        <p className="text-slate-300 mb-6 max-w-lg">
                            Occupancy is trending <strong>up by 5%</strong> compared to last month.
                            Your "Deluxe Room" is the most popular choice this season.
                            Consider running a promotion for "Standard Rooms" to boost their weekday performance.
                        </p>
                        <button className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold hover:bg-emerald-400 transition-colors">
                            View Detailed Analysis
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                </div>
            </div>

        </AdminLayout>
    )
}
