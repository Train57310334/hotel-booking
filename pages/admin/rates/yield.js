import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { useAdmin } from '@/contexts/AdminContext'
import { Plus, Trash2, Power, PowerOff, TrendingUp, TrendingDown, Clock, Users, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmationModal from '@/components/ConfirmationModal'

export default function YieldManagement() {
    const { currentHotel } = useAdmin() || {}
    const [loading, setLoading] = useState(true)
    const [rules, setRules] = useState([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null })

    const [newRule, setNewRule] = useState({
        name: '',
        triggerType: 'OCCUPANCY',
        conditionOp: 'GREATER_THAN',
        conditionValue: 80,
        adjustmentType: 'PERCENTAGE',
        adjustmentOp: 'INCREASE',
        adjustmentValue: 10
    })

    useEffect(() => {
        if (currentHotel) {
            fetchRules()
        }
    }, [currentHotel?.id])

    const fetchRules = async () => {
        setLoading(true)
        try {
            const data = await apiFetch(`/yield/rules?hotelId=${currentHotel.id}`)
            setRules(data || [])
        } catch (error) {
            console.error(error)
            toast.error('Failed to load yield rules')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateRule = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await apiFetch('/yield/rules', {
                method: 'POST',
                body: JSON.stringify({
                    hotelId: currentHotel.id,
                    name: newRule.name,
                    triggerType: newRule.triggerType,
                    conditionOp: newRule.conditionOp,
                    conditionValue: Number(newRule.conditionValue),
                    adjustmentType: newRule.adjustmentType,
                    adjustmentOp: newRule.adjustmentOp,
                    adjustmentValue: Number(newRule.adjustmentValue)
                })
            })
            toast.success('Yield rule created!')
            setIsAddModalOpen(false)
            fetchRules()
            // Reset form
            setNewRule({
                name: '', triggerType: 'OCCUPANCY', conditionOp: 'GREATER_THAN', conditionValue: 80,
                adjustmentType: 'PERCENTAGE', adjustmentOp: 'INCREASE', adjustmentValue: 10
            })
        } catch (error) {
            toast.error('Failed to create rule')
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await apiFetch(`/yield/rules/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !currentStatus })
            })
            toast.success(`Rule ${!currentStatus ? 'activated' : 'deactivated'}`)
            setRules(rules.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r))
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const handleDelete = async () => {
        try {
            await apiFetch(`/yield/rules/${confirmDelete.id}`, { method: 'DELETE' })
            toast.success('Rule deleted')
            fetchRules()
        } catch (error) {
            toast.error('Failed to delete rule')
        } finally {
            setConfirmDelete({ isOpen: false, id: null })
        }
    }

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Yield Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Automate dynamic pricing based on occupancy and lead time</p>
                </div>
                
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={18} /> New Rule
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rules.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                            <TrendingUp size={48} className="mx-auto mb-4 text-slate-300" />
                            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-1">No Yield Rules yet</h3>
                            <p className="text-sm">Create your first dynamic pricing rule to maximize revenue.</p>
                        </div>
                    ) : (
                        rules.map(rule => (
                            <div key={rule.id} className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all shadow-sm overflow-hidden ${rule.isActive ? 'border-slate-200 dark:border-slate-700 hover:border-blue-400' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            {rule.triggerType === 'OCCUPANCY' ? <Users size={18} className="text-blue-500"/> : <Clock size={18} className="text-amber-500"/>}
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{rule.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleToggleActive(rule.id, rule.isActive)}
                                                className={`p-1.5 rounded-lg transition-colors ${rule.isActive ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
                                                title={rule.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {rule.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">When</span>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                {rule.triggerType === 'OCCUPANCY' ? 'Occupancy is ' : 'Days to arrival is '}
                                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                                    {rule.conditionOp === 'GREATER_THAN' ? '> ' : '< '}
                                                    {rule.conditionValue}{rule.triggerType === 'OCCUPANCY' ? '%' : ' days'}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="flex justify-center text-slate-300">
                                            <TrendingUp size={16} />
                                        </div>

                                        <div className={`p-3 rounded-xl ${rule.adjustmentOp === 'INCREASE' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                                            <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-60">Then</span>
                                            <p className={`text-sm font-bold ${rule.adjustmentOp === 'INCREASE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {rule.adjustmentOp === 'INCREASE' ? 'Increase' : 'Decrease'} base rate by {rule.adjustmentValue}{rule.adjustmentType === 'PERCENTAGE' ? '%' : ' THB'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                    <button 
                                        onClick={() => setConfirmDelete({ isOpen: true, id: rule.id })}
                                        className="text-sm font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1"
                                    >
                                        <Trash2 size={14} /> Delete Rule
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Rule Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative">
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">×</button>
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create Yield Rule</h2>
                        
                        <form onSubmit={handleCreateRule} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rule Name</label>
                                <input 
                                    type="text" required 
                                    value={newRule.name}
                                    onChange={e => setNewRule({...newRule, name: e.target.value})}
                                    placeholder="e.g. Weekend Last Minute Surge"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2"><Clock size={16}/> CONDITION (WHEN)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <select 
                                        value={newRule.triggerType}
                                        onChange={e => setNewRule({...newRule, triggerType: e.target.value})}
                                        className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                                    >
                                        <option value="OCCUPANCY">Occupancy</option>
                                        <option value="DAYS_TO_ARRIVAL">Days to Arrival</option>
                                    </select>
                                    
                                    <select 
                                        value={newRule.conditionOp}
                                        onChange={e => setNewRule({...newRule, conditionOp: e.target.value})}
                                        className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                                    >
                                        <option value="GREATER_THAN">Is Greater Than</option>
                                        <option value="LESS_THAN">Is Less Than</option>
                                    </select>
                                    
                                    <div className="relative">
                                        <input 
                                            type="number" required min="0" max={newRule.triggerType === 'OCCUPANCY' ? 100 : 365}
                                            value={newRule.conditionValue}
                                            onChange={e => setNewRule({...newRule, conditionValue: e.target.value})}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                            {newRule.triggerType === 'OCCUPANCY' ? '%' : 'days'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2"><TrendingUp size={16}/> ACTION (THEN)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <select 
                                        value={newRule.adjustmentOp}
                                        onChange={e => setNewRule({...newRule, adjustmentOp: e.target.value})}
                                        className="px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-600 bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold"
                                    >
                                        <option value="INCREASE">Increase Rate By</option>
                                        <option value="DECREASE">Decrease Rate By</option>
                                    </select>

                                    <div className="relative col-span-2 flex gap-3">
                                        <input 
                                            type="number" required min="0"
                                            value={newRule.adjustmentValue}
                                            onChange={e => setNewRule({...newRule, adjustmentValue: e.target.value})}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        />
                                        <select 
                                            value={newRule.adjustmentType}
                                            onChange={e => setNewRule({...newRule, adjustmentType: e.target.value})}
                                            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        >
                                            <option value="PERCENTAGE">% Percentage</option>
                                            <option value="FIXED">฿ THB (Fixed)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Create Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Yield Rule"
                message="Are you sure you want to delete this rule? Pricing will fallback to base rates immediately."
                type="danger"
                confirmText="Delete Rule"
            />
        </AdminLayout>
    )
}
