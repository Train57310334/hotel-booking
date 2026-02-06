import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import {
    BedDouble,
    CheckCircle,
    AlertCircle,
    Clock,
    Search,
    Filter,
    RefreshCcw,
    MoreVertical,
    SprayCan,
    Eye,
    Wrench
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Housekeeping() {
    const { user } = useAuth()
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL') // ALL, DIRTY, CLEAN, INSPECTED, OOO
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchRooms()
    }, [])

    const fetchRooms = async () => {
        setLoading(true)
        try {
            const data = await apiFetch('/rooms')
            setRooms(data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load rooms')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (roomId, newStatus) => {
        try {
            await apiFetch(`/rooms/${roomId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            // Optimistic update
            setRooms(prev => prev.map(r =>
                r.id === roomId ? { ...r, status: newStatus } : r
            ))

            toast.success(`Room marked as ${newStatus}`)
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    // Calculate Stats
    const stats = {
        total: rooms.length,
        dirty: rooms.filter(r => r.status === 'DIRTY').length,
        clean: rooms.filter(r => r.status === 'CLEAN').length,
        inspected: rooms.filter(r => r.status === 'INSPECTED').length,
        ooo: rooms.filter(r => r.status === 'OOO').length
    }

    const filteredRooms = rooms.filter(room => {
        const matchesFilter = filter === 'ALL' || room.status === filter
        const matchesSearch = room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.roomType?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    // Helper for Status UI
    const getStatusColor = (status) => {
        switch (status) {
            case 'DIRTY': return 'bg-red-100 text-red-700 border-red-200'
            case 'CLEAN': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'INSPECTED': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'OOO': return 'bg-gray-100 text-gray-700 border-gray-200'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DIRTY': return <AlertCircle size={16} />
            case 'CLEAN': return <SprayCan size={16} />
            case 'INSPECTED': return <CheckCircle size={16} />
            case 'OOO': return <Wrench size={16} />
            default: return <Clock size={16} />
        }
    }

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Housekeeping</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage room cleaning status and inspections</p>
                </div>
                <button
                    onClick={fetchRooms}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    label="Dirty Rooms"
                    value={stats.dirty}
                    color="bg-red-500"
                    icon={AlertCircle}
                    active={filter === 'DIRTY'}
                    onClick={() => setFilter(filter === 'DIRTY' ? 'ALL' : 'DIRTY')}
                />
                <StatsCard
                    label="Clean Rooms"
                    value={stats.clean}
                    color="bg-blue-500"
                    icon={SprayCan}
                    active={filter === 'CLEAN'}
                    onClick={() => setFilter(filter === 'CLEAN' ? 'ALL' : 'CLEAN')}
                />
                <StatsCard
                    label="Inspected"
                    value={stats.inspected}
                    color="bg-emerald-500"
                    icon={CheckCircle}
                    active={filter === 'INSPECTED'}
                    onClick={() => setFilter(filter === 'INSPECTED' ? 'ALL' : 'INSPECTED')}
                />
                <StatsCard
                    label="Out of Order"
                    value={stats.ooo}
                    color="bg-gray-500"
                    icon={Wrench}
                    active={filter === 'OOO'}
                    onClick={() => setFilter(filter === 'OOO' ? 'ALL' : 'OOO')}
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by room number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['ALL', 'DIRTY', 'CLEAN', 'INSPECTED', 'OOO'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filter === s
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Room Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRooms.map((room) => (
                        <div key={room.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
                                <div>
                                    <div className="text-2xl font-display font-bold text-slate-900 dark:text-white">{room.roomNumber}</div>
                                    <div className="text-xs text-slate-500 font-medium truncate max-w-[150px]">{room.roomType?.name}</div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(room.status)}`}>
                                    {getStatusIcon(room.status)}
                                    {room.status}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1">
                                {/* Occupancy Status */}
                                {room.bookings && room.bookings.length > 0 ? (
                                    <div className="mb-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">Occupied</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {room.bookings[0].leadName || 'Guest'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Out: {new Date(room.bookings[0].checkOut).toLocaleDateString()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Vacant</div>
                                    </div>
                                )}

                                {/* Last Updated Log */}
                                {room.statusLogs && room.statusLogs[0] ? (
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-auto">
                                        <Clock size={10} />
                                        Updated {new Date(room.statusLogs[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {room.statusLogs[0].updatedBy && ' (Manual)'}
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-slate-400 mt-auto">No recent status log</div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-2">
                                {/* Dirty Button */}
                                <button
                                    onClick={() => updateStatus(room.id, 'DIRTY')}
                                    disabled={room.status === 'DIRTY'}
                                    className="flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <AlertCircle size={16} className="mb-1" />
                                    Dirty
                                </button>

                                {/* Clean Button */}
                                <button
                                    onClick={() => updateStatus(room.id, 'CLEAN')}
                                    disabled={room.status === 'CLEAN'}
                                    className="flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <SprayCan size={16} className="mb-1" />
                                    Clean
                                </button>

                                {/* Inspect Button */}
                                <button
                                    onClick={() => updateStatus(room.id, 'INSPECTED')}
                                    disabled={room.status === 'INSPECTED'}
                                    className="flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <CheckCircle size={16} className="mb-1" />
                                    Inspect
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    )
}

function StatsCard({ label, value, color, icon: Icon, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${active
                    ? 'bg-white dark:bg-slate-800 ring-2 ring-emerald-500 shadow-lg'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-200'
                }`}
        >
            <div className={`absolute top-0 right-0 w-16 h-16 transform translate-x-4 -translate-y-4 rounded-full opacity-10 ${color}`}></div>
            <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-white shadow-lg ${color}`}>
                    <Icon size={20} />
                </div>
                <div className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">
                    {value}
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {label}
                </div>
            </div>
        </button>
    )
}
