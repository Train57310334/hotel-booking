import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch, API_BASE } from '@/lib/api'
import { useAdmin } from '@/contexts/AdminContext'
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Wallet, Activity, CalendarDays, Download, FileText, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmationModal from '@/components/ConfirmationModal'
import DatePicker from '@/components/DatePicker'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AccountingDashboard() {
    const { t } = useLanguage()
    const { currentHotel } = useAdmin() || {}
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({ summary: {}, expensesByCategory: [], chartData: [] })
    const [expenses, setExpenses] = useState([])
    
    // Date filter: default to current month
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return {
            start: firstDay.toISOString().split('T')[0],
            end: lastDay.toISOString().split('T')[0]
        }
    })

    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Utilities', date: new Date().toISOString().split('T')[0] })
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null })

    const categories = ['Utilities', 'Salary', 'Maintenance', 'Marketing', 'Supplies', 'Other']

    useEffect(() => {
        if (currentHotel) {
            fetchData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentHotel?.id, dateRange])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [plRes, expRes] = await Promise.all([
                apiFetch(`/accounting/pl-report?hotelId=${currentHotel?.id}&startDate=${dateRange.start}&endDate=${dateRange.end}`),
                apiFetch(`/accounting/expenses?hotelId=${currentHotel?.id}&startDate=${dateRange.start}&endDate=${dateRange.end}`)
            ])
            setData(plRes)
            setExpenses(expRes.expenses)
        } catch (error) {
            console.error('Failed to fetch accounting data:', error)
            toast.error('Failed to load accounting data')
        } finally {
            setLoading(false)
        }
    }

    const handleAddExpense = async (e) => {
        e.preventDefault()
        try {
            await apiFetch('/accounting/expenses', {
                method: 'POST',
                body: JSON.stringify({ ...newExpense, hotelId: currentHotel.id, amount: Number(newExpense.amount) })
            })
            toast.success('Expense recorded')
            setIsAddModalOpen(false)
            setNewExpense({ title: '', amount: '', category: 'Utilities', date: new Date().toISOString().split('T')[0] })
            fetchData()
        } catch (error) {
            toast.error('Failed to add expense')
        }
    }

    const handleDeleteExpense = async () => {
        try {
            await apiFetch(`/accounting/expenses/${confirmDelete.id}`, { method: 'DELETE' })
            toast.success('Expense deleted')
            fetchData()
        } catch (error) {
            toast.error('Failed to delete expense')
        } finally {
            setConfirmDelete({ isOpen: false, id: null })
        }
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-TH', { style: 'currency', currency: 'THB' }).format(val || 0)

    const handleExport = async (format) => {
        setIsExportMenuOpen(false)
        const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`)
        try {
            const token = localStorage.getItem('token')
            const query = `?hotelId=${currentHotel?.id}&from=${dateRange.start}&to=${dateRange.end}`

            const res = await fetch(`${API_BASE}/reports/export/${format}${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Export failed')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `accounting_export_${dateRange.start}_to_${dateRange.end}.${format === 'excel' ? 'xlsx' : 'csv'}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)

            toast.success('Report downloaded!', { id: toastId })
        } catch (e) {
            console.error(e)
            toast.error('Failed to download report', { id: toastId })
        }
    }

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('reports.accounting.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t('reports.accounting.subtitle')}</p>
                </div>
                
                <div className="flex justify-end gap-2 h-10">
                    <div className="relative h-full">
                        <button
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 h-full rounded-lg font-bold text-xs transition-colors"
                        >
                            <Download size={14} /> {t('reports.accounting.export')} <ChevronDown size={14} className={`transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isExportMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setIsExportMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors">
                                        <FileText size={16} className="text-blue-500" /> Excel (.xlsx)
                                    </button>
                                    <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors border-t border-slate-100 dark:border-slate-700">
                                        <FileText size={16} className="text-indigo-500" /> CSV Summary
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3 h-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <DatePicker 
                            value={dateRange.start}
                            onChange={(dates) => setDateRange(p => ({ ...p, start: dates[0] || '' }))}
                            options={{ dateFormat: 'd/m/Y' }}
                            placeholder="Start Date"
                            className="!bg-transparent !border-none !text-sm !font-medium focus:!ring-0 !cursor-pointer dark:!text-white !p-0 !pl-8"
                        />
                        <span className="text-slate-400">to</span>
                        <DatePicker 
                            value={dateRange.end}
                            onChange={(dates) => setDateRange(p => ({ ...p, end: dates[0] || '' }))}
                            options={{ dateFormat: 'd/m/Y' }}
                            placeholder="End Date"
                            className="!bg-transparent !border-none !text-sm !font-medium focus:!ring-0 !cursor-pointer dark:!text-white !p-0 !pl-8"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin text-blue-500"><Activity size={32}/></div></div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full transition-transform group-hover:scale-150"></div>
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('reports.accounting.totalRevenue')}</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(data.summary.totalRevenue)}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full transition-transform group-hover:scale-150"></div>
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('reports.accounting.totalExpenses')}</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(data.summary.totalExpenses)}</h3>
                            </div>
                        </div>

                        <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden group ${data.summary.netProfit >= 0 ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500' : 'bg-gradient-to-br from-rose-500 to-rose-700 border-rose-500'}`}>
                            <div className="absolute right-4 top-4 opacity-20"><Wallet size={48} /></div>
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-white/80 mb-1">{t('reports.accounting.netProfit')}</p>
                                <h3 className="text-3xl font-extrabold text-white mb-2">{formatCurrency(data.summary.netProfit)}</h3>
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                                    {data.summary.netProfit >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                    {data.summary.profitMargin.toFixed(1)}% {t('reports.accounting.margin')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* P/L Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('reports.accounting.dailyChart')}</h2>
                            <div className="h-64 flex items-end justify-between gap-1">
                                {data.chartData.length > 0 ? data.chartData.map((d, i) => {
                                    const maxVal = Math.max(...data.chartData.map(c => Math.max(c.revenue, c.expense))) || 1;
                                    const revHeight = Math.max((d.revenue / maxVal) * 100, 2); // Min height 2%
                                    const expHeight = Math.max((d.expense / maxVal) * 100, 2);

                                    return (
                                        <div key={i} className="flex flex-col justify-end w-full group relative h-full">
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-xl">
                                                <p className="font-bold border-b border-slate-700 pb-1 mb-1">{d.date}</p>
                                                <p className="text-blue-400">{t('reports.accounting.revenue')}: {formatCurrency(d.revenue)}</p>
                                                <p className="text-rose-400">{t('reports.accounting.expenses')}: {formatCurrency(d.expense)}</p>
                                                <p className="font-bold text-blue-300 pt-1 mt-1 border-t border-slate-700">Net: {formatCurrency(d.profit)}</p>
                                            </div>
                                            
                                            <div className="flex gap-px items-end justify-center w-full h-full pb-4 border-b border-slate-100">
                                                <div className="w-1/2 bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-400" style={{ height: `${revHeight}%` }}></div>
                                                <div className="w-1/2 bg-rose-400 rounded-t-sm transition-all group-hover:bg-rose-300" style={{ height: `${expHeight}%` }}></div>
                                            </div>
                                            {/* Date label for 1st, 15th, or last day */}
                                            {(i === 0 || i === Math.floor(data.chartData.length/2) || i === data.chartData.length - 1) && (
                                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 translate-y-full">
                                                    {d.date.split('-')[2]}
                                                </span>
                                            )}
                                        </div>
                                    )
                                }) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">{t('reports.accounting.noData')}</div>
                                )}
                            </div>
                            <div className="flex justify-center gap-6 mt-8">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="w-3 h-3 rounded-sm bg-blue-500"></span> {t('reports.accounting.revenue')}</div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="w-3 h-3 rounded-sm bg-rose-400"></span> {t('reports.accounting.expenses')}</div>
                            </div>
                        </div>

                        {/* Expense Distribution */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('reports.accounting.distribution')}</h2>
                            <div className="space-y-4">
                                {data.expensesByCategory.length > 0 ? data.expensesByCategory.sort((a,b)=>b.value - a.value).map((cat, i) => {
                                    const percent = ((cat.value / data.summary.totalExpenses) * 100).toFixed(1);
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                                                <span className="text-slate-500 font-mono">{formatCurrency(cat.value)}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <div className="text-center py-10 text-slate-400 text-sm">{t('reports.accounting.noData')}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Expense Ledger */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-safe">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('reports.accounting.ledger')}</h2>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="w-full sm:w-auto px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                            >
                                <Plus size={18} /> {t('reports.accounting.recordBtn')}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">{t('reports.accounting.date')}</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">{t('reports.accounting.desc')}</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">{t('reports.accounting.category')}</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">{t('reports.accounting.amount')}</th>
                                        <th className="px-6 py-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {expenses.length === 0 ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-400">No expenses recorded in this period.</td></tr>
                                    ) : expenses.map(exp => (
                                        <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                                {new Date(exp.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                {exp.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium uppercase">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-rose-500">
                                                - {formatCurrency(exp.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => setConfirmDelete({ isOpen: true, id: exp.id })}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Add Expense Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                        <h2 className="text-xl font-bold mb-6 flex justify-between items-center text-slate-900 dark:text-white">
                            {t('reports.accounting.addModalTitle')}
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </h2>
                        
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.accounting.desc')}</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newExpense.title}
                                    onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-rose-500"
                                    placeholder="e.g. Electric Bill, Receptionist Salary"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.accounting.amount')} (THB)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="number" 
                                            required 
                                            min="0"
                                            value={newExpense.amount}
                                            onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-rose-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.accounting.date')}</label>
                                    <DatePicker 
                                        value={newExpense.date}
                                        onChange={dates => setNewExpense({...newExpense, date: dates[0] || ''})}
                                        options={{ dateFormat: 'd/m/Y' }}
                                        className="!w-full !px-4 !py-2.5 !rounded-xl !border !border-slate-200 dark:!border-slate-600 !bg-white dark:!bg-slate-700 focus:!ring-2 focus:!ring-rose-500 !pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.accounting.category')}</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setNewExpense({...newExpense, category: cat})}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${newExpense.category === cat 
                                                    ? 'bg-rose-100 text-rose-700 border-rose-200' 
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-700'
                                                } border border-transparent`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                                    {t('checkout.back')}
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-sm transition-colors">
                                    {t('reports.accounting.saveBtn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={handleDeleteExpense}
                title={t('reports.accounting.deleteTitle')}
                message={t('reports.accounting.deleteConfirm')}
                type="danger"
                confirmText={t('admin.hotel.delete')}
            />
        </AdminLayout>
    )
}
