import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, CreditCard, DollarSign, Calendar, Filter, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function PaymentManagement() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPayments()
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, statusFilter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (searchTerm) query.append('search', searchTerm)
      if (statusFilter !== 'All') query.append('status', statusFilter)

      const data = await apiFetch(`/payments/admin/all?${query.toString()}`)
      setPayments(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB') + ' ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const getStatusColor = (status) => {
    switch (status) {
      case 'captured': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
      case 'authorized': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
      case 'failed': return 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'
      case 'refunded': return 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400'
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Payments</h1>
          <p className="text-slate-500 dark:text-slate-400">Track all transaction entries</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === 'All' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('captured')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === 'captured' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'}`}
          >
            Success
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === 'failed' ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'}`}
          >
            Failed
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search ID or Guest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading transactions...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No transactions found.</td></tr>
              ) : (
                payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {pay.id.split('-')[0]}...
                      <div className="text-[10px] text-slate-400">Ref: #{pay.bookingId.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {pay.booking?.leadName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      ฿{pay.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 uppercase">
                      <span className="flex items-center gap-1">
                        <CreditCard size={14} /> {pay.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(pay.booking?.createdAt || new Date())}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusColor(pay.status)}`}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
