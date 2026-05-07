import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { apiPaths } from '@/lib/apiPaths'
import { useAuth } from '@/contexts/AuthContext'
import { useAdmin } from '@/contexts/AdminContext'
import { Search, Plus, CreditCard, Eye, User, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

import BookingDetailModal from '@/components/BookingDetailModal'
import ConfirmationModal from '@/components/ConfirmationModal'
import CreateBookingModal from '@/components/CreateBookingModal'

export default function BookingManagement() {
  const { user } = useAuth()
  const { searchQuery, currentHotel } = useAdmin() || { searchQuery: '', currentHotel: null }
  const [bookings, setBookings] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  // const [searchTerm, setSearchTerm] = useState('') // Replaced by global searchQuery
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(false)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusFilter, sortConfig])

  // Live Polling
  useEffect(() => {
    let interval
    if (isLiveMode && user?.roleAssignments?.[0]?.hotelId) {
      interval = setInterval(() => {
        const fetchSilent = async () => {
          const hotelId = user.roleAssignments[0].hotelId;
          const query = new URLSearchParams()
          query.append('hotelId', hotelId)
          query.append('page', page.toString())
          query.append('limit', '20')
          if (searchQuery) query.append('search', searchQuery)
          if (statusFilter !== 'All') query.append('status', statusFilter)
          if (sortConfig.key) {
            query.append('sortBy', sortConfig.key)
            query.append('order', sortConfig.direction)
          }
          try {
          const res = await apiFetch(apiPaths.adminBookings(Object.fromEntries(query.entries())))
            if (res.data) {
              setBookings(res.data)
              setMeta(res.meta)
            } else {
              // Fallback for old API response if not cached/deployed
              setBookings(Array.isArray(res) ? res : [])
            }
          } catch (e) { console.error(e) }
        }
        fetchSilent()
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isLiveMode, searchQuery, statusFilter, sortConfig, user, page])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (user) fetchBookings()
    }, 300)
    return () => clearTimeout(delayDebounceFn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, sortConfig, user, page, currentHotel?.id])

  const fetchBookings = async () => {
    if (!isLiveMode) setLoading(true)
    try {
      const hotelId = currentHotel?.id;
      if (!hotelId) {
        setLoading(false);
        return;
      }

      const query = new URLSearchParams()
      query.append('hotelId', hotelId)
      query.append('page', page.toString())
      query.append('limit', '20')
      if (searchQuery) query.append('search', searchQuery)
      if (statusFilter !== 'All') query.append('status', statusFilter)
      if (sortConfig.key) {
        query.append('sortBy', sortConfig.key)
        query.append('order', sortConfig.direction)
      }

      const res = await apiFetch(apiPaths.adminBookings(Object.fromEntries(query.entries())))
      if (res && res.data) {
        setBookings(res.data)
        setMeta(res.meta)
      } else {
        setBookings(Array.isArray(res) ? res : [])
      }
    } catch (error) {
      console.error(error)
      setBookings([])
    } finally {
      if (!isLiveMode) setLoading(false)
    }
  }

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => { }
  })

  // ... (updateStatus function remains unchanged) ...
  const updateStatus = (id, newStatus) => {
    setConfirmModal({
      isOpen: true,
      title: 'Update Booking Status',
      message: `Are you sure you want to change status to "${newStatus}"?`,
      type: newStatus === 'cancelled' ? 'danger' : 'warning',
      onConfirm: async () => {
        try {
          // Use currentHotel.id if available, otherwise fallback (though currentHotel should be set)
          const hotelId = currentHotel?.id || user?.roleAssignments?.[0]?.hotelId;
          await apiFetch(apiPaths.adminBookingStatus({ bookingId: id, hotelId }), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })
          fetchBookings()
          setIsDetailOpen(false)
          toast.success('Status updated')
        } catch (error) {
          toast.error('Update failed')
        }
      }
    })
  }

  const openDetails = (booking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
      case 'cancelled': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
      case 'checked_in': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB')

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Booking
            {isLiveMode && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
            Manage all reservations
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border transition-all ${isLiveMode ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
            >
              {isLiveMode ? '● Live' : '○ Live'}
            </button>
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
        >
          <Plus size={15} />
          Create Booking
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm mb-4 flex flex-wrap gap-1.5">
        {['All', 'Pending', 'Confirmed', 'Cancelled', 'Checked_in'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${statusFilter === status
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300'
              }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-3">
        <select
          className="p-1.5 rounded-lg border text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={(e) => {
            const [key, direction] = e.target.value.split('-')
            setSortConfig({ key, direction })
          }}
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="checkIn-asc">Check-in (Earliest)</option>
          <option value="checkIn-desc">Check-in (Latest)</option>
          <option value="totalAmount-desc">Price (High-Low)</option>
          <option value="totalAmount-asc">Price (Low-High)</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking ID</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check In/Out</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading && !isLiveMode ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading bookings...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No bookings found.</td></tr>
              ) : (
                bookings.map((booking) => {
                  const isNew = new Date(booking.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                  return (
                    <tr key={booking.id} className={`transition-colors group ${isNew ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                            #{booking.id.slice(-6).toUpperCase()}
                          </span>
                          {isNew && <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">NEW</span>}
                          {booking.source === 'OTA' && (
                            <span className="bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" title={booking.otaReferenceId ? `OTA Ref: ${booking.otaReferenceId}` : ''}>
                              {booking.channelName || 'OTA'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(booking.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{booking.leadName}</span>
                          <span className="text-xs text-slate-500">{booking.leadEmail}</span>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1 text-slate-500 text-xs" title="Adults">
                              <User size={12} /> {booking.guestsAdult}
                            </div>
                            {booking.guestsChild > 0 && (
                              <div className="flex items-center gap-1 text-slate-500 text-xs" title="Children">
                                <span className="text-[10px] font-bold">C</span> {booking.guestsChild}
                              </div>
                            )}
                          </div>
                          {booking.specialRequests && <span className="flex items-center gap-1 text-[10px] text-amber-600 mt-1 truncate max-w-[150px]"><MessageSquare size={10} /> {booking.specialRequests}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300">
                        {booking.roomType?.name || 'Unknown Type'}
                        {booking.room && <span className="ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">#{booking.room.id.slice(-4)}</span>}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex flex-col text-xs">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">In: {formatDate(booking.checkIn)}</span>
                          <span className="text-rose-600 dark:text-rose-400 font-medium">Out: {formatDate(booking.checkOut)}</span>
                          <span className="text-slate-400 mt-0.5">{Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} nights</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-bold text-slate-900 dark:text-white">฿{booking.totalAmount?.toLocaleString()}</div>
                        <div className={`text-[10px] font-bold px-1.5 py-0.5 inline-flex rounded mt-1 border ${booking.payment?.status === 'authorized' || booking.payment?.status === 'captured'
                          ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                          : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                          }`}>
                          {booking.payment?.status === 'authorized' || booking.payment?.status === 'captured' ? 'PAID' : 'UNPAID'}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === 'confirmed' && new Date() >= new Date(booking.checkIn) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'checked_in'); }}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded shadow hover:bg-blue-700 transition-colors"
                              title="Quick Check In"
                            >
                              Check In
                            </button>
                          )}
                          {booking.status === 'checked_in' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'checked_out'); }}
                              className="px-2 py-1 bg-slate-600 text-white text-xs rounded shadow hover:bg-slate-700 transition-colors"
                              title="Quick Check Out"
                            >
                              Check Out
                            </button>
                          )}
                          <button
                            onClick={() => openDetails(booking)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.page === 1}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-bold disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">Page {meta.page}</span>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={meta.page === meta.last_page}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-bold disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isDetailOpen && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setIsDetailOpen(false)}
          onUpdateStatus={updateStatus}
        />
      )}

      {showCreateModal && <CreateBookingModal onClose={() => setShowCreateModal(false)} onSuccess={fetchBookings} />}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
      />
    </AdminLayout>
  )
}


