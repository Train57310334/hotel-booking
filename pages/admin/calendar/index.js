import AdminLayout from '@/components/AdminLayout'
import React, { useState, useEffect, useMemo } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Layers,
    User, CreditCard, CheckCircle, Clock, Plus, RefreshCw, Home,
    AlertCircle, BedDouble, Eye, EyeOff, GripVertical, Sparkles, Wrench, Zap, Share2,
    ChevronDown, Minimize2, Maximize2, Search
} from 'lucide-react'
import BookingDetailModal from '@/components/BookingDetailModal'
import ConfirmationModal from '@/components/ConfirmationModal'
import CreateBookingModal from '@/components/CreateBookingModal'
import { useAdmin } from '@/contexts/AdminContext'
import toast from 'react-hot-toast'
import AvailabilityMatrix from '@/components/admin/calendar/AvailabilityMatrix'

// ── Status / HK configs ────────────────────────────────────────────────────────
// bar: full Tailwind classes — must be literal strings for Tailwind JIT
// edge: left accent stripe for fast visual scanning
// abbr: short text label shown on the bar
const STATUS_CONFIG = {
    pending:     { label: 'Pending',     dot: 'bg-amber-400',   bar: 'bg-amber-100  border-amber-300',    edge: 'bg-amber-500', textColor: 'text-amber-800',  abbr: 'P'   },
    confirmed:   { label: 'Confirmed',   dot: 'bg-blue-400',    bar: 'bg-blue-500   border-blue-600',     edge: 'bg-blue-800',  textColor: 'text-white',      abbr: 'C'   },
    checked_in:  { label: 'In House',    dot: 'bg-teal-400',    bar: 'bg-teal-500   border-teal-600',     edge: 'bg-teal-800',  textColor: 'text-white',      abbr: 'IN'  },
    checked_out: { label: 'Checked Out', dot: 'bg-slate-400',   bar: 'bg-slate-200  border-slate-300',    edge: 'bg-slate-400', textColor: 'text-slate-600',  abbr: 'OUT' },
    cancelled:   { label: 'Cancelled',   dot: 'bg-rose-400',    bar: 'bg-rose-100   border-rose-200',     edge: 'bg-rose-400',  textColor: 'text-rose-700',   abbr: 'X'   },
}

const HK_CONFIG = {
    CLEAN:     { label: 'Clean',        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: <Sparkles size={10} /> },
    INSPECTED: { label: 'Ready',        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: <CheckCircle size={10} /> },
    DIRTY:     { label: 'Dirty',        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: <AlertCircle size={10} /> },
    CLEANING:  { label: 'Cleaning',     color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock size={10} /> },
    OOO:       { label: 'Out of Order', color: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: <Wrench size={10} /> },
    OCCUPIED:  { label: 'Occupied',     color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <BedDouble size={10} /> },
}

// Fixed column width in pixels for the room label
const ROOM_COL = 120

