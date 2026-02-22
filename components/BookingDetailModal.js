import { User, Mail, Phone, Calendar, CreditCard, XCircle, Receipt, LayoutDashboard } from 'lucide-react'

import GuestManager from './GuestManager'
import FolioTab from './FolioTab' // Import
import { apiFetch } from '@/lib/api'
import { useState } from 'react'
import toast from 'react-hot-toast'

// ... imports
import PaymentModal from '@/components/PaymentModal';

export default function BookingDetailModal({ booking: initialBooking, onClose, onUpdateStatus }) {
    const [booking, setBooking] = useState(initialBooking)
    const [showPayment, setShowPayment] = useState(false)
    const [activeTab, setActiveTab] = useState('details') // 'details' | 'folio'
    const [isAssigningRoom, setIsAssigningRoom] = useState(false)
    const [availableRooms, setAvailableRooms] = useState([])
    const [selectedRoomId, setSelectedRoomId] = useState('')
    const [loadingRooms, setLoadingRooms] = useState(false)

    if (!booking) return null;

    // ... existing functions ...
    const refreshBooking = async () => {
        try {
            const data = await apiFetch(`/bookings/${booking.id}`)
            setBooking(data)
        } catch (error) {
            console.error("Failed to refresh booking", error)
        }
    }

    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB')

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
            case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
            case 'cancelled': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            case 'checked_in': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
            case 'checked_out': return 'bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400'
            case 'no_show': return 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'
            default: return 'bg-slate-100 text-slate-800'
        }
    }

    const handlePaymentSuccess = () => {
        setShowPayment(false)
        refreshBooking()
    }

    const handleInitiateCheckIn = async () => {
        setIsAssigningRoom(true)
        setLoadingRooms(true)
        try {
            // Fetch available rooms for this room type
            // Note: In a real app, you might want an endpoint specifically for "available rooms between dates"
            // For now, we fetch all rooms of this type and filter out ones currently occupied using a new or existing endpoint
            const res = await apiFetch(`/rooms/available?roomTypeId=${booking.roomType.id}&checkIn=${booking.checkIn}&checkOut=${booking.checkOut}`)
            setAvailableRooms(res)
        } catch (error) {
            console.error("Failed to fetch rooms:", error)
            setAvailableRooms([])
        } finally {
            setLoadingRooms(false)
        }
    }

    const handleConfirmCheckIn = () => {
        if (!selectedRoomId) {
            toast.error('Please select a room first');
            return;
        }
        onUpdateStatus(booking.id, 'checked_in', selectedRoomId)
        setIsAssigningRoom(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-[95vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Booking Details
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status.replace('_', ' ')}
                            </span>
                        </h3>
                        <p className="text-sm text-slate-500">ID: #{booking.id}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-700 px-6 bg-slate-50/30 dark:bg-slate-900/20 shrink-0">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <LayoutDashboard size={16} /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('folio')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'folio' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <Receipt size={16} /> Folio / Billing
                    </button>
                </div>

                {/* Content (Scrollable) */}
                <div className="p-6 overflow-y-auto grow">
                    {activeTab === 'details' ? (
                        <div className="grid md:grid-cols-2 gap-8 relative">
                            {/* Room Assignment Overlay */}
                            {isAssigningRoom && (
                                <div className="absolute inset-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center p-6 rounded-2xl">
                                    <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-600">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Assign Room for Check-in</h3>
                                        <p className="text-sm text-slate-500 mb-4">{booking.roomType?.name}</p>

                                        {loadingRooms ? (
                                            <div className="animate-pulse flex space-x-4 mb-4">
                                                <div className="flex-1 space-y-4 py-1">
                                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                                    <div className="h-4 bg-slate-200 rounded"></div>
                                                </div>
                                            </div>
                                        ) : availableRooms.length > 0 ? (
                                            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto custom-scrollbar">
                                                {availableRooms.map(room => (
                                                    <label key={room.id} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedRoomId === room.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 hover:border-primary-300 dark:border-slate-600'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <input type="radio" name="room" value={room.id} checked={selectedRoomId === room.id} onChange={(e) => setSelectedRoomId(e.target.value)} className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300" />
                                                            <span className="font-bold text-slate-700 dark:text-slate-200">Room {room.roomNumber}</span>
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded font-medium dark:bg-slate-800">{room.status || 'CLEAN'}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm">
                                                No clean or available rooms found for this type.
                                            </div>
                                        )}

                                        <div className="flex gap-3 justify-end">
                                            <button onClick={() => setIsAssigningRoom(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                                            <button onClick={handleConfirmCheckIn} disabled={!selectedRoomId} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30">Confirm Check-in</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Guest Info */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={16} /> Guest Information</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold">
                                            {booking.leadName?.[0] || 'G'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{booking.leadName}</p>
                                            <p className="text-sm text-slate-500">{booking.guestsAdult || 2} Adults, {booking.guestsChild || 0} Children</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <Mail size={16} className="text-slate-400" /> {booking.leadEmail}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <Phone size={16} className="text-slate-400" /> {booking.leadPhone || 'No Phone'}
                                    </div>
                                </div>
                            </div>

                            {/* Stay Info */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Calendar size={16} /> Stay Details</h4>
                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex justify-between">
                                        <span>Check-in:</span>
                                        <span className="font-bold">{formatDate(booking.checkIn)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Check-out:</span>
                                        <span className="font-bold">{formatDate(booking.checkOut)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Room Type:</span>
                                        <span className="font-bold">{booking.roomType?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Room Number:</span>
                                        <span className="font-bold">{booking.room?.roomNumber ? `#${booking.room.roomNumber}` : (booking.room?.id ? `#${booking.room.id.slice(-4)}` : 'Unassigned')}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                                        <span>Rate Plan:</span>
                                        <span className="font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">{booking.ratePlan?.name || 'Standard'}</span>
                                    </div>
                                </div>

                                {booking.specialRequests && (
                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                        <p className="text-xs font-bold text-amber-600 uppercase mb-1">Special Requests / Notes</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{booking.specialRequests}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Summary */}
                            <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-700 pt-6">
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><CreditCard size={16} /> Payment Summary</h4>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Amount</p>
                                        <p className="text-2xl font-bold text-emerald-600">฿{booking.totalAmount?.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500 mb-1">Method</p>
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold dark:bg-emerald-500/20 dark:text-emerald-400">
                                                {booking.payment?.provider ? booking.payment.provider.replace('_', ' ') : 'Pay Later'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('folio')}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline px-2"
                                        >
                                            View Full Folio
                                        </button>
                                        {booking.status !== 'cancelled' && (
                                            <button
                                                onClick={() => setShowPayment(true)}
                                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                                            >
                                                Charge Card
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Guest Manager */}
                            <div className="md:col-span-2">
                                <GuestManager
                                    bookingId={booking.id}
                                    guests={booking.guests}
                                    onUpdate={refreshBooking}
                                />
                            </div>
                        </div>
                    ) : (
                        <FolioTab booking={booking} onUpdate={refreshBooking} />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50/50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-3 justify-end shrink-0">
                    {booking.status === 'pending' && (
                        <button
                            onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                            className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                        >
                            Confirm Booking
                        </button>
                    )}
                    {booking.status === 'confirmed' && (
                        <>
                            <button
                                onClick={handleInitiateCheckIn}
                                className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                            >
                                Check In
                            </button>
                            <button
                                onClick={() => onUpdateStatus(booking.id, 'no_show')}
                                className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                            >
                                No Show
                            </button>
                        </>
                    )}
                    {booking.status === 'checked_in' && (
                        <button
                            onClick={() => onUpdateStatus(booking.id, 'checked_out')}
                            className="px-6 py-2 bg-slate-500 text-white rounded-xl font-bold hover:bg-slate-600 shadow-lg shadow-slate-500/20"
                        >
                            Check Out
                        </button>
                    )}
                    {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
                        <button
                            onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                            className="px-6 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-300 dark:bg-slate-700 dark:border-slate-600 dark:text-rose-400"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>

            {showPayment && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    booking={booking}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    )
}
