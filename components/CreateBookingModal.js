import { useState, useEffect } from 'react'
import { XCircle } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

export default function CreateBookingModal({ onClose, onSuccess, initialData = {} }) {
    const { success, error } = useToast()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [form, setForm] = useState({
        checkIn: initialData.checkIn || '',
        checkOut: '',
        roomTypeId: initialData.roomTypeId || '',
        ratePlanId: '',
        roomId: initialData.roomId || '',
        leadName: '',
        leadEmail: '',
        leadPhone: '',
        totalAmount: 0,
        paymentMethod: '',
        paymentStatus: 'pending',
        hotelId: 'cmkms2e6m000110p913ga7fon' // Default to first (or fetch from user context)
    })

    useEffect(() => {
        apiFetch('/room-types').then(setData).catch(console.error)
    }, [])

    // If initialData has roomId, we need to ensure roomTypeId follows suit (if not provided)
    // For now assuming initialData passes strictly matches.

    const selectedType = data.find(t => t.id === form.roomTypeId)

    // Auto-calculate total amount
    useEffect(() => {
        if (form.checkIn && form.checkOut && selectedType) {
            const start = new Date(form.checkIn);
            const end = new Date(form.checkOut);
            const days = (end - start) / (1000 * 60 * 60 * 24);

            if (days > 0) {
                let price = selectedType.basePrice || 1000;

                // If rate plan selected, try to find specific price modifier (mock logic as ratePlan structure varies)
                if (form.ratePlanId) {
                    const plan = selectedType.ratePlans?.find(p => p.id === form.ratePlanId);
                    if (plan && plan.price) {
                        price = plan.price;
                    }
                }

                setForm(prev => ({ ...prev, totalAmount: price * days }));
            }
        }
    }, [form.checkIn, form.checkOut, form.ratePlanId, selectedType]);

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
                    roomTypeId: form.roomTypeId,
                    roomId: form.roomId || undefined, // Allow unassigned
                    ratePlanId: form.ratePlanId || undefined,
                    totalAmount: Number(form.totalAmount),
                    paymentMethod: form.paymentMethod || undefined,
                    paymentStatus: form.paymentStatus
                })
            })
            onSuccess()
            onClose()
            success('Booking created successfully!')
        } catch (err) {
            error('Failed to create booking: ' + err.message)
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
                                value={form.leadName}
                                onChange={e => setForm({ ...form, leadName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input required type="email" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.leadEmail}
                                onChange={e => setForm({ ...form, leadEmail: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                            <input type="text" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.leadPhone}
                                onChange={e => setForm({ ...form, leadPhone: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Check In</label>
                            <input required type="date" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.checkIn}
                                onChange={e => setForm({ ...form, checkIn: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Check Out</label>
                            <input required type="date" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.checkOut}
                                onChange={e => setForm({ ...form, checkOut: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Room Type</label>
                            <select required className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.roomTypeId}
                                onChange={e => setForm({ ...form, roomTypeId: e.target.value })}>
                                <option value="">Select Type</option>
                                {data.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
                            <select required className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.roomId}
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
                                value={form.ratePlanId}
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


                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Payment Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                                <select className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    value={form.paymentMethod}
                                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                                    <option value="">None (Pay later)</option>
                                    <option value="cash">Cash</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    value={form.paymentStatus}
                                    onChange={e => setForm({ ...form, paymentStatus: e.target.value })}>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button disabled={loading} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg mt-4">
                        {loading ? 'Creating...' : 'Create Booking'}
                    </button>
                </form>
            </div >
        </div >
    )
}
