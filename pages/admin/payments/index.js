import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, CreditCard, DollarSign, Calendar, Filter, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

export default function PaymentManagement() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // ... (useEffect and fetchPayments remain same)

  const handleVerify = async (id) => {
    if (!confirm('Confirm this payment?')) return
    try {
      await apiFetch(`/payments/${id}/verify`, { method: 'POST' })
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'captured' } : p))
    } catch (e) {
      alert('Failed to verify payment')
    }
  }

  const handleReject = async (id) => {
    if (!confirm('Reject this payment?')) return
    try {
      await apiFetch(`/payments/${id}/reject`, { method: 'POST' })
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'failed' } : p))
    } catch (e) {
      alert('Failed to reject payment')
    }
  }

  // ... (formatDate and getStatusColor remain same)

  return (
    <AdminLayout>
      {/* ... (Header and Filters remain same) */}

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
                      {pay.status === 'captured' && (
                        <button className="text-slate-400 hover:text-slate-600" title="View Details">
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
    </AdminLayout>
  )
}
