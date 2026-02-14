
import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { DollarSign, Plus, Trash2, Calendar, FileText, TrendingUp, TrendingDown, Moon, Activity, BedDouble } from 'lucide-react'
import toast from 'react-hot-toast'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    ComposedChart
} from 'recharts'

import { useAdmin } from '@/contexts/AdminContext'

export default function ReportsPage() {
    const { currentHotel } = useAdmin() || {}
    const [activeTab, setActiveTab] = useState('general') // 'general' | 'audit'

    // ... (rest of render)
    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            {activeTab === 'general' ? <FileText className="text-emerald-500" /> : <Moon className="text-indigo-500" />}
                            {activeTab === 'general' ? 'Financial Reports' : 'Night Audit Logs'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {activeTab === 'general' ? 'Track your income, expenses and profit.' : 'Daily Review of Occupancy, ADR and RevPAR.'}
                        </p>
                    </div>

                    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'general' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'audit' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            Night Audit
                        </button>
                    </div>
                </div>

                {activeTab === 'general' ? <GeneralReports hotelId={currentHotel?.id} /> : <NightAuditReports hotelId={currentHotel?.id} />}
            </div>
        </AdminLayout >
    )
}

const toLocalISO = (date) => {
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - (offset * 60 * 1000))
    return local.toISOString().split('T')[0]
}

