import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect, useMemo } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Layers, User, CreditCard, CheckCircle, Clock } from 'lucide-react'
import BookingDetailModal from '@/components/BookingDetailModal'
import ConfirmationModal from '@/components/ConfirmationModal'

import CreateBookingModal from '@/components/CreateBookingModal'

export default function Calendar() {
    const { user } = useAuth()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [rooms, setRooms] = useState([])
    const [roomTypes, setRoomTypes] = useState([])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    const [daysToShow, setDaysToShow] = useState(30) // Default Month View
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    // Tooltip State
    const [hoveredBooking, setHoveredBooking] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filterConfig, setFilterConfig] = useState({
        status: ['pending', 'confirmed', 'checked_in'], // Default active statuses
        roomTypeId: 'All'
    })

    // Real-time Polling
    useEffect(() => {
        if (!user) return;

        fetchData(); // Initial Fetch

        const interval = setInterval(() => {
            // Silent fetch (no loading spinner) to avoid UI flicker
            const hotelId = user?.roleAssignments?.[0]?.hotelId;
            if (!hotelId) return;

            const start = new Date(currentDate)
            start.setDate(1)
            const end = new Date(start)
            end.setMonth(end.getMonth() + 1)

            apiFetch(`/bookings/admin/calendar-events?hotelId=${hotelId}&start=${start.toISOString()}&end=${end.toISOString()}`)
                .then(eventsData => setEvents(eventsData))
                .catch(err => console.error("Polling error", err));

        }, 15000); // Poll every 15 seconds

        return () => clearInterval(interval);
    }, [currentDate, user]);

    const fetchData = async () => {
        const hotelId = user?.roleAssignments?.[0]?.hotelId;
        if (!hotelId) return;

        setLoading(true)
        try {
            const start = new Date(currentDate)
            start.setDate(1)
            const end = new Date(start)
            end.setMonth(end.getMonth() + 1)

            const [roomsData, typesData, eventsData] = await Promise.all([
                apiFetch('/rooms'),
                apiFetch('/room-types'),
                apiFetch(`/bookings/admin/calendar-events?hotelId=${hotelId}&start=${start.toISOString()}&end=${end.toISOString()}`)
            ])

            setRooms(roomsData)
            setRoomTypes(typesData)
            setEvents(eventsData)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Generate Days for Header
    const days = useMemo(() => {
        const d = [];
        const start = new Date(currentDate);
        start.setDate(1);
        const month = start.getMonth();

        while (start.getMonth() === month) {
            d.push(new Date(start));
            start.setDate(start.getDate() + 1);
        }
        return d;
    }, [currentDate]);

    const prevMonth = () => {
        const d = new Date(currentDate)
        d.setMonth(d.getMonth() - 1)
        setCurrentDate(d)
    }

    const nextMonth = () => {
        const d = new Date(currentDate)
        d.setMonth(d.getMonth() + 1)
        setCurrentDate(d)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-500 border-emerald-600 text-white';
            case 'pending': return 'bg-amber-500 border-amber-600 text-white';
            case 'checked_in': return 'bg-blue-600 border-blue-700 text-white';
            case 'checked_out': return 'bg-slate-500 border-slate-600 text-white';
            case 'cancelled': return 'bg-red-500 border-red-600 text-white opacity-60';
            default: return 'bg-slate-400 border-slate-500 text-white';
        }
    }

    const openDetails = (booking) => {
        setSelectedBooking(booking)
        setIsDetailOpen(true)
        setHoveredBooking(null)
    }

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        onConfirm: () => { }
    })

    const [createModal, setCreateModal] = useState({
        isOpen: false,
        initialData: {}
    })

    const handleCellClick = (room, date) => {
        const dateStr = date.toISOString().split('T')[0]
        setCreateModal({
            isOpen: true,
            initialData: {
                roomId: room.id,
                roomTypeId: room.roomTypeId,
                checkIn: dateStr
            }
        })
    }

    const updateStatus = (id, newStatus) => {
        setConfirmModal({
            isOpen: true,
            title: 'Update Booking Status',
            message: `Are you sure you want to change status to "${newStatus}"?`,
            type: newStatus === 'cancelled' ? 'danger' : 'warning',
            onConfirm: async () => {
                try {
                    const hotelId = user?.roleAssignments?.[0]?.hotelId;
                    const query = hotelId ? `?hotelId=${hotelId}` : '';

                    await apiFetch(`/bookings/admin/${id}/status${query}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    })
                    fetchData() // Reload calendar
                    setIsDetailOpen(false)
                } catch (error) {
                    alert('Update failed')
                }
            }
        })
    }

    // Main Render
    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-80px)] relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <CalendarIcon size={24} className="text-emerald-500" />
                        Booking Calendar
                    </h1>
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronLeft /></button>
                        <span className="font-bold w-40 text-center dark:text-white">
                            {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronRight /></button>
                    </div>

                    <div className="flex gap-2 relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${isFilterOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white'}`}>
                            <Filter size={16} /> Filter
                        </button>

                        {/* Filter Popover */}
                        {isFilterOpen && (
                            <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 z-30">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Filter Bookings</h4>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Status</label>
                                    <div className="space-y-2">
                                        {['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map(status => (
                                            <label key={status} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <input
                                                    type="checkbox"
                                                    checked={filterConfig.status.includes(status)}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.checked
                                                            ? [...filterConfig.status, status]
                                                            : filterConfig.status.filter(s => s !== status)
                                                        setFilterConfig({ ...filterConfig, status: newStatus })
                                                    }}
                                                    className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                                />
                                                <span className="capitalize">{status.replace('_', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Room Type</label>
                                    <select
                                        className="w-full p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                                        value={filterConfig.roomTypeId}
                                        onChange={(e) => setFilterConfig({ ...filterConfig, roomTypeId: e.target.value })}
                                    >
                                        <option value="All">All Types</option>
                                        {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Calendar Grid Container */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">

                    {/* Header Row (Days) */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <div className="w-32 flex-shrink-0 p-3 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 sticky left-0 z-20 text-[10px] uppercase">
                            Rooms
                        </div>
                        <div className="flex flex-1 overflow-hidden" id="calendar-header">
                            {days.map(day => (
                                <div key={day.toISOString()} className="flex-1 flex-shrink-0 border-r border-slate-100 dark:border-slate-700 py-1 text-center min-w-0">
                                    <div className="text-[9px] text-slate-400 uppercase">{day.toLocaleString('en-US', { weekday: 'short' }).slice(0, 2)}</div>
                                    <div className={`font-bold text-xs dark:text-white ${day.toDateString() === new Date().toDateString() ? 'text-emerald-500' : ''}`}>
                                        {day.getDate()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-auto relative custom-scrollbar">
                        {/* Room Rows */}
                        {roomTypes?.filter(t => filterConfig.roomTypeId === 'All' || t.id === filterConfig.roomTypeId).map(type => {
                            const typeRooms = rooms?.filter(r => r.roomTypeId === type.id) || [];
                            if (typeRooms.length === 0) return null;

                            return (
                                <div key={type.id}>
                                    {/* Type Header */}
                                    <div className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-900/50 p-2 px-4 font-bold text-xs text-slate-500 uppercase flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                                        <Layers size={14} /> {type.name}
                                    </div>

                                    {typeRooms.map(room => (
                                        <div key={room.id} className="flex border-b border-slate-100 dark:border-slate-700 h-16 relative hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            {/* Room Label (Sticky Left) */}
                                            <div className="w-32 flex-shrink-0 p-2 font-medium text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky left-0 z-10 shadow-sm flex items-center justify-between text-xs group">
                                                <span>{room.roomNumber || room.id.slice(-4)}</span>
                                                <span className={`w-2 h-2 rounded-full ${room.status === 'CLEAN' ? 'bg-emerald-500' : room.status === 'DIRTY' ? 'bg-red-500' : 'bg-slate-300'}`} title={room.status}></span>
                                            </div>

                                            {/* Days Grid Cells */}
                                            {days.map(day => (
                                                <div
                                                    key={day.toISOString()}
                                                    onClick={() => handleCellClick(room, day)}
                                                    className="flex-1 border-r border-slate-50 dark:border-slate-700/50 h-full relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                                >
                                                </div>
                                            ))}

                                            {/* Events Overlay */}
                                            {events.filter(e => e.roomId === room.id && filterConfig.status.includes(e.status)).map(booking => {
                                                const checkIn = new Date(booking.checkIn);
                                                const checkOut = new Date(booking.checkOut);

                                                const viewStart = days[0];
                                                const viewEnd = days[days.length - 1];
                                                viewEnd.setHours(23, 59, 59);

                                                if (checkOut <= viewStart || checkIn > viewEnd) return null;

                                                let startDate = checkIn < viewStart ? viewStart : checkIn;
                                                let diffTime = Math.abs(startDate - viewStart);
                                                let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                let startOffset = startDate.getDate() - 1;

                                                let endDate = checkOut > viewEnd ? viewEnd : checkOut;
                                                let durTime = Math.abs(endDate - startDate);
                                                let durationDays = Math.ceil(durTime / (1000 * 60 * 60 * 24));

                                                return (
                                                    <div
                                                        key={booking.id}
                                                        onClick={() => openDetails(booking)}
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setTooltipPos({ x: rect.left, y: rect.bottom + 5 });
                                                            setHoveredBooking(booking);
                                                        }}
                                                        onMouseLeave={() => setHoveredBooking(null)}
                                                        className={`absolute top-1 bottom-1 rounded shadow-sm border px-2 flex flex-col justify-center text-[10px] font-bold overflow-hidden cursor-pointer hover:brightness-110 hover:shadow-md transition-all z-10 ${getStatusColor(booking.status)}`}
                                                        style={{
                                                            left: `${(startOffset / days.length) * 100}%`,
                                                            width: `${(durationDays / days.length) * 100}%`
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1 truncate">
                                                            <span>{booking.leadName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-80 scale-90 origin-left">
                                                            <div className="flex items-center gap-0.5"><User size={8} /> {booking.guestsAdult + booking.guestsChild}</div>
                                                            {booking.payment?.status === 'authorized' || booking.payment?.status === 'captured' ?
                                                                <CreditCard size={8} className="text-white" /> :
                                                                <span className="text-[8px] px-1 bg-white/20 rounded">UNPAID</span>
                                                            }
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-4 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Pending</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Confirmed</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Checked In</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500"></div> Checked Out</div>
                </div>

                {/* Hover Tooltip */}
                {hoveredBooking && (
                    <div
                        className="fixed z-50 bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 w-64 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                        style={{ left: Math.min(window.innerWidth - 270, tooltipPos.x), top: tooltipPos.y }}
                    >
                        <div className="flex justify-between items-start mb-2 border-b border-slate-700 pb-2">
                            <div>
                                <div className="font-bold text-base">{hoveredBooking.leadName}</div>
                                <div className="text-slate-400 text-[10px]">{hoveredBooking.id}</div>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(hoveredBooking.status).replace('border-l-4', '')}`}>
                                {hoveredBooking.status.replace('_', ' ')}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Clock size={12} className="text-slate-400" />
                                <span>{new Date(hoveredBooking.checkIn).toLocaleDateString()} - {new Date(hoveredBooking.checkOut).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={12} className="text-slate-400" />
                                <span>{hoveredBooking.guestsAdult} Adults, {hoveredBooking.guestsChild} Children</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-400">฿{hoveredBooking.totalAmount?.toLocaleString()}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${bookingPaymentStatus(hoveredBooking) === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {bookingPaymentStatus(hoveredBooking)}
                                </span>
                            </div>
                            {hoveredBooking.specialRequests && (
                                <div className="mt-2 p-2 bg-slate-800 rounded border border-slate-700 text-slate-300 italic">
                                    "{hoveredBooking.specialRequests}"
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {isDetailOpen && selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setIsDetailOpen(false)}
                    onUpdateStatus={updateStatus}
                />
            )}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
            />
            {createModal.isOpen && (
                <CreateBookingModal
                    onClose={() => setCreateModal({ ...createModal, isOpen: false })}
                    onSuccess={fetchData}
                    initialData={createModal.initialData}
                />
            )}
        </AdminLayout>
    )
}

function bookingPaymentStatus(booking) {
    if (booking.payment?.status === 'authorized' || booking.payment?.status === 'captured') return 'PAID';
    return 'UNPAID';
}
