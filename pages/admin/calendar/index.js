import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect, useMemo } from 'react'
import { apiFetch } from '@/lib/api'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Layers } from 'lucide-react'
import BookingDetailModal from '@/components/BookingDetailModal'
import ConfirmationModal from '@/components/ConfirmationModal'

import CreateBookingModal from '@/components/CreateBookingModal'

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [rooms, setRooms] = useState([])
    const [roomTypes, setRoomTypes] = useState([])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    const [daysToShow, setDaysToShow] = useState(30) // Default Month View
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filterConfig, setFilterConfig] = useState({
        status: ['pending', 'confirmed', 'checked_in'], // Default active statuses
        roomTypeId: 'All'
    })

    useEffect(() => {
        fetchData()
    }, [currentDate])

    const fetchData = async () => {
        setLoading(true)
        try {
            // 1. Calculate Date Range
            const start = new Date(currentDate)
            start.setDate(1) // Start of month
            const end = new Date(start)
            end.setMonth(end.getMonth() + 1) // End of month

            // Adjust if we want a sliding window instead?
            // Let's stick to Month View for now.

            // 2. Fetch Rooms & Types
            const [roomsData, typesData] = await Promise.all([
                apiFetch('/rooms'),
                apiFetch('/room-types')
            ])

            // 3. Fetch Events
            const eventsData = await apiFetch(`/bookings/admin/calendar-events?start=${start.toISOString()}&end=${end.toISOString()}`)

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
            case 'confirmed': return 'bg-emerald-500 text-white';
            case 'pending': return 'bg-amber-500 text-white';
            case 'checked_in': return 'bg-blue-600 text-white';
            case 'checked_out': return 'bg-slate-500 text-white';
            default: return 'bg-slate-400 text-white';
        }
    }

    const openDetails = (booking) => {
        // Need to attach full room/roomType objects if missing from event data
        // The event data from getCalendarEvents might be minimal. 
        // Let's verify what we get. The Service returns: id, checkIn, checkOut, status, leadName, roomId, roomTypeId, totalAmount, room {roomNumber}, roomType {name}.
        // The Modal expects room.roomNumber, roomType.name etc. It should work mostly.
        setSelectedBooking(booking)
        setIsDetailOpen(true)
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
        // Format date as YYYY-MM-DD for input[type="date"]
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
                    await apiFetch(`/bookings/admin/${id}/status`, {
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
            <div className="flex flex-col h-[calc(100vh-80px)]">
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
                                            <div className="w-32 flex-shrink-0 p-2 font-medium text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky left-0 z-10 shadow-sm flex items-center text-xs">
                                                {room.roomNumber || room.id.slice(-4)}
                                            </div>

                                            {/* Days Grid Cells - purely visual background (now interactive) */}
                                            {days.map(day => (
                                                <div
                                                    key={day.toISOString()}
                                                    onClick={() => handleCellClick(room, day)}
                                                    className="flex-1 border-r border-slate-50 dark:border-slate-700/50 h-full relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                                    title={`Create booking for Room ${room.roomNumber} on ${day.toLocaleDateString()}`}
                                                >
                                                </div>
                                            ))}

                                            {/* Events Overlay */}
                                            {/* Filter events for this room AND filterConfig */}
                                            {events.filter(e => e.roomId === room.id && filterConfig.status.includes(e.status)).map(booking => {
                                                /* Calculate Position */
                                                const checkIn = new Date(booking.checkIn);
                                                const checkOut = new Date(booking.checkOut);

                                                // Simple clipping to current month view
                                                const viewStart = days[0];
                                                const viewEnd = days[days.length - 1];
                                                viewEnd.setHours(23, 59, 59);

                                                // If booking is outside view, skip (should be filtered by API but just in case)
                                                if (checkOut <= viewStart || checkIn > viewEnd) return null;

                                                // Calculate Start Offset
                                                // If checkIn < viewStart, start at 0.
                                                let startDate = checkIn < viewStart ? viewStart : checkIn;
                                                let diffTime = Math.abs(startDate - viewStart);
                                                let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                // Correction: diffDays from start of month. 1st is 0 offset.
                                                // Date.getDate() - 1 works if we assume 1st.
                                                let startOffset = startDate.getDate() - 1; // 0-indexed column

                                                // Calculate Duration
                                                // Clip end
                                                let endDate = checkOut > viewEnd ? viewEnd : checkOut;
                                                let durTime = Math.abs(endDate - startDate);
                                                let durationDays = Math.ceil(durTime / (1000 * 60 * 60 * 24));

                                                // Visual tweak: if checkout is same day as checkin? (Not possible usually).
                                                // Real hotel logic: checkin 2PM, checkout 12PM. Occupies the night.
                                                // Visual: Width = Nights * CellWidth.

                                                return (
                                                    <div
                                                        key={booking.id}
                                                        onClick={() => openDetails(booking)}
                                                        className={`absolute top-2 bottom-2 rounded-sm shadow-sm border border-white/20 px-1 flex items-center text-[9px] font-bold overflow-hidden cursor-pointer hover:brightness-110 transition-all z-0 ${getStatusColor(booking.status)}`}
                                                        style={{
                                                            left: `${(startOffset / days.length) * 100}%`,
                                                            width: `${(durationDays / days.length) * 100}%`
                                                        }}
                                                        title={`${booking.leadName} (${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()})`}
                                                    >
                                                        <span className="truncate">{booking.leadName}</span>
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
