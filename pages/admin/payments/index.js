import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, CreditCard, DollarSign, Calendar, Filter, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

export default function PaymentManagement() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewModal, setViewModal] = useState(null)

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (searchTerm) query.append('search', searchTerm)
      if (statusFilter !== 'All') query.append('status', statusFilter.toLowerCase())

      const data = await apiFetch(`/payments/admin/all?${query.toString()}`)
      setPayments(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments()
    }, 500) // Debounce search
    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter])

  const formatDate = (date) => {
    return new Date(date).toLocaleString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'captured': return 'bg-emerald-100 text-emerald-700'
      case 'created': return 'bg-blue-100 text-blue-700'
      case 'failed': return 'bg-rose-100 text-rose-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <AdminLayout>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by guest name or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Captured', 'Pending', 'Failed', 'Manual'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${statusFilter === status
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
            >
              {status}
            </button>
          ))}
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
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading transactions...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No transactions found.</td></tr>
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
                        <CreditCard size={14} /> {pay.method || pay.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(pay.date || pay.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusColor(pay.status)}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pay.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleVerify(pay.id)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded" title="Confirm">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleReject(pay.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded" title="Reject">
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                      {(pay.status === 'captured' || pay.isManual) && (
                        <button onClick={() => setViewModal(pay)} className="text-slate-400 hover:text-slate-600" title="View Details">
                          <Eye size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg dark:text-white">Transaction Details</h3>
              <button onClick={() => setViewModal(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Amount</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">฿{viewModal.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(viewModal.status)}`}>{viewModal.status}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{viewModal.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="text-slate-700 dark:text-slate-300">{formatDate(viewModal.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Method</span>
                  <span className="text-slate-700 dark:text-slate-300 uppercase">{viewModal.method}</span>
                </div>
                {viewModal.reference && (
                  <div className="border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                    <p className="text-xs text-slate-500 mb-1">Reference / Note</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-600">
                      {viewModal.reference}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button onClick={() => setViewModal(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