function GeneralReports({ hotelId }) {
    const [dateRange, setDateRange] = useState({
        from: toLocalISO(new Date(new Date().getFullYear(), 0, 1)),
        to: toLocalISO(new Date(new Date().getFullYear(), 11, 31))
    })
    const [summary, setSummary] = useState({ totalRevenue: 0, totalExpenses: 0, totalProfit: 0, totalBookings: 0 })
    const [expenses, setExpenses] = useState([])
    const [chartData, setChartData] = useState([])
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

    useEffect(() => {
        if (hotelId) fetchData()
    }, [dateRange, hotelId])

    const fetchData = async () => {
        try {
            const query = `?hotelId=${hotelId}&from=${dateRange.from}&to=${dateRange.to}`;
            const sum = await apiFetch(`/reports/summary${query}`)
            setSummary(sum)

            const exps = await apiFetch(`/expenses${query}`)
            setExpenses(exps)

            const [revData, expData] = await Promise.all([
                apiFetch(`/reports/revenue${query}`),
                apiFetch(`/reports/expenses${query}`)
            ])

            const merged = {}
            revData.forEach(r => merged[r.date] = { date: r.date, revenue: r.value, expenses: 0 })
            expData.forEach(e => {
                if (!merged[e.date]) merged[e.date] = { date: e.date, revenue: 0, expenses: 0 }
                merged[e.date].expenses = e.value
            })
            setChartData(Object.values(merged).sort((a, b) => new Date(a.date) - new Date(b.date)))
        } catch (e) { console.error(e); toast.error('Failed to load data') }
    }


    const exportCSV = () => {
        const headers = ['Date', 'Title', 'Category', 'Amount']
        const rows = expenses.map(e => [toLocalISO(new Date(e.date)), e.title, e.category, e.amount])
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")
        const link = document.createElement("a")
        link.setAttribute("href", encodeURI(csvContent))
        link.setAttribute("download", `expenses.csv`)
        document.body.appendChild(link)
        link.click()
    }

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex justify-end gap-2">
                <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg font-bold text-xs">Export CSV</button>
                <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-lg border dark:border-slate-700 items-center gap-2">
                    <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} className="text-xs bg-transparent dark:text-white outline-none" />
                    <span className="text-slate-400">-</span>
                    <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} className="text-xs bg-transparent dark:text-white outline-none" />
                    <button onClick={fetchData} className="text-emerald-600 font-bold text-xs px-2 hover:bg-emerald-50 rounded">Refresh</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">฿{summary.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Expenses</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">฿{summary.totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Net Profit</p>
                    <p className={`text-3xl font-bold ${summary.totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>฿{summary.totalProfit.toLocaleString()}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={d => new Date(d).toLocaleDateString()} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRev)" strokeWidth={2} />
                        <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="none" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Expenses List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                    <h3 className="font-bold dark:text-white">Expense Log</h3>
                    <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors">
                        <Plus size={14} /> Add Expense
                    </button>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Category</th>
                                <th className="p-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {expenses.map(e => (
                                <tr key={e.id}>
                                    <td className="p-3 dark:text-slate-300">{new Date(e.date).toLocaleDateString()}</td>
                                    <td className="p-3 font-bold dark:text-white">{e.title}</td>
                                    <td className="p-3"><span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 uppercase">{e.category}</span></td>
                                    <td className="p-3 text-right text-rose-500 font-bold">-฿{e.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSuccess={() => { fetchData(); setIsExpenseModalOpen(false) }} />
        </div>
    )
}

function NightAuditReports() {
    const [stats, setStats] = useState([])

    useEffect(() => {
        apiFetch('/reports/daily-stats').then(setStats).catch(console.error)
    }, [])

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <Activity size={16} /> <span className="text-xs font-bold uppercase">Avg Occupancy</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">
                        {stats.length > 0 ? Math.round(stats.reduce((a, b) => a + b.occupancyRate, 0) / stats.length) : 0}%
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <DollarSign size={16} /> <span className="text-xs font-bold uppercase">Avg ADR</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">
                        ฿{stats.length > 0 ? Math.round(stats.reduce((a, b) => a + b.adr, 0) / stats.length).toLocaleString() : 0}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <TrendingUp size={16} /> <span className="text-xs font-bold uppercase">Avg RevPAR</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                        ฿{stats.length > 0 ? Math.round(stats.reduce((a, b) => a + b.revPar, 0) / stats.length).toLocaleString() : 0}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <BedDouble size={16} /> <span className="text-xs font-bold uppercase">Total Rooms Sold</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                        {stats.length > 0 ? stats.reduce((a, b) => a + b.occupiedRooms, 0) : 0}
                    </div>
                </div>
            </div>

            {/* Combined Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-96">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Occupancy & ADR Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[...stats].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" fontSize={10} tickFormatter={d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} />
                        <YAxis yAxisId="left" fontSize={10} />
                        <YAxis yAxisId="right" orientation="right" fontSize={10} unit="%" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="adr" name="ADR (Price)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                        <Line yAxisId="right" type="monotone" dataKey="occupancyRate" name="Occupancy %" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Daily Audit Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b dark:border-slate-700 font-bold dark:text-white bg-slate-50/50 dark:bg-slate-800">
                    Daily Audit Logs (Last 30 Days)
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3 text-center">Occupied</th>
                                <th className="p-3 text-center">Occ %</th>
                                <th className="p-3 text-right">ADR</th>
                                <th className="p-3 text-right">RevPAR</th>
                                <th className="p-3 text-right">Total Rev</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {stats.map(s => (
                                <tr key={s.id}>
                                    <td className="p-3 font-mono text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                                    <td className="p-3 text-center dark:text-white">{s.occupiedRooms}</td>
                                    <td className="p-3 text-center font-bold text-indigo-600">{s.occupancyRate.toFixed(1)}%</td>
                                    <td className="p-3 text-right dark:text-white">฿{s.adr.toLocaleString()}</td>
                                    <td className="p-3 text-right font-bold text-emerald-600">฿{s.revPar.toLocaleString()}</td>
                                    <td className="p-3 text-right dark:text-white">฿{s.totalRevenue.toLocaleString()}</td>
                                </tr>
                            ))}
                            {stats.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No audit logs yet. Wait for 2 AM run.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function AddExpenseModal({ isOpen, onClose, onSuccess }) {
    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        try {
            // Need hotelId
            const hotels = await apiFetch('/hotels')
            if (hotels.length === 0) return toast.error('No hotel found')

            await apiFetch('/expenses', {
                method: 'POST',
                body: JSON.stringify({
                    hotelId: hotels[0].id,
                    title: formData.get('title'),
                    amount: Number(formData.get('amount')),
                    date: formData.get('date'),
                    category: formData.get('category')
                })
            })
            toast.success('Expense recorded')
            onSuccess()
        } catch (e) {
            toast.error('Failed to save')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-[400px] shadow-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg dark:text-white">Record New Expense</h3>
                    <button type="button" onClick={onClose}><Trash2 className="opacity-0 w-0 h-0" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                        <input name="title" required placeholder="e.g. Electricity Bill" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (THB)</label>
                            <input name="amount" type="number" required placeholder="0.00" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                            <input name="date" type="date" required defaultValue={toLocalISO(new Date())} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                        <select name="category" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="utilities">Utilities (Water/Electric)</option>
                            <option value="salary">Salary</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="marketing">Marketing</option>
                            <option value="supplies">Supplies</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20">Save Record</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

