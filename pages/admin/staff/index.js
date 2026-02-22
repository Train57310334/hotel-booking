import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, Plus, User, Mail, Phone, Edit, Trash2, CheckCircle, XCircle, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

import { useAdmin } from '@/contexts/AdminContext'
import ConfirmationModal from '@/components/ConfirmationModal'

export default function StaffManagement() {
  const { currentHotel } = useAdmin() || {};
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'reception' })

  useEffect(() => {
    if (currentHotel) fetchStaff()
  }, [searchTerm, currentHotel])

  const fetchStaff = async () => {
    if (!currentHotel) return;
    try {
      const data = await apiFetch(`/staff?hotelId=${currentHotel.id}`) // Uses new endpoint with hotelId
      setStaff(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentHotel) return;

    try {
      if (editUser) {
        // Update Role Only (Password/Profile handled by User)
        await apiFetch(`/staff/${editUser.id}?hotelId=${currentHotel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: formData.role, hotelId: currentHotel.id })
        })
      } else {
        await apiFetch(`/staff?hotelId=${currentHotel.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, hotelId: currentHotel.id })
        })
      }
      setIsModalOpen(false)
      setEditUser(null)
      setFormData({ name: '', email: '', phone: '', password: '', role: 'reception' })
      fetchStaff()
    } catch (error) {
      toast.error('Operation failed: ' + error.message)
    }
  }

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => { }
  })

  const handleDelete = (id) => {
    if (!currentHotel) return;
    setConfirmModal({
      isOpen: true,
      title: 'Remove Staff',
      message: 'Are you sure you want to remove this staff member? They will lose access to this hotel.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await apiFetch(`/staff/${id}?hotelId=${currentHotel.id}`, { method: 'DELETE' })
          fetchStaff()
        } catch (e) { toast.error('Delete failed') }
      }
    })
  }

  const openCreateModal = () => {
    setEditUser(null)
    setFormData({ name: '', email: '', phone: '', password: '', role: 'reception' })
    setIsModalOpen(true)
  }

  const openEditModal = (user) => {
    setEditUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role || 'reception'
    })
    setIsModalOpen(true)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Staff Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage hotel staff and their permissions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search staff by name or email..."
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
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No staff found.</td></tr>
              ) : (
                staff.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20 ${user.avatarUrl ? 'bg-white' : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold'}`}>
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{user.name || 'Unnamed'}</div>
                          <div className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Mail size={14} className="text-slate-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Phone size={14} className="text-slate-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                        ${user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'manager' ? 'bg-orange-100 text-orange-800' :
                              'bg-emerald-100 text-emerald-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={14} /> Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(user)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editUser ? 'Edit Staff Member' : 'Add New Staff'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required={!editUser}
                    disabled={!!editUser} // Cannot change name here if editing (optional)
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    disabled={!!editUser} // Email is identity
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Role Permission</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                  >
                    <option value="reception">Reception (Front Desk)</option>
                    <option value="housekeeper">Housekeeper</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-1">
                  {formData.role === 'reception' && 'Can manage bookings, guests, and rooms.'}
                  {formData.role === 'housekeeper' && 'Can manage room status and cleaning tasks.'}
                  {formData.role === 'manager' && 'Full access except system settings.'}
                  {formData.role === 'admin' && 'Full access to everything.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="+66 81 234 5678"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {!editUser && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  {editUser ? 'Save Changes' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
