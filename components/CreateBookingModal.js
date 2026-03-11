import { useState, useEffect, useRef } from 'react'
import { XCircle, HelpCircle } from 'lucide-react'
import DatePicker from '@/components/DatePicker'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAdmin } from '@/contexts/AdminContext'
import ConfirmationModal from '@/components/ConfirmationModal'

const LabelWithTooltip = ({ label, text }) => (
    <div className="flex items-center gap-2 mb-1 group relative w-fit">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 pointer-events-none">{label}</label>
        <HelpCircle size={14} className="text-slate-400 cursor-help" />
        <div className="absolute left-full top-0 ml-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-xl">
            {text}
            <div className="absolute right-full top-2 -mr-1 border-4 border-transparent border-r-slate-800"></div>
        </div>
    </div>
)

export default function CreateBookingModal({ onClose, onSuccess, initialData = {} }) {
    const { success, error } = useToast()
    const { currentHotel } = useAdmin()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [allPlans, setAllPlans] = useState([])
    const [showConflict, setShowConflict] = useState(false)
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
        hotelId: currentHotel?.id || ''
    })
    const [errors, setErrors] = useState({ checkIn: false, checkOut: false });

    const checkInRef = useRef(null);
    const checkOutRef = useRef(null);

    useEffect(() => {
        if (currentHotel) {
            Promise.all([
                apiFetch(`/room-types?hotelId=${currentHotel.id}`),
                apiFetch(`/rates/plans?hotelId=${currentHotel.id}`)
            ]).then(([types, plans]) => {
                setData(types)
                setAllPlans(plans || [])
            }).catch(console.error)
        }
    }, [currentHotel])

    // If initialData has roomId, we need to ensure roomTypeId follows suit (if not provided)
    // For now assuming initialData passes strictly matches.

    const selectedType = data.find(t => t.id === form.roomTypeId)
    const availablePlans = allPlans.filter(p => !p.roomTypeId || (selectedType && p.roomTypeId === selectedType.id))

    // Auto-calculate total amount
    useEffect(() => {
        if (form.checkIn && form.checkOut && selectedType) {
            const start = new Date(form.checkIn);
            const end = new Date(form.checkOut);
            const days = (end - start) / (1000 * 60 * 60 * 24);

            let price = selectedType.basePrice || 1000;
            // TODO: Fetch dynamic price from backend /rates/calculate for accurate pricing with overrides

            const validDays = days > 0 ? days : 0;
            setForm(prev => ({ ...prev, totalAmount: price * validDays }));
        }
    }, [form.checkIn, form.checkOut, form.ratePlanId, selectedType]);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({ checkIn: false, checkOut: false })

        // Validation: Check dates
        const isDateValid = (d) => d && !isNaN(new Date(d).getTime());
        let hasError = false;
        const newErrors = { checkIn: false, checkOut: false };

        if (!isDateValid(form.checkIn)) {
            newErrors.checkIn = true;
            hasError = true;
            if (checkInRef.current?.flatpickr?.input) checkInRef.current.flatpickr.input.focus();
        } else if (!isDateValid(form.checkOut)) {
            newErrors.checkOut = true;
            hasError = true;
            if (checkOutRef.current?.flatpickr?.input) checkOutRef.current.flatpickr.input.focus();
        } else if (new Date(form.checkIn) >= new Date(form.checkOut)) {
            newErrors.checkOut = true;
            hasError = true;
            error('Check-out date must be after Check-in date')
            if (checkOutRef.current?.flatpickr?.input) checkOutRef.current.flatpickr.input.focus();
        }

        if (hasError) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

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
            if (err.message && err.message.includes('already booked')) {
                setShowConflict(true)
            } else {
                error('Failed to create booking: ' + err.message)
            }
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
                            <LabelWithTooltip label="Guest Name" text="Primary guest name for the reservation" />
                            <input required type="text" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.leadName}
                                onChange={e => setForm({ ...form, leadName: e.target.value })} />
                        </div>
                        <div>
                            <LabelWithTooltip label="Email" text="Booking confirmation will be sent here" />
                            <input required type="email" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.leadEmail}
                                onChange={e => setForm({ ...form, leadEmail: e.target.value })} />
                        </div>
                        <div>
                            <LabelWithTooltip label="Phone" text="Contact number for urgent updates" />
                            <input type="text" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.leadPhone}
                                onChange={e => setForm({ ...form, leadPhone: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <LabelWithTooltip label="Check In" text="Date of arrival (start of stay)" />
                            <DatePicker
                                innerRef={checkInRef}
                                hasError={errors.checkIn}
                                value={form.checkIn}
                                onChange={([dateStr]) => {
                                    setForm({ ...form, checkIn: dateStr || '' });
                                    setErrors(prev => ({ ...prev, checkIn: false }));
                                }}
                                options={{ minDate: "today" }}
                                className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                wrapperClassName="w-full"
                            />
                        </div>
                        <div>
                            <LabelWithTooltip label="Check Out" text="Date of departure (end of stay)" />
                            <DatePicker
                                innerRef={checkOutRef}
                                hasError={errors.checkOut}
                                value={form.checkOut}
                                onChange={([dateStr]) => {
                                    setForm({ ...form, checkOut: dateStr || '' });
                                    setErrors(prev => ({ ...prev, checkOut: false }));
                                }}
                                options={{ minDate: form.checkIn || "today" }}
                                className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                wrapperClassName="w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <LabelWithTooltip label="Room Type" text="Category of room (e.g. Deluxe, Suite)" />
                            <select required className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.roomTypeId}
                                onChange={e => setForm({ ...form, roomTypeId: e.target.value })}>
                                <option value="">Select Type</option>
                                {data.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <LabelWithTooltip label="Room Number" text="Assign specific room now (Optional)" />
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
                            <LabelWithTooltip label="Rate Plan" text="Pricing package (e.g. Standard, Breakfast Included)" />
                            <select required className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.ratePlanId}
                                disabled={!selectedType}
                                onChange={e => setForm({ ...form, ratePlanId: e.target.value })}>
                                <option value="">Select Rate Plan</option>
                                {availablePlans.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <LabelWithTooltip label="Total Amount" text="Calculated price based on nights & rate" />
                            <input required type="number" className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={form.totalAmount}
                                onChange={e => setForm({ ...form, totalAmount: e.target.value })} />
                        </div>
                    </div>


                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Payment Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <LabelWithTooltip label="Payment Method" text="How the guest will pay" />
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
                                <LabelWithTooltip label="Status" text="Current payment status" />
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

                    <ConfirmationModal
                        isOpen={showConflict}
                        onClose={() => setShowConflict(false)}
                        onConfirm={() => setShowConflict(false)}
                        title="Room Unavailable"
                        message="The selected room is already booked for these dates."
                        type="danger"
                        singleButton={true}
                        confirmText="OK"
                    />
                </form>
            </div >
        </div >
    )
}