export default function Calendar() {
    const { user } = useAuth()
    const { currentHotel } = useAdmin() || {}
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [rooms, setRooms] = useState([])
    const [roomTypes, setRoomTypes] = useState([])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const [hoveredBooking, setHoveredBooking] = useState(null)
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
    
    // Drag & Drop state
    const [draggedBooking, setDraggedBooking] = useState(null)
    const [dragSelect, setDragSelect] = useState(null)
    const [collapsedGroups, setCollapsedGroups] = useState({})

    const [isCompact, setIsCompact] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [hkMode, setHkMode] = useState(false)
    const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, booking: null })

    // Close context menu on generic clicks
    useEffect(() => {
        const handleClick = () => setContextMenu(prev => prev.isOpen ? { ...prev, isOpen: false } : prev)
        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [])

    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filterConfig, setFilterConfig] = useState({
        status: ['pending', 'confirmed', 'checked_in'],
        roomTypeId: 'All',
    })

    const [showAvailableOnly, setShowAvailableOnly] = useState(false)
    const [viewMode, setViewMode] = useState('month') // 'day'|'3day'|'week'|'2week'|'month'
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: 'warning', onConfirm: () => {} })
    const [createModal, setCreateModal] = useState({ isOpen: false, initialData: {} })
    const [hkTooltip, setHkTooltip] = useState({ isOpen: false, room: null, x: 0, y: 0 })
    const [loadingHk, setLoadingHk] = useState({})
    const [avTooltip, setAvTooltip] = useState({ isOpen: false, dStr: null, metrics: null, x: 0, y: 0 })

    // ── Data fetching ─────────────────────────────────────────────────────────
    // Helper: get the fetch date range for the current view
    const getRange = (date, mode) => {
        const start = new Date(date); start.setHours(0, 0, 0, 0)
        if (mode === 'day')   { const end = new Date(start); end.setDate(end.getDate() + 1); return { start, end } }
        if (mode === '3day')  { const end = new Date(start); end.setDate(end.getDate() + 3); return { start, end } }
        if (mode === 'week')  {
            const dow = date.getDay() === 0 ? 6 : date.getDay() - 1
            start.setDate(date.getDate() - dow)
            const end = new Date(start); end.setDate(start.getDate() + 7)
            return { start, end }
        }
        if (mode === '2week') {
            const dow = date.getDay() === 0 ? 6 : date.getDay() - 1
            start.setDate(date.getDate() - dow)
            const end = new Date(start); end.setDate(start.getDate() + 14)
            return { start, end }
        }
        if (mode === 'availability') {
            start.setDate(1)
            const end = new Date(start); end.setMonth(end.getMonth() + 6)
            return { start, end }
        }
        // month
        start.setDate(1)
        const end = new Date(start); end.setMonth(end.getMonth() + 1)
        return { start, end }
    }

    useEffect(() => {
        if (!user) return
        if (createModal.isOpen || isDetailOpen) return
        fetchData()
        const iv = setInterval(() => {
            const hotelId = currentHotel?.id
            if (!hotelId) return
            const { start, end } = getRange(currentDate, viewMode)
            Promise.all([
                apiFetch(`/bookings/admin/calendar-events?hotelId=${hotelId}&start=${start.toISOString()}&end=${end.toISOString()}`),
                apiFetch(`/rooms?hotelId=${hotelId}`)
            ]).then(([ev, rm]) => { setEvents(ev); setRooms(rm) }).catch(console.error)
        }, 15000)
        return () => clearInterval(iv)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate, viewMode, user, currentHotel, createModal.isOpen, isDetailOpen])

    // Handle GlobalSearch jump-to-date via query params
    useEffect(() => {
        if (router.query.date) {
            const d = new Date(router.query.date);
            if (!isNaN(d.getTime())) setCurrentDate(d);
        }
        if (router.query.highlight) {
            setSearchQuery(router.query.highlight);
        }
        // Clean up query params after consuming them
        if (router.query.date || router.query.highlight) {
            router.replace('/admin/calendar', undefined, { shallow: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query.date, router.query.highlight]);


    // Handle global mouse up for drag-to-select booking
    useEffect(() => {
        if (!dragSelect) return;
        const handleUp = () => {
            const s = new Date(Math.min(dragSelect.start, dragSelect.current));
            const e = new Date(Math.max(dragSelect.start, dragSelect.current));
            e.setDate(e.getDate() + 1); // booking spans nights, checkout is next day
            
            const offset = s.getTimezoneOffset();
            const localCheckIn = new Date(s.getTime() - offset * 60000);
            const localCheckOut = new Date(e.getTime() - offset * 60000);
            
            const r = rooms.find(rm => rm.id === dragSelect.roomId);
            if (r) {
                setCreateModal({ 
                    isOpen: true, 
                    initialData: { 
                        roomId: r.id, 
                        roomTypeId: r.roomTypeId, 
                        checkIn: localCheckIn.toISOString().split('T')[0], 
                        checkOut: localCheckOut.toISOString().split('T')[0] 
                    } 
                });
            }
            setDragSelect(null);
        };
        window.addEventListener('mouseup', handleUp);
    }, [dragSelect, rooms]);

    useEffect(() => {
        setAvTooltip(p => ({ ...p, isOpen: false }));
        setHkTooltip(p => ({ ...p, isOpen: false }));
    }, [viewMode, currentDate]);



    const fetchData = async () => {
        const hotelId = currentHotel?.id
        if (!hotelId) return
        setLoading(true)
        try {
            const { start, end } = getRange(currentDate, viewMode)
            const [rm, tp, ev] = await Promise.all([
                apiFetch(`/rooms?hotelId=${hotelId}`),
                apiFetch(`/room-types?hotelId=${hotelId}`),
                apiFetch(`/bookings/admin/calendar-events?hotelId=${hotelId}&start=${start.toISOString()}&end=${end.toISOString()}`)
            ])
            setRooms(rm); setRoomTypes(tp); setEvents(ev)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const manualRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false) }

    // ── Days ──────────────────────────────────────────────────────────────────
    const days = useMemo(() => {
        const { start, end } = getRange(currentDate, viewMode)
        const d = []
        const cur = new Date(start)
        while (cur < end) { d.push(new Date(cur)); cur.setDate(cur.getDate() + 1) }
        return d
    }, [currentDate, viewMode])

    // Column pixel width scales with number of days shown
    const COL_MIN_W = viewMode === 'day' ? 200 : viewMode === '3day' ? 160 : viewMode === 'week' ? 100 : viewMode === '2week' ? 56 : 48

    const isToday = d => d.toDateString() === new Date().toDateString()
    const isWeekend = d => d.getDay() === 0 || d.getDay() === 6

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const todayStr = new Date().toDateString()
        const t = new Date()
        return {
            inHouse:    events.filter(e => e.status === 'checked_in' && new Date(e.checkIn) <= t && new Date(e.checkOut) > t).length,
            arrivals:   events.filter(e => new Date(e.checkIn).toDateString() === todayStr && e.status !== 'cancelled').length,
            departures: events.filter(e => new Date(e.checkOut).toDateString() === todayStr && e.status !== 'cancelled').length,
            pending:    events.filter(e => e.status === 'pending').length,
        }
    }, [events])

    // ── Availability helpers ───────────────────────────────────────────────────
    const isRoomFreeOnDay = (roomId, day) => {
        const s = new Date(day); s.setHours(0, 0, 0, 0)
        const e = new Date(day); e.setHours(23, 59, 59, 999)
        return !events.some(ev =>
            ev.roomId === roomId &&
            filterConfig.status.includes(ev.status) &&
            new Date(ev.checkIn) < e && new Date(ev.checkOut) > s
        )
    }

    const availabilityMetrics = useMemo(() => {
        const map = {}
        const totalRooms = rooms.length
        
        days.forEach(day => {
            const s = new Date(day); s.setHours(0, 0, 0, 0)
            const e = new Date(day); e.setHours(23, 59, 59, 999)
            
            // Active bookings for this day
            const act = events.filter(ev => filterConfig.status.includes(ev.status) && new Date(ev.checkIn) < e && new Date(ev.checkOut) > s)
            const bookedRoomIds = new Set(act.map(ev => ev.roomId))
            
            // Build type breakdown
            const typeBreakdown = roomTypes.map(type => {
                const tr = rooms.filter(r => r.roomTypeId === type.id)
                const bookedCount = tr.filter(r => bookedRoomIds.has(r.id)).length
                return {
                    name: type.name,
                    total: tr.length,
                    available: tr.length - bookedCount
                }
            })

            const available = Math.max(0, totalRooms - bookedRoomIds.size)
            
            map[day.toDateString()] = {
                total: totalRooms,
                available,
                occupancy: totalRooms > 0 ? Math.round((bookedRoomIds.size / totalRooms) * 100) : 0,
                typeBreakdown
            }
        })
        return map
    }, [days, events, rooms, roomTypes, filterConfig.status])

    const roomHasAnyFreeDay = roomId => days.some(d => isRoomFreeOnDay(roomId, d))

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleHkCycle = async (room, e) => {
        if (e) e.stopPropagation()
        if (room.status === 'OOO') {
            toast.error('Cannot quick-toggle Out-of-Order room.')
            return
        }
        
        let next = 'DIRTY'
        if (room.status === 'DIRTY') next = 'CLEANING'
        else if (room.status === 'CLEANING') next = 'CLEAN'
        else if (room.status === 'CLEAN') next = 'INSPECTED'
        else if (room.status === 'INSPECTED') next = 'DIRTY'
        else if (room.status === 'OCCUPIED') next = 'DIRTY'

        setLoadingHk(p => ({ ...p, [room.id]: true }))
        try {
            await apiFetch(`/rooms/${room.id}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: next })
            })
            setRooms(rooms => rooms.map(r => r.id === room.id ? { ...r, status: next } : r))
            toast.success(`Room ${room.roomNumber} marked as ${HK_CONFIG[next]?.label}`)
            setHkTooltip((p) => p.isOpen && p.room?.id === room.id ? { ...p, isOpen: false } : p)
        } catch(err) {
            toast.error('Failed to update status')
            fetchData() // rollback on error
        } finally {
            setLoadingHk(p => ({ ...p, [room.id]: false }))
        }
    }

    const openDetails = b => { setSelectedBooking(b); setIsDetailOpen(true); setHoveredBooking(null) }

    const handleCellClick = (room, date) => {
        const offset = date.getTimezoneOffset()
        const local = new Date(date.getTime() - offset * 60000)
        setCreateModal({ isOpen: true, initialData: { roomId: room.id, roomTypeId: room.roomTypeId, checkIn: local.toISOString().split('T')[0] } })
    }

    // ── Drag & Drop Handlers ──────────────────────────────────────────────────
    const handleDrop = async (room, date) => {
        if (!draggedBooking) return;

        const nights = Math.ceil((new Date(draggedBooking.checkOut) - new Date(draggedBooking.checkIn)) / 86400000);
        const newCheckIn = new Date(date);
        const newCheckOut = new Date(date);
        newCheckOut.setDate(newCheckIn.getDate() + nights);

        const todayZero = new Date(); todayZero.setHours(0,0,0,0);
        if (newCheckIn < todayZero) {
            toast.error("Cannot reschedule bookings into the past.", { id: 'drag-err' });
            setDraggedBooking(null); return;
        }
        if (draggedBooking.status === 'checked_in' || draggedBooking.status === 'checked_out') {
            toast.error("Active or completed bookings cannot be rescheduled.", { id: 'drag-err' });
            setDraggedBooking(null); return;
        }
        if (room.status === 'DIRTY' || room.status === 'OOO') {
            toast.error(`Cannot move guest to a ${room.status} room!`, { id: 'drag-err' });
            setDraggedBooking(null); return;
        }

        // Allow dropping on exact same dates if room changed
        if (draggedBooking.roomId === room.id && new Date(draggedBooking.checkIn).getTime() === newCheckIn.getTime()) {
            setDraggedBooking(null);
            return; 
        }

        const srcType = roomTypes.find(t => t.id === draggedBooking.roomTypeId);
        const dstType = roomTypes.find(t => t.id === room.roomTypeId);
        const isCrossType = srcType && dstType && srcType.id !== dstType.id;
        const crossTypeWarning = isCrossType ? `\n\nRoom type change: ${srcType.name} -> ${dstType.name}` : '';

        setConfirmModal({
            isOpen: true,
            title: isCrossType ? 'Room Type Change' : 'Confirm Reschedule',
            message: `Move ${draggedBooking.leadName} to Room ${room.roomNumber || room.id.slice(-4)} (${newCheckIn.toLocaleDateString('en-GB')} to ${newCheckOut.toLocaleDateString('en-GB')})?${crossTypeWarning}`,
            type: isCrossType ? 'danger' : 'warning',
            onConfirm: async () => {
                const hotelId = currentHotel?.id;
                try {
                    await apiFetch(`/bookings/admin/${draggedBooking.id}/reschedule?hotelId=${hotelId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            roomId: room.id,
                            checkIn: newCheckIn.toISOString(),
                            checkOut: newCheckOut.toISOString()
                        })
                    });
                    toast.success('Booking rescheduled successfully!');
                    fetchData();
                } catch (error) {
                    toast.error(error.message || 'Failed to reschedule booking.');
                }
            }
        });

        setDraggedBooking(null);
    }

    const updateStatus = (id, newStatus) => {
        setConfirmModal({
            isOpen: true,
            title: 'Update Booking Status',
            message: `Change status to "${newStatus.replace('_', ' ')}"?`,
            type: newStatus === 'cancelled' ? 'danger' : 'warning',
            onConfirm: async () => {
                try {
                    const hotelId = currentHotel?.id
                    await apiFetch(`/bookings/admin/${id}/status${hotelId ? `?hotelId=${hotelId}` : ''}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    })
                    fetchData(); setIsDetailOpen(false)
                } catch { toast.error('Update failed') }
            }
        })
    }

    const formatDuration = ds => {
        if (!ds) return '-'
        const diff = Date.now() - new Date(ds); const m = Math.floor(diff / 60000)
        const h = Math.floor(m / 60); const d = Math.floor(h / 24)
        return d > 0 ? `${d}d` : h > 0 ? `${h}h ${m % 60}m` : `${m}m`
    }

    const filteredTypes = roomTypes.filter(t => filterConfig.roomTypeId === 'All' || t.id === filterConfig.roomTypeId)
    const hasFilter = filterConfig.roomTypeId !== 'All' || filterConfig.status.length < 3 || hkMode || searchQuery

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-64px)] gap-2 relative">

                {/* ── Header Controls ── */}
                <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    
                    {/* Top Row: Core Nav & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Title */}
                            <h1 className="text-lg font-bold dark:text-white flex items-center gap-2 mr-2">
                                <CalendarIcon size={18} className="text-blue-500 shrink-0" />
                                Booking Calendar
                            </h1>

                            {/* View toggle */}
                            <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 text-xs font-bold gap-0.5">
                                {[
                                    { key: 'day',   label: 'Day' },
                                    { key: '3day',  label: '3D' },
                                    { key: 'week',  label: 'Week' },
                                    { key: '2week', label: '2W' },
                                    { key: 'month', label: 'Month' },
                                    { key: 'availability', label: 'Availability' },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setViewMode(key)}
                                        className={`px-2.5 py-1 rounded-md transition-all ${
                                            viewMode === key
                                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Nav: prev / label / next */}
                            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
                                <button onClick={() => {
                                    const d = new Date(currentDate)
                                    const delta = { day: 1, '3day': 3, week: 7, '2week': 14, month: 0, availability: 0 }[viewMode]
                                    delta ? d.setDate(d.getDate() - delta) : d.setMonth(d.getMonth() - (viewMode === 'availability' ? 6 : 1))
                                    setCurrentDate(d)
                                }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-r border-slate-200 dark:border-slate-700">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={() => setCurrentDate(new Date())} className="px-3 font-bold text-sm dark:text-white select-none min-w-[140px] text-center hover:text-blue-500 transition-colors" title="Go to Today">
                                    {viewMode === 'month'
                                        ? currentDate.toLocaleString('th-TH', { month: 'short', year: 'numeric' })
                                        : viewMode === 'availability'
                                        ? (() => {
                                            const endD = new Date(currentDate); endD.setMonth(endD.getMonth() + 5);
                                            return `${currentDate.toLocaleString('th-TH', { month: 'short', year: 'numeric' })} – ${endD.toLocaleString('th-TH', { month: 'short', year: 'numeric' })}`;
                                          })()
                                        : viewMode === 'day'
                                        ? days[0]?.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                                        : `${days[0]?.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} – ${days[days.length-1]?.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                </button>
                                <button onClick={() => {
                                    const d = new Date(currentDate)
                                    const delta = { day: 1, '3day': 3, week: 7, '2week': 14, month: 0, availability: 0 }[viewMode]
                                    delta ? d.setDate(d.getDate() + delta) : d.setMonth(d.getMonth() + (viewMode === 'availability' ? 6 : 1))
                                    setCurrentDate(d)
                                }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-l border-slate-200 dark:border-slate-700">
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Refresh & Compact */}
                            <div className="flex items-center gap-1">
                                <button onClick={manualRefresh} title="Refresh"
                                    className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${refreshing ? 'animate-spin text-blue-500' : 'text-slate-500'}`}>
                                    <RefreshCw size={14} />
                                </button>
                                
                                <button
                                    onClick={() => setIsCompact(!isCompact)}
                                    className={`p-1.5 flex items-center gap-1 text-[10px] font-bold rounded-lg border transition-colors ${
                                        isCompact ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                                    title="Toggle Compact Mode"
                                >
                                    {isCompact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                                    <span className="hidden sm:inline">{isCompact ? 'Expand' : 'Compact'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Top Right: Actions */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCreateModal({ isOpen: true, initialData: {} })}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
                                <Plus size={13} />
                                <span className="hidden sm:inline">New Booking</span>
                                <span className="sm:hidden">New</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row: State & Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                        {/* Status Stats */}
                        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-medium">
                            {[
                                { label: 'In House',  value: stats.inHouse,    dot: 'bg-teal-500' },
                                { label: 'Arrivals',  value: stats.arrivals,   dot: 'bg-sky-500' },
                                { label: 'Depart',    value: stats.departures, dot: 'bg-violet-500' },
                                { label: 'Pending',   value: stats.pending,    dot: stats.pending > 0 ? 'bg-amber-500' : 'bg-slate-300', warn: stats.pending > 0 },
                            ].map(({ label, value, dot, warn }) => (
                                <span key={label} className={`flex items-center gap-1 px-2 py-1 rounded-full border shadow-sm ${
                                    warn ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400'
                                         : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                                    <b>{value}</b> {label}
                                </span>
                            ))}
                        </div>

                        {/* Filters list */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setShowAvailableOnly(v => !v)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                    showAvailableOnly
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                                }`}
                            >
                                {showAvailableOnly ? <Eye size={12} /> : <EyeOff size={12} />}
                                <span className="hidden sm:inline">{showAvailableOnly ? 'Available' : 'Show Available'}</span>
                            </button>

                            <div className="relative">
                                <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold border rounded-lg transition-colors ${
                                        isFilterOpen ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white'}`}>
                                    <Filter size={12} />
                                    <span className="hidden sm:inline">Filter</span>
                                    {hasFilter && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute right-0 top-9 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 z-40">
                                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Booking Status</p>
                                        <div className="grid grid-cols-2 gap-1.5 mb-4">
                                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                <button key={key}
                                                    onClick={() => {
                                                        const updated = filterConfig.status.includes(key)
                                                            ? filterConfig.status.filter(s => s !== key)
                                                            : [...filterConfig.status, key]
                                                        setFilterConfig({ ...filterConfig, status: updated })
                                                    }}
                                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                        filterConfig.status.includes(key)
                                                            ? 'border-transparent text-white ' + cfg.bar.split(' ')[0]
                                                            : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {cfg.label}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Room Type</p>
                                        <select
                                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-xs"
                                            value={filterConfig.roomTypeId}
                                            onChange={e => setFilterConfig({ ...filterConfig, roomTypeId: e.target.value })}
                                        >
                                            <option value="All">All Room Types</option>
                                            {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setHkMode(!hkMode)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold border rounded-lg transition-colors ${
                                    hkMode ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-900/30 dark:border-rose-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                                }`}
                                title="Housekeeping Target List"
                            >
                                <Sparkles size={12} />
                                <span className="hidden xl:inline">HK Mode</span>
                            </button>

                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Guest/Room..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Escape') { setSearchQuery(''); e.target.blur(); } }}
                                    className="pl-8 pr-3 py-1.5 w-32 xl:w-48 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── DAY STATUS BOARD ─────────────────────────────────────── */}
                {viewMode === 'day' ? (
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0">
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        {['Room','Type','HK','Guest','Check-In','Check-Out','Nights','Status',''].map(h => (
                                            <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                    {loading ? (
                                        <tr><td colSpan={9} className="py-16 text-center text-slate-400">Loading…</td></tr>
                                    ) : filteredTypes.map(type => {
                                        const typeRooms = rooms.filter(r => r.roomTypeId === type.id)
                                        if (typeRooms.length === 0) return null
                                        
                                        let visibleRooms = showAvailableOnly ? typeRooms.filter(r => !events.some(e => e.roomId === r.id && filterConfig.status.includes(e.status) && new Date(e.checkIn) <= new Date(days[0].setHours(23,59,59)) && new Date(e.checkOut) > days[0])) : typeRooms
                                        
                                        if (hkMode) {
                                            visibleRooms = visibleRooms.filter(r => ['DIRTY', 'CLEANING'].includes(r.status))
                                        }
                                        if (searchQuery) {
                                            const lowerQ = searchQuery.toLowerCase()
                                            visibleRooms = visibleRooms.filter(r => {
                                                const matchesRoom = (r.roomNumber || r.id.slice(-4)).toLowerCase().includes(lowerQ)
                                                const todayEnd = new Date(days[0]); todayEnd.setHours(23,59,59)
                                                const active = events.find(e => e.roomId === r.id && new Date(e.checkIn) < todayEnd && new Date(e.checkOut) > days[0])
                                                const matchesGuest = active?.leadName?.toLowerCase().includes(lowerQ)
                                                return matchesRoom || matchesGuest
                                            })
                                        }

                                        if (visibleRooms.length === 0) return null

                                        return (
                                            <React.Fragment key={type.id}>
                                                <tr onClick={() => setCollapsedGroups(p => ({...p, [type.id]: !p[type.id]}))} className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                    <td colSpan={9} className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                        <div className="flex items-center justify-between">
                                                            <div><Layers size={11} className="inline mr-1" /> {type.name} <span className="ml-1 opacity-50 font-medium normal-case">({visibleRooms.length})</span></div>
                                                            {collapsedGroups[type.id] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {!collapsedGroups[type.id] && visibleRooms.map(room => {
                                                    const hk = HK_CONFIG[room.status] || HK_CONFIG.CLEAN
                                                    const today = days[0]
                                                    const todayEnd = new Date(today); todayEnd.setHours(23,59,59)
                                                    const active = events.find(e =>
                                                        e.roomId === room.id &&
                                                        filterConfig.status.includes(e.status) &&
                                                        new Date(e.checkIn) < todayEnd && new Date(e.checkOut) > today
                                                    )
                                            const isFree = !active
                                            const cfg = active ? STATUS_CONFIG[active.status] : null
                                            const nights = active ? Math.ceil((new Date(active.checkOut) - new Date(active.checkIn)) / 86400000) : 0
                                            const isCheckingIn  = active && new Date(active.checkIn).toDateString() === today.toDateString()
                                            const isCheckingOut = active && new Date(active.checkOut).toDateString() === today.toDateString()

                                            if (showAvailableOnly && !isFree) return null

                                            // 🚨 Handle discrepancy (Room physically OCCUPIED by HK, but no active booking in system)
                                            const isDiscrepancy = isFree && room.status === 'OCCUPIED'
                                            const rowBgColor = isDiscrepancy ? 'bg-rose-50/50 hover:bg-rose-100/50 dark:bg-rose-900/10 dark:hover:bg-rose-900/20' 
                                                             : (isFree ? 'hover:bg-teal-50/20 dark:hover:bg-teal-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/20')

                                                const isLiveDate = isToday(today);
                                                return (
                                                <tr key={room.id} className={`group transition-colors ${rowBgColor}`}>
                                                    <td className={`px-3 ${isCompact ? 'py-1' : 'py-2.5'} font-bold text-slate-800 dark:text-white`}>{room.roomNumber || room.id.slice(-4)}</td>
                                                    <td className={`px-3 ${isCompact ? 'py-1' : 'py-2.5'} text-slate-500`}>{type.name}</td>
                                                    <td className={`px-3 ${isCompact ? 'py-1' : 'py-2.5'}`}>
                                                        <button 
                                                            onClick={(e) => { if(isLiveDate) handleHkCycle(room, e) }}
                                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center w-max gap-1 outline-none ${hk.color} ${!isLiveDate ? 'opacity-40 cursor-not-allowed' : loadingHk[room.id] ? 'opacity-70 cursor-wait' : 'hover:brightness-95 transition-all cursor-pointer'}`}
                                                            title={isLiveDate ? "Click to cycle status" : "HK Status is real-time. It cannot be altered on past or future dates."}
                                                        >
                                                            <span className="opacity-70">
                                                                {loadingHk[room.id] ? <RefreshCw size={10} className="animate-spin" /> : hk.icon}
                                                            </span> 
                                                            {room.status === 'INSPECTED' ? 'RDY' : (room.status || 'CLN').slice(0,3)}
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        {active ? (
                                                            <div>
                                                                <div className="font-bold text-slate-800 dark:text-white">{active.leadName}</div>
                                                                <div className="text-slate-400 text-[10px] flex items-center gap-1"><User size={9}/> {active.guestsAdult + active.guestsChild} pax</div>
                                                            </div>
                                                        ) : isDiscrepancy ? (
                                                            <span className="text-rose-600 font-bold text-[10px] flex items-center gap-1"><AlertCircle size={11}/> DISCREPANCY (GHOST OCCUPANT)</span>
                                                        ) : (
                                                            <span className="text-teal-600/70 dark:text-teal-500/70 font-medium text-[11px]">Available</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                                        {active ? (
                                                            <span className={isCheckingIn ? 'text-blue-600 font-bold' : 'text-slate-500'}>
                                                                {new Date(active.checkIn).toLocaleDateString('en-GB')}
                                                                {isCheckingIn && <span className="ml-1 text-[9px] bg-blue-100 text-blue-600 px-1 rounded">TODAY</span>}
                                                            </span>
                                                        ) : <span className="text-slate-200 dark:text-slate-700">-</span>}
                                                    </td>
                                                    <td className={`px-3 ${isCompact ? 'py-1' : 'py-2.5'} whitespace-nowrap`}>
                                                        {active ? (
                                                            <span className={isCheckingOut ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                                                                {new Date(active.checkOut).toLocaleDateString('en-GB')}
                                                                {isCheckingOut && <span className="ml-1 text-[9px] bg-amber-100 text-amber-600 px-1 rounded">TODAY</span>}
                                                            </span>
                                                        ) : <span className="text-slate-200 dark:text-slate-700">-</span>}
                                                    </td>
                                                    <td className={`px-3 ${isCompact ? 'py-1' : 'py-2.5'} text-slate-500`}>{active ? `${nights}N` : <span className="text-slate-200 dark:text-slate-700">-</span>}</td>
                                                    <td className={`px-3 ${isCompact ? 'py-1' : 'py-2.5'}`}>
                                                        {cfg ? (
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${cfg.bar.split(' ')[0]}`}>
                                                                {cfg.label}
                                                            </span>
                                                        ) : isDiscrepancy ? (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">CHECK HK</span>
                                                        ) : <span className="bg-teal-50 text-teal-600/80 dark:bg-teal-900/30 dark:text-teal-400 font-bold text-[9px] px-1.5 py-0.5 rounded">FREE</span>}
                                                    </td>
                                                    <td className={`px-3 ${isCompact ? 'py-1' : 'py-2.5'} text-right`}>
                                                        {active ? (
                                                            <button onClick={() => openDetails(active)} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-slate-400 hover:text-blue-500 transition-colors">
                                                                <Eye size={14}/>
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleCellClick(room, today)} className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-600 hover:border-transparent hover:text-white dark:hover:bg-blue-600 rounded transition-all opacity-0 group-hover:opacity-100">
                                                                + Book
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                                })}
                                            </React.Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : viewMode === 'availability' ? (
                    <AvailabilityMatrix
                        currentDate={currentDate}
                        rooms={rooms}
                        availabilityMetrics={availabilityMetrics}
                        setAvTooltip={setAvTooltip}
                        setCurrentDate={setCurrentDate}
                        setViewMode={setViewMode}
                    />
                ) : (
                    <>
                        {/* Outer: full height, clips to create the "panel" */}
                        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0">

                    {/* SCROLL WRAPPER — this one scrolls horizontally */}
                    <div className="flex-1 overflow-auto">
                        {/* Inner: min-width ensures columns never collapse below usable size */}
                        <div style={{ minWidth: `${ROOM_COL + days.length * COL_MIN_W}px` }}>

                            {/* Sticky day-header row */}
                            <div className="flex sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                                {/* Room column label */}
                                <div
                                    className="flex-shrink-0 px-3 py-2 font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider flex items-center sticky left-0 z-30"
                                    style={{ width: ROOM_COL }}
                                >
                                    Room
                                </div>
                                {/* Day cells */}
                                {days.map(day => {
                                    const today = isToday(day)
                                    const metrics = availabilityMetrics[day.toDateString()]
                                    const avail = metrics?.available ?? 0
                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`flex-1 py-1 text-center border-r border-slate-100 dark:border-slate-700/60 relative ${
                                                today ? 'bg-blue-50/50 dark:bg-blue-900/10 border-b-2 !border-b-rose-500' : isWeekend(day) ? 'bg-slate-50 dark:bg-slate-900/50' : ''
                                            }`}
                                            style={{ minWidth: COL_MIN_W }}
                                        >
                                            <div className={`text-[9px] uppercase font-bold ${today ? 'text-blue-600' : isWeekend(day) ? 'text-rose-500/80 dark:text-rose-400/80' : 'text-slate-400'}`}>
                                                {viewMode === 'week'
                                                    ? day.toLocaleString('en-US', { weekday: 'short' })
                                                    : day.toLocaleString('en-US', { weekday: 'short' }).charAt(0)}
                                            </div>
                                            <div className={`text-[11px] font-bold mx-auto leading-none mt-0.5 ${
                                                today
                                                    ? 'w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-sm'
                                                    : isWeekend(day) ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
                                            }`}>
                                                {day.getDate()}
                                            </div>
                                            <div className={`text-[8px] font-bold mt-0.5 leading-none ${
                                                avail === 0 ? 'text-rose-400' : avail <= 5 ? 'text-amber-500' : 'text-teal-500 dark:text-teal-400'
                                            }`}>
                                                {avail === 0 ? '●' : avail}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Body rows */}
                            {loading ? (
                                <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm">Loading…</span>
                                </div>
                            ) : filteredTypes.map(type => {
                                const typeRooms = rooms.filter(r => r.roomTypeId === type.id)
                                if (!typeRooms.length) return null
                                let visibleRooms = showAvailableOnly ? typeRooms.filter(r => roomHasAnyFreeDay(r.id)) : typeRooms

                                if (hkMode) visibleRooms = visibleRooms.filter(r => ['DIRTY', 'CLEANING'].includes(r.status))
                                if (searchQuery) {
                                    const lowerQ = searchQuery.toLowerCase()
                                    visibleRooms = visibleRooms.filter(r => {
                                        const matchesRoom = (r.roomNumber || r.id.slice(-4)).toLowerCase().includes(lowerQ)
                                        const roomEvs = events.filter(e => e.roomId === r.id)
                                        const matchesGuest = roomEvs.some(e => e.leadName?.toLowerCase().includes(lowerQ))
                                        return matchesRoom || matchesGuest
                                    })
                                }

                                if (visibleRooms.length === 0) return null

                                return (
                                    <div key={type.id}>
                                        {/* Room type group header */}
                                        <div 
                                          onClick={() => setCollapsedGroups(p => ({...p, [type.id]: !p[type.id]}))}
                                          className="flex items-center justify-between px-3 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-y border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors sticky left-0 z-10"
                                        >
                                            <div className="flex items-center gap-2">
                                              <Layers size={14} className="text-blue-500" />
                                              {type.name}
                                              <span className="ml-2 font-medium normal-case text-[9px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded shadow-sm">
                                                  {showAvailableOnly ? `${visibleRooms.length} available` : `${typeRooms.length} units`}
                                              </span>
                                            </div>
                                            {collapsedGroups[type.id] ? <ChevronRight size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                                        </div>

                                        {/* Room rows */}
                                        {!collapsedGroups[type.id] && visibleRooms.map(room => {
                                            const hk = HK_CONFIG[room.status] || HK_CONFIG.CLEAN
                                            const roomEvents = events.filter(e => e.roomId === room.id && filterConfig.status.includes(e.status))

                                            return (
                                                <div key={room.id} className={`flex border-b border-slate-100 dark:border-slate-700/50 relative hover:bg-slate-100/60 dark:hover:bg-slate-700/30 transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/40 ${isCompact ? 'h-8' : 'h-12'}`}>

                                                    {/* Room label — sticky left */}
                                                    <div
                                                        className="flex-shrink-0 px-2 py-1 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky left-0 z-10 shadow-sm flex items-center justify-between gap-1"
                                                        style={{ width: ROOM_COL }}
                                                    >
                                                        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 truncate">
                                                            {room.roomNumber || room.id.slice(-4)}
                                                        </span>
                                                        <button
                                                            onClick={(e) => handleHkCycle(room, e)}
                                                            onMouseEnter={e => {
                                                                const r = e.currentTarget.getBoundingClientRect()
                                                                setHkTooltip({ isOpen: true, room, x: r.right + 6, y: r.top })
                                                            }}
                                                            onMouseLeave={() => setHkTooltip(p => ({ ...p, isOpen: false }))}
                                                            className={`text-[8px] font-bold px-1 py-0.5 rounded flex-shrink-0 flex items-center gap-0.5 hover:brightness-95 transition-all outline-none ${hk.color} ${loadingHk[room.id] ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
                                                            title="Click to cycle status"
                                                        >
                                                            <span className="flex items-center justify-center opacity-90">
                                                                {loadingHk[room.id] ? <RefreshCw size={10} className="animate-spin" /> : hk.icon}
                                                            </span> 
                                                            {room.status === 'INSPECTED' ? 'RDY' : (room.status || 'CLN').slice(0, 3)}
                                                        </button>
                                                    </div>

                                                    {/* Day grid cells */}
                                                    {days.map(day => {
                                                        const free = isRoomFreeOnDay(room.id, day)
                                                        const isDragTarget = draggedBooking?.roomId !== room.id || new Date(draggedBooking?.checkIn).getTime() !== day.getTime()
                                                        const isSelected = dragSelect?.roomId === room.id && 
                                                            day.getTime() >= Math.min(dragSelect.start.getTime(), dragSelect.current.getTime()) && 
                                                            day.getTime() <= Math.max(dragSelect.start.getTime(), dragSelect.current.getTime());
                                                        return (
                                                            <div
                                                                key={day.toISOString()}
                                                                onMouseDown={(e) => {
                                                                    if (e.button !== 0) return;
                                                                    e.preventDefault();
                                                                    setDragSelect({ roomId: room.id, start: day, current: day });
                                                                }}
                                                                onMouseEnter={() => {
                                                                    if (dragSelect && dragSelect.roomId === room.id) {
                                                                        setDragSelect(p => p ? { ...p, current: day } : p);
                                                                    }
                                                                }}
                                                                onDragOver={(e) => { 
                                                                    e.preventDefault(); 
                                                                    const tZ = new Date(); tZ.setHours(0,0,0,0);
                                                                    if (room.status === 'DIRTY' || room.status === 'OOO' || day < tZ || draggedBooking?.status === 'checked_in') {
                                                                        e.dataTransfer.dropEffect = 'none';
                                                                    } else {
                                                                        e.dataTransfer.dropEffect = 'move';
                                                                    }
                                                                }}
                                                                onDrop={(e) => { e.preventDefault(); handleDrop(room, day); }}
                                                                title={free ? (isSelected ? 'Release to book selected days' : 'ว่าง — คลิกและลากเพื่อจอง') : 'มีการจองแล้ว'}
                                                                style={{ minWidth: COL_MIN_W }}
                                                                className={`flex-1 border-r border-slate-50 dark:border-slate-700/30 h-full cursor-pointer transition-colors relative group overflow-hidden select-none ${
                                                                    isSelected ? 'bg-blue-500/20 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.5)] z-20' : ''
                                                                } ${
                                                                    !isSelected && isToday(day)
                                                                        ? free ? 'bg-rose-50/20 dark:bg-rose-900/10' : 'bg-rose-100/20 dark:bg-rose-900/20'
                                                                        : !isSelected && free
                                                                        ? (isWeekend(day) ? 'bg-slate-50/60 dark:bg-slate-900/30 hover:bg-teal-100/60' : 'bg-teal-50/20 dark:bg-teal-900/5 hover:bg-teal-100/60')
                                                                        : !isSelected
                                                                        ? (isWeekend(day) ? 'bg-slate-100/40 dark:bg-slate-800/40 hover:bg-slate-200/40' : 'hover:bg-slate-100/60 dark:hover:bg-slate-700/20')
                                                                        : ''
                                                                } ${draggedBooking && isDragTarget ? 'hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 ring-inset ring-2 ring-transparent hover:ring-indigo-400' : ''}`}
                                                            >
                                                                {isToday(day) && <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-rose-500/30 -translate-x-1/2 pointer-events-none" />}
                                                                {free && !isSelected && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-blue-600/50 font-bold text-[10px] bg-blue-100/40 backdrop-blur-[1px]">+ Book</div>}
                                                            </div>
                                                        )
                                                    })}

                                                    {/* Booking bars */}
                                                    {roomEvents.map(booking => {
                                                        const ci = new Date(booking.checkIn)
                                                        const co = new Date(booking.checkOut)
                                                        const vs = days[0]
                                                        const ve = new Date(days[days.length - 1]); ve.setHours(23, 59, 59)
                                                        if (co <= vs || ci > ve) return null

                                                        const startDate = ci < vs ? vs : ci
                                                        const endDate = co > ve ? ve : co
                                                        const startOffset = startDate.getDate() - 1
                                                        const duration = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
                                                        const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed
                                                        const isPaid = booking.payment?.status === 'authorized' || booking.payment?.status === 'captured'

                                                        // OTA bookings get a diagonal stripe pattern overlay
                                                        const isOTA = booking.source === 'OTA'
                                                        const barBase = isOTA
                                                            ? 'bg-violet-500 border-violet-700'
                                                            : cfg.bar
                                                        const textCls = isOTA ? 'text-white' : (cfg.textColor || 'text-white')

                                                        // Search highlighting
                                                        const isMatch = searchQuery ? (booking.leadName?.toLowerCase().includes(searchQuery.toLowerCase()) || (room.roomNumber || room.id).toLowerCase().includes(searchQuery.toLowerCase())) : true
                                                        const searchOpacity = searchQuery && !isMatch ? 'opacity-30 grayscale' : 'opacity-100'

                                                        return (
                                                            <div
                                                                key={booking.id}
                                                                draggable={booking.status !== 'checked_in' && booking.status !== 'checked_out'}
                                                                onDragStart={(e) => {
                                                                    if (booking.status === 'checked_in' || booking.status === 'checked_out') {
                                                                        e.preventDefault(); return;
                                                                    }
                                                                    setDraggedBooking(booking);
                                                                    e.dataTransfer.effectAllowed = 'move';
                                                                }}
                                                                onDragEnd={() => setDraggedBooking(null)}
                                                                onClick={e => { e.stopPropagation(); openDetails(booking) }}
                                                                onContextMenu={e => { 
                                                                    e.preventDefault(); e.stopPropagation(); 
                                                                    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, booking });
                                                                    setHoveredBooking(null);
                                                                }}
                                                                onMouseEnter={e => {
                                                                    if (contextMenu.isOpen) return;
                                                                    const r = e.currentTarget.getBoundingClientRect()
                                                                    setTooltipPos({ x: r.left, y: r.bottom + 4 })
                                                                    setHoveredBooking(booking)
                                                                }}
                                                                onMouseLeave={() => setHoveredBooking(null)}
                                                                className={`absolute ${isCompact ? 'top-0.5 bottom-0.5' : 'top-1 bottom-1'} rounded-md border overflow-hidden active:cursor-grabbing hover:brightness-110 hover:shadow-lg transition-all z-10 ${barBase} ${searchOpacity} ${draggedBooking?.id === booking.id ? 'opacity-40 scale-[0.98]' : 'cursor-grab flex'} ${isOTA ? 'ring-1 ring-violet-300/50' : ''}`}
                                                                style={{
                                                                    left: `calc(${ROOM_COL}px + (100% - ${ROOM_COL}px) * ${startOffset / days.length})`,
                                                                    width: `calc((100% - ${ROOM_COL}px) * ${duration / days.length})`,
                                                                    minWidth: 20
                                                                }}
                                                            >
                                                                {/* Left edge accent stripe — quick status scan */}
                                                                <div className={`w-1.5 h-full flex-shrink-0 ${cfg.edge || 'bg-black/20'} opacity-80`} />

                                                                <div className={`flex flex-col justify-center px-1 overflow-hidden flex-1 h-full ${textCls}`}>
                                                                    <div className={`text-[10px] font-bold truncate leading-none flex items-center gap-1 ${isCompact ? '' : 'mb-0.5'}`}>
                                                                        <span className={`text-[8px] font-black opacity-70 flex-shrink-0 leading-none`}>{isOTA ? 'OTA' : cfg.abbr}</span>
                                                                        {booking.isWebCheckedIn && <Zap size={8} className="text-yellow-300 drop-shadow flex-shrink-0" title="Web Checked-in" />}
                                                                        <span className="truncate">{booking.leadName || 'Guest'}</span>
                                                                    </div>
                                                                    <div className={`flex items-center gap-1 text-[8px] opacity-75 mt-px`}>
                                                                        <User size={8} /> {booking.guestsAdult + booking.guestsChild}
                                                                        {isPaid 
                                                                            ? <span className="ml-auto flex items-center gap-0.5 text-[7px] font-bold" title="Payment Confirmed"><CreditCard size={7} className="text-teal-300" /><span className="hidden xl:inline">PAID</span></span>
                                                                            : <span className="ml-auto flex items-center gap-0.5 text-[7px] font-bold text-amber-300" title="Payment Pending"><AlertCircle size={7} /><span className="hidden xl:inline">UNPAID</span></span>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Legend strip ── */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] pb-1">
                    {Object.entries(STATUS_CONFIG).map(([k, c]) => (
                        <span key={k} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold ${c.bar} ${c.textColor}`}>
                            <span className="text-[8px] font-black opacity-70">{c.abbr}</span>
                            {c.label}
                        </span>
                    ))}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold bg-violet-500 border-violet-700 text-white">
                        <span className="text-[8px] font-black opacity-70">OTA</span> Channel
                    </span>
                    <span className="hidden md:flex items-center gap-1 ml-auto text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"/> Free · Click to add
                    </span>
                </div>
                    </>
                )}

                {/* ── Booking hover tooltip ── */}
                {hoveredBooking && (
                    <div
                        className="fixed z-50 bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 w-60 text-xs pointer-events-none"
                        style={{ left: Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200) - 250, tooltipPos.x), top: tooltipPos.y }}
                    >
                        <div className="flex justify-between items-start pb-2 mb-2 border-b border-slate-700">
                            <div>
                                <div className="font-bold">{hoveredBooking.leadName}</div>
                                <div className="text-slate-400 text-[9px] font-mono">{hoveredBooking.id?.slice(-8)}</div>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${STATUS_CONFIG[hoveredBooking.status]?.bar || 'bg-slate-600'}`}>
                                {STATUS_CONFIG[hoveredBooking.status]?.label}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5"><Clock size={10} className="text-slate-400"/>
                                {new Date(hoveredBooking.checkIn).toLocaleDateString('th-TH')} <ChevronRight size={10} className="text-slate-500 mx-0.5" /> {new Date(hoveredBooking.checkOut).toLocaleDateString('th-TH')}
                            </div>
                            <div className="flex items-center gap-1.5"><User size={10} className="text-slate-400"/>
                                {hoveredBooking.guestsAdult}A {hoveredBooking.guestsChild}C
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-blue-300">฿{hoveredBooking.totalAmount?.toLocaleString()}</span>
                                <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${bookingPaymentStatus(hoveredBooking) === 'PAID' ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {bookingPaymentStatus(hoveredBooking)}
                                </span>
                            </div>
                            {hoveredBooking.specialRequests && (
                                <div className="mt-1 p-1.5 bg-slate-800 rounded text-slate-300 italic text-[9px]">&quot;{hoveredBooking.specialRequests}&quot;</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── HK tooltip ── */}
                {hkTooltip.isOpen && hkTooltip.room && (
                    <div
                        className="fixed z-50 bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 w-44 text-xs pointer-events-none"
                        style={{ top: hkTooltip.y, left: hkTooltip.x }}
                    >
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${HK_CONFIG[hkTooltip.room.status]?.color.split(' ')[0] || 'bg-slate-500'}`} />
                            <span className="font-bold text-sm">{HK_CONFIG[hkTooltip.room.status]?.label}</span>
                        </div>
                        {hkTooltip.room.statusLogs?.[0] ? (
                            <div className="space-y-1 text-[10px]">
                                <div className="flex justify-between text-slate-400">
                                    <span>Updated</span>
                                    <span className="text-white">{new Date(hkTooltip.room.statusLogs[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Duration</span>
                                    <span className="text-blue-400 font-bold">{formatDuration(hkTooltip.room.statusLogs[0].createdAt)}</span>
                                </div>
                            </div>
                        ) : <div className="text-slate-500 text-[10px] italic">No recent logs</div>}
                    </div>
                )}

                {/* ── Availability tooltip ── */}
                {avTooltip.isOpen && avTooltip.metrics && (
                    <div
                        className="fixed z-50 bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 w-56 text-xs pointer-events-none"
                        style={{ top: Math.max(10, Math.min((typeof window !== 'undefined' ? window.innerHeight : 800) - 200, avTooltip.y)), left: Math.max(10, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200) - 240, avTooltip.x)) }}
                    >
                        <div className="flex justify-between items-end pb-2 mb-2 border-b border-slate-700">
                            <div>
                                <div className="font-bold text-sm text-blue-400">{new Date(avTooltip.dStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                <div className="text-slate-400 text-[10px]">Total Occupancy</div>
                            </div>
                            <span className="text-lg font-black text-white">{avTooltip.metrics.occupancy}%</span>
                        </div>
                        <div className="space-y-1.5 mt-2">
                            {avTooltip.metrics.typeBreakdown.map(tb => {
                                const isFull = tb.total > 0 && tb.available === 0;
                                const isLow = tb.total > 0 && tb.available > 0 && tb.available <= (tb.total * 0.2);
                                return (
                                    <div key={tb.name} className="flex justify-between items-center text-[10px]">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-teal-500'}`} />
                                            <span className={isFull ? 'text-slate-400 truncate w-24' : 'text-slate-200 truncate w-24'}>{tb.name}</span>
                                        </div>
                                        <span className={`font-bold tabular-nums whitespace-nowrap ${isFull ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-teal-400'}`}>
                                            {isFull ? 'Sold Out' : `${tb.available} Left`}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* ── Modals ── */}
            {isDetailOpen && selectedBooking && (
                <BookingDetailModal booking={selectedBooking} onClose={() => setIsDetailOpen(false)} onUpdateStatus={updateStatus} />
            )}
            <ConfirmationModal
                isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} onConfirm={confirmModal.onConfirm}
            />
            {createModal.isOpen && (
                <CreateBookingModal onClose={() => setCreateModal({ ...createModal, isOpen: false })} onSuccess={fetchData} initialData={createModal.initialData} />
            )}
        </AdminLayout>
    )
}

function bookingPaymentStatus(b) {
    return b.payment?.status === 'authorized' || b.payment?.status === 'captured' ? 'PAID' : 'UNPAID'
}
