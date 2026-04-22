import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Plus, Search, Edit, Trash2, Eye, BedDouble, Loader2, RefreshCcw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { useAdmin } from '@/contexts/AdminContext'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
    CLEAN:       'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    DIRTY:       'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    OCCUPIED:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    OUT_OF_ORDER:'bg-red-50 text-red-700 ring-1 ring-red-200',
    MAINTENANCE: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
}

export default function RoomManagement() {
    const { currentHotel } = useAdmin()
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deletingId, setDeletingId] = useState(null)

    const fetchRooms = useCallback(async () => {
        if (!currentHotel?.id) return
        setLoading(true)
        try {
            const data = await apiFetch(`/rooms?hotelId=${currentHotel.id}`)
            setRooms(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load rooms')
        } finally {
            setLoading(false)
        }
    }, [currentHotel?.id])

    useEffect(() => { fetchRooms() }, [fetchRooms])

    const handleDelete = async (roomId) => {
        if (!confirm('Delete this room? This action cannot be undone.')) return
        setDeletingId(roomId)
        try {
            await apiFetch(`/rooms/${roomId}`, { method: 'DELETE' })
            toast.success('Room deleted')
            setRooms(prev => prev.filter(r => r.id !== roomId))
        } catch (err) {
            toast.error(err.message || 'Failed to delete room')
        } finally {
            setDeletingId(null)
        }
    }

    const filtered = rooms.filter(r => {
        const q = search.toLowerCase()
        return (
            r.roomNumber?.toLowerCase().includes(q) ||
            r.roomType?.name?.toLowerCase().includes(q) ||
            r.status?.toLowerCase().includes(q)
        )
    })

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Room Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {rooms.length} room{rooms.length !== 1 ? 's' : ''} total
                        {currentHotel ? ` · ${currentHotel.name}` : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchRooms}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <Link
                        href="/admin/rooms"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-colors"
                    >
                        <Plus size={16} /> Add Room
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by room number, type, or status..."
                        className="w-full text-sm outline-none placeholder:text-slate-400 text-slate-700 dark:text-slate-200 bg-transparent"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600 font-medium">
                            Clear
                        </button>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-slate-400">
                        <Loader2 size={32} className="animate-spin mr-3" />
                        <span className="font-medium">Loading rooms...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <BedDouble size={48} className="mb-4 opacity-30" />
                        <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                            {search ? 'No rooms match your search' : 'No rooms found'}
                        </p>
                        <p className="text-sm mt-1">
                            {search ? 'Try a different keyword' : 'Add your first room to get started'}
                        </p>
                        {!search && (
                            <Link href="/admin/rooms" className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                                + Add Room
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Base Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Floor</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.map(room => (
                                    <tr key={room.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <BedDouble size={16} className="text-blue-500" />
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    Room {room.roomNumber}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {room.roomType?.name || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {room.roomType?.basePrice
                                                ? `฿${Number(room.roomType.basePrice).toLocaleString()}`
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {room.floor ? `Floor ${room.floor}` : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[room.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {room.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/account/rooms/${room.id}`}
                                                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye size={15} />
                                                </Link>
                                                <Link
                                                    href={`/admin/rooms?edit=${room.id}`}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Edit room"
                                                >
                                                    <Edit size={15} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(room.id)}
                                                    disabled={deletingId === room.id}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                                                    title="Delete room"
                                                >
                                                    {deletingId === room.id
                                                        ? <Loader2 size={15} className="animate-spin" />
                                                        : <Trash2 size={15} />
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer count */}
                {!loading && filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20 text-xs text-slate-500">
                        Showing {filtered.length} of {rooms.length} room{rooms.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
