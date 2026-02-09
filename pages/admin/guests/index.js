import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, User, Mail, Phone, Calendar, MapPin, ExternalLink, Clock } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'
import { useRouter } from 'next/router'

export default function GuestManagement() {
  const router = useRouter()
  const { searchQuery, currentHotel } = useAdmin() || { searchQuery: '' }

  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentHotel) fetchGuests()
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, currentHotel])

  const fetchGuests = async () => {
    if (!currentHotel) return;
    setLoading(true)
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (currentHotel.id) queryParams.append('hotelId', currentHotel.id);

      const data = await apiFetch(`/users?${queryParams.toString()}`)
      setGuests(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB')

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Guest Management</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage registered guests</p>
        </div>
      </div>

      {/* Search is now global in AdminLayout */}
      {searchQuery && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
          <Search size={18} />
          <span>Showing results for: <strong>{searchQuery}</strong></span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Guest Profile</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading guests...</td></tr>
              ) : guests.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No guests found.</td></tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                          {guest.name ? guest.name[0].toUpperCase() : <User size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{guest.name || 'Unknown Guest'}</p>
                          <p className="text-xs text-slate-400">ID: {guest.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {guest.email}</span>
                        {guest.phone && <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {guest.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300">
                        <Calendar size={14} />
                        {guest._count?.bookings || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {guest.bookings && guest.bookings.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {formatDate(guest.bookings[0].createdAt)}
                        </div>
                      ) : (
                        'New User'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/guests/${guest.id}`)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="View Guest Profile"
                      >
                        <ExternalLink size={18} />
                      </button>
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
