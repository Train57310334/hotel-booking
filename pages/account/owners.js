import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { Plus, Search, Edit, Trash2, Eye, X, Save, User, Mail, Phone, Building2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OwnerManagement() {
    const [owners, setOwners] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null) // owner object
    const [selectedOwner, setSelectedOwner] = useState(null)
    const [saving, setSaving] = useState(false)

    // Form state
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' })

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery), 400)
        return () => clearTimeout(t)
    }, [searchQuery])

    const fetchOwners = useCallback(async () => {
        setLoading(true)
        try {
            const query = debouncedQuery ? `?search=${encodeURIComponent(debouncedQuery)}` : ''
            const data = await apiFetch(`/owners${query}`)
            setOwners(Array.isArray(data) ? data : [])
        } catch (err) {
            toast.error('Failed to load owners')
        } finally {
            setLoading(false)
        }
    }, [debouncedQuery])

    useEffect(() => { fetchOwners() }, [fetchOwners])

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.email) return toast.error('Name and email are required')
        setSaving(true)
        try {
            await apiFetch('/owners', {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            toast.success('Owner added successfully!')
            setShowAddModal(false)
            setFormData({ name: '', email: '', phone: '', password: '' })
            fetchOwners()
        } catch (err) {
            toast.error(err.message || 'Failed to add owner')
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault()
        if (!selectedOwner) return
        setSaving(true)
        try {
            await apiFetch(`/owners/${selectedOwner.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: formData.name, phone: formData.phone })
            })
            toast.success('Owner updated!')
            setShowEditModal(false)
            setSelectedOwner(null)
            fetchOwners()
        } catch (err) {
            toast.error(err.message || 'Failed to update owner')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!showDeleteConfirm) return
        try {
            await apiFetch(`/owners/${showDeleteConfirm.id}`, { method: 'DELETE' })
            toast.success('Owner removed')
            setShowDeleteConfirm(null)
            fetchOwners()
        } catch (err) {
            toast.error(err.message || 'Failed to delete owner')
        }
    }

    const openEdit = (owner) => {
        setSelectedOwner(owner)
        setFormData({ name: owner.name || '', email: owner.email || '', phone: owner.phone || '', password: '' })
        setShowEditModal(true)
    }

    const getRoleLabel = (roles = []) => {
        if (roles.includes('super_admin')) return 'Super Admin'
        if (roles.includes('hotel_admin')) return 'Hotel Admin'
        if (roles.includes('staff')) return 'Staff'
        return roles[0] || 'User'
    }

    const getStatusColor = (isActive) =>
        isActive !== false
            ? 'bg-teal-50 text-teal-700 border border-teal-200'
            : 'bg-slate-100 text-slate-500 border border-slate-200'

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Owner Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage hotel owners and admin accounts</p>
                </div>
                <button
                    onClick={() => { setFormData({ name: '', email: '', phone: '', password: '' }); setShowAddModal(true) }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                    <Plus size={18} /> Add New Owner
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 w-full md:w-96">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full text-sm outline-none placeholder:text-slate-400 text-slate-700"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Owner Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Mobile Number</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Hotels</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-400">
                                        <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                                        Loading owners...
                                    </td>
                                </tr>
                            ) : owners.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-400">
                                        <User size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No owners found</p>
                                        {searchQuery && <p className="text-sm">Try a different search term</p>}
                                    </td>
                                </tr>
                            ) : (
                                owners.map((owner) => (
                                    <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                                                    {(owner.name || owner.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-semibold text-slate-900 block">{owner.name || '—'}</span>
                                                    <span className="text-xs text-slate-400">
                                                        Since {new Date(owner.createdAt).getFullYear()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{owner.phone || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{owner.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                {getRoleLabel(owner.roles)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                                <Building2 size={14} className="text-slate-400" />
                                                {owner.hotelCount ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(owner)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(owner)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {!loading && owners.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
                        {owners.length} owner{owners.length !== 1 ? 's' : ''} found
                    </div>
                )}
            </div>

            {/* ── Add Owner Modal ── */}
            {showAddModal && (
                <OwnerModal
                    title="Add New Owner"
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleAdd}
                    onClose={() => setShowAddModal(false)}
                    saving={saving}
                    showPassword
                />
            )}

            {/* ── Edit Owner Modal ── */}
            {showEditModal && selectedOwner && (
                <OwnerModal
                    title={`Edit: ${selectedOwner.name}`}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleEdit}
                    onClose={() => { setShowEditModal(false); setSelectedOwner(null) }}
                    saving={saving}
                />
            )}

            {/* ── Delete Confirm Modal ── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-[380px] shadow-2xl border border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Delete Owner?</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            Are you sure you want to remove <strong>{showDeleteConfirm.name || showDeleteConfirm.email}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

function OwnerModal({ title, formData, setFormData, onSubmit, onClose, saving, showPassword = false }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-[440px] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Full Name *</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. John Smith"
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                            />
                        </div>
                    </div>

                    {showPassword && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Email *</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                    placeholder="owner@hotel.com"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                placeholder="e.g. 081-234-5678"
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                            />
                        </div>
                    </div>

                    {showPassword && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                                Password <span className="text-slate-400 font-normal normal-case">(leave blank for default: 123456)</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                                placeholder="Min 6 characters"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
