import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { DollarSign, Plus, Trash2, Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react'
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
    Area
} from 'recharts'

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        to: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]
    })

    // Data State
    const [summary, setSummary] = useState({ totalRevenue: 0, totalExpenses: 0, totalProfit: 0, totalBookings: 0 })
    const [expenses, setExpenses] = useState([])
    const [chartData, setChartData] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    // Modal State
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [dateRange])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // 1. Get Summary
            const sum = await apiFetch(`/reports/summary?from=${dateRange.from}&to=${dateRange.to}`)
            setSummary(sum)

            // 2. Get Expenses List (Table)
            const hotels = await apiFetch('/hotels')
            if (hotels.length > 0) {
                const exps = await apiFetch(`/expenses?hotelId=${hotels[0].id}&from=${dateRange.from}&to=${dateRange.to}`)
                setExpenses(exps)
            }

            // 3. Get Chart Data (Daily Revenue vs Expenses)
            const [revData, expData] = await Promise.all([
                apiFetch(`/reports/revenue?from=${dateRange.from}&to=${dateRange.to}`),
                apiFetch(`/reports/expenses?from=${dateRange.from}&to=${dateRange.to}`)
            ])

            // Merge Data by Date
            const merged = {}
            revData.forEach(r => merged[r.date] = { date: r.date, revenue: r.value, expenses: 0 })
            expData.forEach(e => {
                if (!merged[e.date]) merged[e.date] = { date: e.date, revenue: 0, expenses: 0 }
                merged[e.date].expenses = e.value
            })

            // Sort by Date
            const sortedChart = Object.values(merged).sort((a, b) => new Date(a.date) - new Date(b.date))
            setChartData(sortedChart)

        } catch (e) {
            console.error(e)
            toast.error('Failed to load report data')
        } finally {
            setIsLoading(false)
        }
    }

    const exportCSV = () => {
        const headers = ['Date', 'Title', 'Category', 'Amount']
        const rows = expenses.map(e => [
            new Date(e.date).toISOString().split('T')[0],
            e.title,
            e.category,
            e.amount
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `expenses_report_${dateRange.from}_${dateRange.to}.csv`)
        document.body.appendChild(link)
        link.click()
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="text-emerald-500" /> Financial Reports
                        </h1>
                        <p className="text-slate-500 text-sm">Track your income, expenses and profit.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-slate-900/20"
                        >
                            <TrendingUp size={16} /> Export CSV
                        </button>
                        <div className="flex gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 px-3 border-r dark:border-slate-700">
                                <Calendar size={16} className="text-slate-400" />
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                                    className="bg-transparent text-sm font-bold dark:text-white outline-none"
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                                    className="bg-transparent text-sm font-bold dark:text-white outline-none"
                                />
                            </div>
                            <button onClick={fetchData} className="text-emerald-600 font-bold text-sm px-2 hover:bg-emerald-50 rounded">
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <TrendingUp className="text-emerald-500" size={24} />
                            </div>
                            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">+ Income</span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-bold mb-1">Total Revenue</h3>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">฿{summary.totalRevenue.toLocaleString()}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                                <TrendingDown className="text-rose-500" size={24} />
                            </div>
                            <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded-full">- Expense</span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-bold mb-1">Total Expenses</h3>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">฿{summary.totalExpenses.toLocaleString()}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <DollarSign className="text-blue-500" size={24} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${summary.totalProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {summary.totalProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-bold mb-1">Net Profit</h3>
                        <p className={`text-3xl font-bold ${summary.totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            ฿{summary.totalProfit.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
                    <h3 className="font-bold text-lg mb-6 dark:text-white">Revenue vs Expenses Flow</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={str => new Date(str).toLocaleDateString()} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" strokeWidth={2} />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                        <h3 className="font-bold text-lg dark:text-white">Expense Log</h3>
                        <button
                            onClick={() => setIsExpenseModalOpen(true)}
                            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-rose-500/20"
                        >
                            <Plus size={16} /> Record Expense
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700 text-xs text-slate-500 uppercase">
                                    <th className="p-4 font-bold bg-slate-50 dark:bg-slate-800/50">Date</th>
                                    <th className="p-4 font-bold bg-slate-50 dark:bg-slate-800/50">Title</th>
                                    <th className="p-4 font-bold bg-slate-50 dark:bg-slate-800/50">Category</th>
                                    <th className="p-4 font-bold bg-slate-50 dark:bg-slate-800/50 text-right">Amount</th>
                                    <th className="p-4 font-bold bg-slate-50 dark:bg-slate-800/50 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            No expenses recorded for this period.
                                        </td>
                                    </tr>
                                )}
                                {expenses.map(ex => (
                                    <tr key={ex.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 text-sm dark:text-slate-300">
                                            {new Date(ex.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-bold text-slate-800 dark:text-white">
                                            {ex.title}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                                                {ex.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-rose-600 text-right">
                                            -฿{ex.amount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                // TODO: Implementation Delete Expense
                                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSuccess={() => {
                    fetchData()
                    setIsExpenseModalOpen(false)
                }}
            />
        </AdminLayout>
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
                    <button type="button" onClick={onClose}><Trash2 className="opacity-0 w-0 h-0" /></button> {/* Hidden accessible close? just use cancel button */}
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
                            <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
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
