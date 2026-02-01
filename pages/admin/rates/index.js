import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import toast from 'react-hot-toast'
import { Calendar as CalendarIcon, Save, Plus, Trash2, Edit } from 'lucide-react'

export default function RatesAvailability() {
    // const { success, error } = useToast() // Removed
    const [activeTab, setActiveTab] = useState('plans') // plans | calendar
    const [roomTypes, setRoomTypes] = useState([])
    const [ratePlans, setRatePlans] = useState([])
    const [selectedType, setSelectedType] = useState('')

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [inventory, setInventory] = useState([])
    const [overrides, setOverrides] = useState([])

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        if (activeTab === 'calendar' && selectedType) {
            fetchCalendarData()
        }
    }, [activeTab, selectedType, currentMonth])

    const fetchInitialData = async () => {
        try {
            const types = await apiFetch('/room-types')
            setRoomTypes(types)
            if (types.length > 0) setSelectedType(types[0].id)

            // Assume single hotel context for now, or fetch first hotel
            // const plans = await apiFetch('/rates/plans?hotelId=...') 
            // We need hotelId. Let's grab it from the first room type for now or context
            if (types.length > 0) {
                fetchPlans(types[0].hotelId)
            }
        } catch (e) { console.error(e) }
    }

    const fetchPlans = async (hotelId) => {
        try {
            const data = await apiFetch(`/rates/plans?hotelId=${hotelId}`)
            setRatePlans(data)
        } catch (e) {
            console.error(e)
        }
    }

    const fetchCalendarData = async () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth() + 1
        const start = new Date(year, month - 1, 1).toISOString()
        const end = new Date(year, month, 0).toISOString()

        try {
            const [invData, ovData] = await Promise.all([
                apiFetch(`/inventory/${selectedType}?startDate=${start}&endDate=${end}`),
                apiFetch(`/rates/overrides?roomTypeId=${selectedType}&start=${start}&end=${end}`)
            ])
            setInventory(invData)
            setOverrides(ovData)
        } catch (e) {
            console.error(e)
            toast.error('Failed to load calendar data')
        }
    }

    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-80px)]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                            <CalendarIcon size={24} className="text-emerald-500" />
                            Rates & Availability
                        </h1>
                        <p className="text-slate-500 text-sm">Manage pricing and room allotments</p>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'plans' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Rate Plans
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Calendar View
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden p-6">
                    {activeTab === 'plans' ? (
                        <RatePlansView plans={ratePlans} roomTypes={roomTypes} refresh={() => fetchPlans(roomTypes[0]?.hotelId)} />
                    ) : (
                        <CalendarView
                            month={currentMonth}
                            setMonth={setCurrentMonth}
                            inventory={inventory}
                            overrides={overrides}
                            ratePlans={ratePlans} // Pass ratePlans
                            onRefresh={fetchCalendarData}
                            roomTypes={roomTypes}
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

import ConfirmationModal from '@/components/ConfirmationModal'

function RatePlansView({ plans, roomTypes, refresh }) {
    // const { success, error } = useToast()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null })

    const handleDeleteClick = (id) => {
        setConfirmDelete({ isOpen: true, id })
    }

    const executeDelete = async () => {
        if (!confirmDelete.id) return
        try {
            await apiFetch(`/rates/plans/${confirmDelete.id}`, { method: 'DELETE' })
            await apiFetch(`/rates/plans/${confirmDelete.id}`, { method: 'DELETE' })
            toast.success('Plan deleted')
            refresh()
        } catch (e) { toast.error('Failed to delete plan') }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = {
            hotelId: roomTypes[0]?.hotelId, // Fallback/Assumption
            roomTypeId: formData.get('roomTypeId') || null,
            name: formData.get('name'),
            cancellationRule: formData.get('cancellationRule'),
            adultPricePolicy: formData.get('adultPricePolicy'),
            includesBreakfast: formData.get('includesBreakfast') === 'on'
        }

        try {
            if (editingPlan) {
                await apiFetch(`/rates/plans/${editingPlan.id}`, { method: 'PUT', body: JSON.stringify(data) })
                toast.success('Plan updated')
            } else {
                await apiFetch('/rates/plans', { method: 'POST', body: JSON.stringify(data) })
                toast.success('Plan created')
            }
            setIsModalOpen(false)
            setEditingPlan(null)
            refresh()
        } catch (e) {
            toast.error('Failed to save plan')
        }
    }

    const openEdit = (plan) => {
        setEditingPlan(plan)
        setIsModalOpen(true)
    }

    const openNew = () => {
        setEditingPlan(null)
        setIsModalOpen(true)
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between mb-4 shrink-0">
                <h3 className="font-bold text-lg dark:text-white">Active Rate Plans</h3>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600"
                >
                    <Plus size={16} /> New Plan
                </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {plans.length === 0 && <p className="text-slate-500 text-center py-10">No Rate Plans found.</p>}
                {plans.map(plan => (
                    <div key={plan.id} className="border border-slate-100 dark:border-slate-700 p-4 rounded-xl flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">{plan.name}</p>
                            <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{plan.cancellationRule || 'No Policy'}</span>
                                {plan.includesBreakfast && <span className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">Breakfast Included</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openEdit(plan)} className="p-2 text-slate-400 hover:text-emerald-500"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteClick(plan.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={executeDelete}
                title="Delete Rate Plan?"
                message="This action cannot be undone. Any active bookings using this plan will not be affected, but no new bookings can be made with it."
                type="danger"
            />

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-[500px] shadow-2xl border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">
                            {editingPlan ? 'Edit Rate Plan' : 'New Rate Plan'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Plan Name</label>
                                <input name="name" required defaultValue={editingPlan?.name} placeholder="e.g. Early Bird" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Cancellation Policy</label>
                                <input name="cancellationRule" defaultValue={editingPlan?.cancellationRule} placeholder="e.g. Non-refundable" className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Linked Room Type (Optional)</label>
                                <select name="roomTypeId" defaultValue={editingPlan?.roomTypeId || ''} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    <option value="">Apply to All Rooms</option>
                                    {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input name="includesBreakfast" type="checkbox" defaultChecked={editingPlan?.includesBreakfast} className="w-5 h-5 rounded text-emerald-500" />
                                <label className="font-bold text-slate-700 dark:text-slate-300">Includes Breakfast</label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-500 font-bold">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600">Save Plan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function CalendarView({ month, setMonth, inventory, overrides, ratePlans, onRefresh, roomTypes, selectedType, setSelectedType }) {
    // const { success, error } = useToast()
    const [editModal, setEditModal] = useState({ isOpen: false, data: null })
    const [bulkModal, setBulkModal] = useState({ isOpen: false })

    // Bulk Form State
    const [bulkData, setBulkData] = useState({
        startDate: '',
        endDate: '',
        updatePrice: false,
        price: '',
        updateAllotment: false,
        allotment: '',
        updateStopSale: false,
        stopSale: false
    })

    // Generate Days
    const days = []
    const date = new Date(month.getFullYear(), month.getMonth(), 1)
    while (date.getMonth() === month.getMonth()) {
        days.push(new Date(date))
        date.setDate(date.getDate() + 1)
    }

    const handleCellClick = (day) => {
        // Find existing data
        const dateStr = day.toISOString() // simplified matching
        const inv = inventory.find(i => new Date(i.date).toDateString() === day.toDateString())
        const ovr = overrides.find(o => new Date(o.date).toDateString() === day.toDateString())

        setEditModal({
            isOpen: true,
            data: {
                date: day,
                allotment: inv ? inv.allotment : 0,
                stopSale: inv ? inv.stopSale : false,
                price: ovr ? ovr.baseRate : (roomTypes.find(t => t.id === selectedType)?.basePrice || 1000)
            }
        })
    }

    const handleSaveCallback = async (formData) => {
        try {
            // Update Inventory
            await apiFetch(`/inventory/${selectedType}/${formData.date.toISOString().split('T')[0]}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    allotment: Number(formData.allotment),
                    stopSale: formData.stopSale
                })
            })

            // Update Price (Override)
            const defaultPlanId = ratePlans.length > 0 ? ratePlans[0].id : null
            if (!defaultPlanId) {
                toast.error('No Rate Plan found. Please create a Rate Plan first.')
                return
            }
            await apiFetch('/rates/overrides', {
                method: 'POST',
                body: JSON.stringify({
                    roomTypeId: selectedType,
                    ratePlanId: defaultPlanId,
                    date: formData.date,
                    baseRate: Number(formData.price)
                })
            })
            toast.success('Updated successfully')
            onRefresh()
            setEditModal({ isOpen: false, data: null })
        } catch (e) {
            toast.error('Failed to update')
        }
    }

    const handleBulkSubmit = async (e) => {
        e.preventDefault()
        if (!bulkData.startDate || !bulkData.endDate) return toast.error('Please select date range')

        const loadingId = toast.loading('Updating settings...')

        try {
            // 1. Update Inventory / StopSale if selected
            if (bulkData.updateAllotment || bulkData.updateStopSale) {
                await apiFetch('/inventory/bulk', {
                    method: 'POST',
                    body: JSON.stringify({
                        roomTypeId: selectedType,
                        startDate: bulkData.startDate,
                        endDate: bulkData.endDate,
                        ...(bulkData.updateAllotment && { allotment: Number(bulkData.allotment) }),
                        ...(bulkData.updateStopSale && { stopSale: bulkData.stopSale })
                    })
                })
            }

            // 2. Update Price if selected
            if (bulkData.updatePrice) {
                const defaultPlanId = ratePlans.length > 0 ? ratePlans[0].id : null
                if (defaultPlanId) {
                    await apiFetch('/rates/overrides/bulk', {
                        method: 'POST',
                        body: JSON.stringify({
                            roomTypeId: selectedType,
                            ratePlanId: defaultPlanId,
                            startDate: bulkData.startDate,
                            endDate: bulkData.endDate,
                            baseRate: Number(bulkData.price)
                        })
                    })
                }
            }

            toast.success('Bulk update completed!', { id: loadingId })
            onRefresh()
            setBulkModal({ isOpen: false })
        } catch (error) {
            console.error(error)
            toast.error('Failed to update bulk settings', { id: loadingId })
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header Controls */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <select
                        value={selectedType}
                        onChange={e => setSelectedType(e.target.value)}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold dark:bg-slate-700 dark:border-slate-600 dark:text-white min-w-[200px]"
                    >
                        {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                    <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="px-3 py-1 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">Prev</button>
                    <span className="px-4 py-1 text-sm font-bold dark:text-white min-w-[140px] text-center">{month.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="px-3 py-1 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">Next</button>
                </div>
                <button
                    onClick={() => setBulkModal({ isOpen: true })}
                    className="ml-4 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                    <Edit size={16} /> Bulk Update
                </button>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-xl relative custom-scrollbar">
                <div className="min-w-max">
                    {/* Header Row */}
                    <div className="flex sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <div className="w-32 sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-3 text-xs font-bold text-slate-500 uppercase flex items-center">
                            Date
                        </div>
                        {days.map(day => (
                            <div key={day.toISOString()} className={`flex-1 min-w-[80px] text-center p-2 border-r border-slate-100 dark:border-slate-700 ${day.toDateString() === new Date().toDateString() ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}>
                                <div className="text-[10px] text-slate-400 uppercase">{day.toLocaleString('en-US', { weekday: 'short' })}</div>
                                <div className={`font-bold text-sm ${day.getDay() === 0 || day.getDay() === 6 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{day.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Allotment Row */}
                    <div className="flex border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="w-32 sticky left-0 z-10 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-3 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                            Rooms to Sell
                        </div>
                        {days.map(day => {
                            const inv = inventory.find(i => new Date(i.date).toDateString() === day.toDateString())
                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => handleCellClick(day)}
                                    className="flex-1 min-w-[80px] p-3 text-center border-r border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                >
                                    <span className={`font-bold ${!inv ? 'text-emerald-500' : (inv.allotment === 0 ? 'text-red-500' : 'text-slate-700 dark:text-white')}`}>
                                        {!inv ? '-' : inv.allotment}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Status Row */}
                    <div className="flex border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="w-32 sticky left-0 z-10 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-3 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                            Status
                        </div>
                        {days.map(day => {
                            const inv = inventory.find(i => new Date(i.date).toDateString() === day.toDateString())
                            const isClosed = inv?.stopSale
                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => handleCellClick(day)}
                                    className={`flex-1 min-w-[80px] p-3 text-center border-r border-slate-100 dark:border-slate-700 cursor-pointer transition-colors ${isClosed ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                                >
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${isClosed ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {isClosed ? 'Closed' : 'Open'}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Price Row */}
                    <div className="flex border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="w-32 sticky left-0 z-10 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-3 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                            Price (THB)
                        </div>
                        {days.map(day => {
                            const ovr = overrides.find(o => new Date(o.date).toDateString() === day.toDateString())
                            const basePrice = roomTypes.find(t => t.id === selectedType)?.basePrice || 1000
                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => handleCellClick(day)}
                                    className="flex-1 min-w-[80px] p-3 text-center border-r border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                >
                                    <span className={`text-sm ${ovr ? 'font-bold text-amber-600' : 'text-slate-500'}`}>
                                        {ovr ? ovr.baseRate : basePrice}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-96 shadow-2xl border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">
                            Edit {editModal.data.date.toLocaleDateString('en-US')}
                        </h3>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target)
                            handleSaveCallback({
                                date: editModal.data.date,
                                allotment: formData.get('allotment'),
                                price: formData.get('price'),
                                stopSale: formData.get('stopSale') === 'on'
                            })
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Allotment (Rooms)</label>
                                <input name="allotment" type="number" defaultValue={editModal.data.allotment} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Price (THB)</label>
                                <input name="price" type="number" defaultValue={editModal.data.price} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input name="stopSale" type="checkbox" defaultChecked={editModal.data.stopSale} className="w-5 h-5 rounded text-emerald-500" />
                                <label className="font-bold text-slate-700 dark:text-slate-300">Stop Sale (Close Room)</label>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setEditModal({ isOpen: false, data: null })} className="flex-1 py-2 text-slate-500 font-bold">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Update Modal */}
            {bulkModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-[500px] shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h3 className="font-bold text-xl mb-6 dark:text-white flex items-center gap-2">
                            <Edit size={20} className="text-emerald-500" /> Bulk Update Rates
                        </h3>

                        <form onSubmit={handleBulkSubmit} className="space-y-6">
                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={bulkData.startDate}
                                        onChange={e => setBulkData({ ...bulkData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={bulkData.endDate}
                                        onChange={e => setBulkData({ ...bulkData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <hr className="dark:border-slate-700" />

                            {/* Options */}
                            <div className="space-y-4">
                                {/* Price Option */}
                                <div className={`p-4 rounded-xl border transition-colors ${bulkData.updatePrice ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input
                                            type="checkbox"
                                            checked={bulkData.updatePrice}
                                            onChange={e => setBulkData({ ...bulkData, updatePrice: e.target.checked })}
                                            className="w-5 h-5 rounded text-emerald-500"
                                        />
                                        <label className="font-bold text-slate-900 dark:text-white">Set Daily Price</label>
                                    </div>
                                    {bulkData.updatePrice && (
                                        <input
                                            type="number"
                                            placeholder="Enter price (THB)"
                                            className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg"
                                            value={bulkData.price}
                                            onChange={e => setBulkData({ ...bulkData, price: e.target.value })}
                                        />
                                    )}
                                </div>

                                {/* Inventory Option */}
                                <div className={`p-4 rounded-xl border transition-colors ${bulkData.updateAllotment ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input
                                            type="checkbox"
                                            checked={bulkData.updateAllotment}
                                            onChange={e => setBulkData({ ...bulkData, updateAllotment: e.target.checked })}
                                            className="w-5 h-5 rounded text-emerald-500"
                                        />
                                        <label className="font-bold text-slate-900 dark:text-white">Set Allotment (Rooms)</label>
                                    </div>
                                    {bulkData.updateAllotment && (
                                        <input
                                            type="number"
                                            placeholder="Enter quantity"
                                            className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg"
                                            value={bulkData.allotment}
                                            onChange={e => setBulkData({ ...bulkData, allotment: e.target.value })}
                                        />
                                    )}
                                </div>

                                {/* Stop Sale Option */}
                                <div className={`p-4 rounded-xl border transition-colors ${bulkData.updateStopSale ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input
                                            type="checkbox"
                                            checked={bulkData.updateStopSale}
                                            onChange={e => setBulkData({ ...bulkData, updateStopSale: e.target.checked })}
                                            className="w-5 h-5 rounded text-emerald-500"
                                        />
                                        <label className="font-bold text-slate-900 dark:text-white">Status (Open/Close)</label>
                                    </div>
                                    {bulkData.updateStopSale && (
                                        <select
                                            className="w-full p-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg"
                                            value={bulkData.stopSale ? 'closed' : 'open'}
                                            onChange={e => setBulkData({ ...bulkData, stopSale: e.target.value === 'closed' })}
                                        >
                                            <option value="open">Open for Sale</option>
                                            <option value="closed">Stop Sale (Closed)</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setBulkModal({ isOpen: false })} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors">Apply Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
