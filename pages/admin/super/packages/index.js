import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Package, Plus, Pencil, Trash2, Check, X, ShieldAlert, Rocket, Zap, Crown } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import toast from 'react-hot-toast'
import Head from 'next/head'
import ConfirmationModal from '@/components/ConfirmationModal'

const availableIcons = [
    { name: 'Package', component: Package },
    { name: 'Rocket', component: Rocket },
    { name: 'Zap', component: Zap },
    { name: 'Crown', component: Crown },
]

const availableColors = ['slate', 'emerald', 'indigo', 'rose', 'amber', 'purple', 'blue']

export default function PlatformPackages() {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentPlan, setCurrentPlan] = useState(null)
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })

    useEffect(() => {
        loadPlans()
    }, [])

    const loadPlans = async () => {
        try {
            const data = await apiFetch('/subscriptions/plans')
            setPlans(data || [])
        } catch (error) {
            console.error('Failed to load plans:', error)
            toast.error('Failed to load platform packages')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setCurrentPlan({
            name: '',
            price: 0,
            priceLabel: 'Free',
            period: '/month',
            description: '',
            features: [],
            missingFeatures: [],
            isPopular: false,
            color: 'emerald',
            icon: 'Package',
            maxRooms: 5,
            maxRoomTypes: 2,
            maxStaff: 1,
            hasPromotions: false,
            hasOnlinePayment: false
        })
        setIsEditing(true)
    }

    const handleEdit = (plan) => {
        setCurrentPlan({ ...plan })
        setIsEditing(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            if (currentPlan.id) {
                await apiFetch(`/subscriptions/plans/${currentPlan.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(currentPlan)
                })
                toast.success('Package updated successfully')
            } else {
                await apiFetch('/subscriptions/plans', {
                    method: 'POST',
                    body: JSON.stringify(currentPlan)
                })
                toast.success('Package created successfully')
            }
            setIsEditing(false)
            loadPlans()
        } catch (error) {
            console.error('Save failed:', error)
            toast.error(error.message || 'Failed to save package')
        }
    }

    const handleDelete = async () => {
        try {
            await apiFetch(`/subscriptions/plans/${deleteModal.id}`, {
                method: 'DELETE'
            })
            toast.success('Package deleted')
            setDeleteModal({ isOpen: false, id: null })
            loadPlans()
        } catch (error) {
            console.error('Delete failed:', error)
            toast.error(error.message || 'Failed to delete package')
        }
    }

    const handleArrayChange = (field, index, value) => {
        const newArray = [...currentPlan[field]]
        newArray[index] = value
        setCurrentPlan({ ...currentPlan, [field]: newArray })
    }

    const addArrayItem = (field) => {
        setCurrentPlan({ ...currentPlan, [field]: [...currentPlan[field], ''] })
    }

    const removeArrayItem = (field, index) => {
        const newArray = currentPlan[field].filter((_, i) => i !== index)
        setCurrentPlan({ ...currentPlan, [field]: newArray })
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
                </div>
            </AdminLayout>
        )
    }

    if (isEditing && currentPlan) {
        return (
            <AdminLayout>
                <Head>
                    <title>{currentPlan.id ? 'Edit Package' : 'New Package'} | Super Admin</title>
                </Head>
                <div className="max-w-4xl mx-auto space-y-6 pb-20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                                {currentPlan.id ? 'Edit Package' : 'Create Package'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">Configure package limits and frontend display settings</p>
                        </div>
                        <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700">Cancel</button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Display Information */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                            <h2 className="text-lg font-bold border-b pb-2">Frontend Display Data</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Identifier Name (e.g. PRO)</label>
                                    <input required type="text" value={currentPlan.name} onChange={e => setCurrentPlan({ ...currentPlan, name: e.target.value.toUpperCase() })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                                    <input required type="text" value={currentPlan.description} onChange={e => setCurrentPlan({ ...currentPlan, description: e.target.value })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Price (Numeric value in THB)</label>
                                    <input required type="number" value={currentPlan.price} onChange={e => setCurrentPlan({ ...currentPlan, price: parseFloat(e.target.value) })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Price Label (e.g. ฿1,500)</label>
                                    <input required type="text" value={currentPlan.priceLabel} onChange={e => setCurrentPlan({ ...currentPlan, priceLabel: e.target.value })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Period (e.g. /month, Forever)</label>
                                    <input type="text" value={currentPlan.period} onChange={e => setCurrentPlan({ ...currentPlan, period: e.target.value })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Color Theme</label>
                                    <select value={currentPlan.color} onChange={e => setCurrentPlan({ ...currentPlan, color: e.target.value })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Icon</label>
                                    <select value={currentPlan.icon} onChange={e => setCurrentPlan({ ...currentPlan, icon: e.target.value })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                        {availableIcons.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-8">
                                    <input type="checkbox" id="isPopular" checked={currentPlan.isPopular} onChange={e => setCurrentPlan({ ...currentPlan, isPopular: e.target.checked })} />
                                    <label htmlFor="isPopular" className="text-sm font-bold">Highlight as "Most Popular"</label>
                                </div>
                            </div>
                        </div>

                        {/* System Limits */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                            <h2 className="text-lg font-bold border-b pb-2">System Application Limits</h2>
                            <p className="text-xs text-slate-500 mb-4">Set exact numbers. Use 9999 for "Unlimited".</p>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Max Physical Rooms</label>
                                    <input type="number" value={currentPlan.maxRooms} onChange={e => setCurrentPlan({ ...currentPlan, maxRooms: parseInt(e.target.value) })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Max Room Types</label>
                                    <input type="number" value={currentPlan.maxRoomTypes} onChange={e => setCurrentPlan({ ...currentPlan, maxRoomTypes: parseInt(e.target.value) })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700">Max Staff Accounts</label>
                                    <input type="number" value={currentPlan.maxStaff} onChange={e => setCurrentPlan({ ...currentPlan, maxStaff: parseInt(e.target.value) })} className="w-full mt-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                            </div>
                            <div className="flex gap-6 mt-4">
                                <label className="flex items-center gap-2 font-bold cursor-pointer">
                                    <input type="checkbox" checked={currentPlan.hasPromotions} onChange={e => setCurrentPlan({ ...currentPlan, hasPromotions: e.target.checked })} />
                                    Unlock Discount/Promotions feature
                                </label>
                                <label className="flex items-center gap-2 font-bold cursor-pointer">
                                    <input type="checkbox" checked={currentPlan.hasOnlinePayment} onChange={e => setCurrentPlan({ ...currentPlan, hasOnlinePayment: e.target.checked })} />
                                    Unlock Online Payments (Stripe/Omise)
                                </label>
                            </div>
                        </div>

                        {/* Feature Lists */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h2 className="text-lg font-bold">Included Features</h2>
                                    <button type="button" onClick={() => addArrayItem('features')} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded"><Plus size={16} /></button>
                                </div>
                                {currentPlan.features.map((feat, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input type="text" value={feat} onChange={e => handleArrayChange('features', i, e.target.value)} className="flex-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                        <button type="button" onClick={() => removeArrayItem('features', i)} className="text-red-400 p-2"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h2 className="text-lg font-bold text-slate-500">Missing Features</h2>
                                    <button type="button" onClick={() => addArrayItem('missingFeatures')} className="text-slate-500 hover:bg-slate-50 p-1 rounded"><Plus size={16} /></button>
                                </div>
                                {currentPlan.missingFeatures.map((feat, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input type="text" value={feat} onChange={e => handleArrayChange('missingFeatures', i, e.target.value)} className="flex-1 p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                        <button type="button" onClick={() => removeArrayItem('missingFeatures', i)} className="text-red-400 p-2"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg rounded-xl">Save Package</button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <Head>
                <title>Platform Packages | Super Admin</title>
            </Head>

            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                            <Package size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Platform Packages</h1>
                            <p className="text-slate-500 dark:text-slate-400">Manage SAAS subscription tiers and limits</p>
                        </div>
                    </div>
                    <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center gap-2">
                        <Plus size={18} /> New Package
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const Icon = availableIcons.find(icon => icon.name === plan.icon)?.component || Package
                        return (
                            <div key={plan.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm p-6 relative">
                                {plan.isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">POPULAR</div>}

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`flex items-center gap-2 font-bold text-${plan.color}-600`}>
                                        <Icon size={20} />
                                        {plan.name}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(plan)} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded"><Pencil size={16} /></button>
                                        <button onClick={() => setDeleteModal({ isOpen: true, id: plan.id })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.priceLabel}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 mb-6 border-t pt-4">
                                    <div className="flex justify-between"><span>Max Rooms:</span> <strong>{plan.maxRooms === 9999 ? 'Unlimited' : plan.maxRooms}</strong></div>
                                    <div className="flex justify-between"><span>Staff Accts:</span> <strong>{plan.maxStaff === 9999 ? 'Unlimited' : plan.maxStaff}</strong></div>
                                    <div className="flex justify-between"><span>Room Types:</span> <strong>{plan.maxRoomTypes === 9999 ? 'Unlimited' : plan.maxRoomTypes}</strong></div>
                                    <div className="flex justify-between text-xs mt-2">
                                        <span className={plan.hasOnlinePayment ? 'text-emerald-500 font-bold' : 'text-slate-400'}>Online Payments</span>
                                        <span className={plan.hasPromotions ? 'text-emerald-500 font-bold' : 'text-slate-400'}>Promotions</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Package"
                message="Are you sure you want to delete this subscription plan? Existing hotels on this plan may behave unpredictably."
                type="danger"
                confirmText="Delete Package"
            />
        </AdminLayout>
    )
}
