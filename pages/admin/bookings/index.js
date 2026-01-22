import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, Calendar, User, Mail, Phone, CreditCard, CheckCircle, XCircle, Clock, Eye, MoreHorizontal, Settings, Plus } from 'lucide-react'

export default function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBookings()
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (searchTerm) query.append('search', searchTerm)
      if (statusFilter !== 'All') query.append('status', statusFilter)

      const data = await apiFetch(`/bookings/admin/all?${query.toString()}`)
      setBookings(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, newStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return
    try {
      await apiFetch(`/bookings/admin/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchBookings()
      setIsDetailOpen(false)
    } catch (error) {
      alert('Update failed')
    }
  }

  const openDetails = (booking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
      case 'cancelled': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
      case 'checked_in': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB')

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Booking</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage all reservations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Booking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Pending', 'Confirmed', 'Cancelled', 'Checked_in'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === status
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-slate-900/10'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search guest or ID..."
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
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Check In/Out</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading bookings...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No bookings found.</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm text-slate-500 dark:text-slate-400">#{booking.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{booking.leadName}</span>
                        <span className="text-xs text-slate-500">{booking.leadEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {booking.roomType?.name || 'Unknown Type'}
                      {booking.room && <span className="ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">#{booking.room.id.slice(-4)}</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex flex-col text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400">In: {formatDate(booking.checkIn)}</span>
                        <span className="text-rose-600 dark:text-rose-400">Out: {formatDate(booking.checkOut)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">฿{booking.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetails(booking)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Booking Details
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </h3>
                <p className="text-sm text-slate-500">ID: #{selectedBooking.id}</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-8">
              {/* Guest Info */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={16} /> Guest Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold">
                      {selectedBooking.leadName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedBooking.leadName}</p>
                      <p className="text-sm text-slate-500">2 Adults, 0 Children</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Mail size={16} className="text-slate-400" /> {selectedBooking.leadEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Phone size={16} className="text-slate-400" /> {selectedBooking.leadPhone || 'No Phone'}
                  </div>
                </div>
              </div>

              {/* Stay Info */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Calendar size={16} /> Stay Details</h4>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span className="font-bold">{formatDate(selectedBooking.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span className="font-bold">{formatDate(selectedBooking.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room Type:</span>
                    <span className="font-bold">{selectedBooking.roomType?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room Number:</span>
                    <span className="font-bold">{selectedBooking.room?.id ? `#${selectedBooking.room.id.slice(-4)}` : 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-700 pt-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><CreditCard size={16} /> Payment Summary</h4>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-2xl font-bold text-emerald-600">฿{selectedBooking.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Status</p>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold dark:bg-emerald-500/20 dark:text-emerald-400">Paid by Credit Card</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-3 justify-end">
              {selectedBooking.status === 'pending' && (
                <button
                  onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                  Confirm Booking
                </button>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={() => updateStatus(selectedBooking.id, 'checked_in')}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                >
                  Check In
                </button>
              )}
              {selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                  className="px-6 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-300 dark:bg-slate-700 dark:border-slate-600 dark:text-rose-400"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && <CreateBookingModal onClose={() => setShowCreateModal(false)} onSuccess={fetchBookings} />}
    </AdminLayout>
  )
}

function CreateBookingModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [form, setForm] = useState({
    checkIn: '',
    checkOut: '',
    roomTypeId: '',
    ratePlanId: '',
    roomId: '',
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    totalAmount: 0,
    hotelId: 'cmkms2e6m000110p913ga7fon' // Default to first (or fetch from user context)
  })

  useEffect(() => {
    apiFetch('/room-types').then(setData).catch(console.error)
  }, [])

  const selectedType = data.find(t => t.id === form.roomTypeId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!selectedType) throw new Error("Please select a room type")

      await apiFetch('/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          hotelId: selectedType.hotelId,
          guests: { adult: 2, child: 0 },
          leadGuest: {
            name: form.leadName,
            email: form.leadEmail,
            phone: form.leadPhone
          },
          totalAmount: Number(form.totalAmount)
        })
      })
      onSuccess()
      onClose()
      alert('Booking created successfully!')
    } catch (error) {
      alert('Failed to create booking: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Create New Booking</h2>
          <button onClick={onClose}><XCircle className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Guest Name</label>
              <input required type="text" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onChange={e => setForm({ ...form, leadName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input required type="email" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onChange={e => setForm({ ...form, leadEmail: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input type="text" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onChange={e => setForm({ ...form, leadPhone: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Check In</label>
              <input required type="date" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onChange={e => setForm({ ...form, checkIn: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Check Out</label>
              <input required type="date" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onChange={e => setForm({ ...form, checkOut: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Room Type</label>
              <select required className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onChange={e => setForm({ ...form, roomTypeId: e.target.value })}>
                <option value="">Select Type</option>
                {data.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
              <select required className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                disabled={!selectedType}
                onChange={e => setForm({ ...form, roomId: e.target.value })}>
                <option value="">Select Room</option>
                {selectedType?.rooms?.map(r => <option key={r.id} value={r.id}>Room {r.id.slice(-4)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Rate Plan</label>
              <select required className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                disabled={!selectedType}
                onChange={e => setForm({ ...form, ratePlanId: e.target.value })}>
                <option value="">Select Rate Plan</option>
                {selectedType?.ratePlans?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Total Amount</label>
              <input required type="number" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                value={form.totalAmount}
                onChange={e => setForm({ ...form, totalAmount: e.target.value })} />
            </div>
          </div>

          <button disabled={loading} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg mt-4">
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
        </form>
      </div>
    </div>
  )
}
