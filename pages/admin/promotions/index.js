import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { TicketPercent, Plus, Trash2, Calendar, Pencil } from 'lucide-react'
import ConfirmationModal from '@/components/ConfirmationModal'
import toast from 'react-hot-toast'
import DatePicker from '@/components/DatePicker'

import { useAdmin } from '@/contexts/AdminContext'

export default function Promotions() {
    const { currentHotel } = useAdmin() || {}
    const [promotions, setPromotions] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null })
    const [form, setForm] = useState({
        code: '', type: 'percent', value: '', startDate: '', endDate: '', conditions: ''
    })

    useEffect(() => {
        fetchPromotions()
    }, [currentHotel?.id])

    const fetchPromotions = async () => {
        try {
            const hotelId = currentHotel?.id;
            if (!hotelId) return;

            const data = await apiFetch(`/promotions?hotelId=${hotelId}`)
            setPromotions(data)
        } catch (e) {
            console.error(e)
        }
    }

    const handleDelete = async () => {
        if (!confirmDelete.id) return
        try {
            await apiFetch(`/promotions/${confirmDelete.id}`, { method: 'DELETE' })
            toast.success('Promotion deleted')
            fetchPromotions()
        } catch (e) { toast.error('Failed to delete') }
    }

    const handleEdit = (promo) => {
        setEditingId(promo.id)
        setForm({
            code: promo.code,
            type: promo.type,
            value: promo.value,
            startDate: new Date(promo.startDate).toISOString().split('T')[0],
            endDate: new Date(promo.endDate).toISOString().split('T')[0],
            conditions: promo.conditions || ''
        })
        setIsModalOpen(true)
    }

    const openCreateModal = () => {
        setEditingId(null)
        setForm({ code: '', type: 'percent', value: '', startDate: '', endDate: '', conditions: '' })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                hotelId: currentHotel?.id,
                code: form.code.toUpperCase(),
                type: form.type,
                value: Number(form.value),
                startDate: new Date(form.startDate),
                endDate: new Date(form.endDate),
                conditions: form.conditions
            }

            if (editingId) {
                await apiFetch(`/promotions/${editingId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                })
                toast.success('Promotion updated')
            } else {
                await apiFetch('/promotions', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
                toast.success('Promotion created')
            }

            setIsModalOpen(false)
            fetchPromotions()
            setForm({ code: '', type: 'percent', value: '', startDate: '', endDate: '', conditions: '' })
            setEditingId(null)
        } catch (e) {
            toast.error(editingId ? 'Failed to update' : 'Failed to create. Code might exist.')
        }
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    {/* ... title ... */}
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <TicketPercent size={24} className="text-emerald-500" />
                        Promotions
                    </h1>
                    <p className="text-slate-500 text-sm">Manage discount codes and campaigns</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={16} /> New Code
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700 p-6">
                <div className="grid gap-4">
                    {/* ... empty state ... */}
                    {promotions.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <TicketPercent size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No active promotions.</p>
                            <p className="text-xs mt-1">Create a code like 'WELCOME10' to get started.</p>
                        </div>
                    )}

                    {promotions.map(promo => (
                        <div key={promo.id} className="flex flex-col md:flex-row justify-between items-center p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            {/* ... promo details ... */}
                            <div className="flex items-center gap-4 mb-2 md:mb-0">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                                    %
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg text-slate-900 dark:text-white">{promo.code}</span>
                                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 uppercase">{promo.type}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm">
                                        Discount: <span className="font-bold text-emerald-500">{promo.value} {promo.type === 'percent' ? '%' : 'THB'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Calendar size={12} /> Valid Until
                                    </div>
                                    <p className="text-sm font-medium dark:text-slate-300">
                                        {new Date(promo.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(promo)}
                                        className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete({ isOpen: true, id: promo.id })}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-[450px] shadow-2xl border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                            <TicketPercent size={20} className="text-emerald-500" /> {editingId ? 'Edit Promotion' : 'New Promotion'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* ... form fields ... */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Promo Code</label>
                                <input
                                    value={form.code}
                                    onChange={e => setForm({ ...form, code: e.target.value })}
                                    required placeholder="e.g. SUMMER2024"
                                    className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                        className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="percent">Percent (%)</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Value</label>
                                    <input
                                        value={form.value}
                                        onChange={e => setForm({ ...form, value: e.target.value })}
                                        type="number" required placeholder="e.g. 10"
                                        className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                    <DatePicker
                                        value={form.startDate}
                                        onChange={([date]) => setForm({ ...form, startDate: date ? date.toISOString().split('T')[0] : '' })}
                                        options={{ minDate: "today" }}
                                        className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        wrapperClassName="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                                    <DatePicker
                                        value={form.endDate}
                                        onChange={([date]) => setForm({ ...form, endDate: date ? date.toISOString().split('T')[0] : '' })}
                                        options={{ minDate: form.startDate || "today" }}
                                        className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (Optional)</label>
                                <textarea
                                    value={form.conditions}
                                    onChange={e => setForm({ ...form, conditions: e.target.value })}
                                    rows="2"
                                    className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                                    placeholder="Any special conditions..."
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">{editingId ? 'Save Changes' : 'Create Code'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={handleDelete}
                title="Delete Promotion?"
                message="This will deactivate the code immediately."
                type="danger"
            />
        </AdminLayout>
    )
}
