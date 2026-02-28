import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Sparkles, Trash2, CheckCircle2, AlertCircle, ChevronRight, User, SprayCan, MoreVertical, Ban } from 'lucide-react';

export default function HousekeepingDashboard() {
    const { currentHotel } = useAdmin() || {};
    const [loading, setLoading] = useState(true);
    const [roomTypes, setRoomTypes] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null); // Track which room's menu is open

    // Auto-refresh interval
    useEffect(() => {
        if (!currentHotel?.id) return;
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [currentHotel?.id]);

    const fetchData = async () => {
        try {
            const data = await apiFetch(`/housekeeping/${currentHotel.id}`);
            setRoomTypes(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load housekeeping data');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (roomId, newStatus, currentStatus) => {
        if (newStatus === currentStatus) return;

        // Optimistic UI Update
        const updatedRoomTypes = roomTypes.map(rt => ({
            ...rt,
            rooms: rt.rooms.map(r => r.id === roomId ? {
                ...r,
                status: newStatus,
                lastStatusUpdate: {
                    updatedAt: new Date().toISOString(),
                    updatedBy: 'You',
                    note: null
                }
            } : r)
        }));
        setRoomTypes(updatedRoomTypes);

        const tid = toast.loading(`Updating room to ${newStatus}...`);

        try {
            await apiFetch(`/housekeeping/rooms/${roomId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus, note: '' })
            });
            toast.success('Room status updated', { id: tid });
            // Let the polling handle the true state, optimistic UI covers us until then
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status', { id: tid });
            fetchData(); // Revert on failure
        }
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 'CLEAN': return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400', icon: Sparkles, label: 'Clean' };
            case 'DIRTY': return { color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400', icon: Trash2, label: 'Dirty' };
            case 'CLEANING': return { color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400', icon: Sparkles, label: 'Cleaning' };
            case 'INSPECTED': return { color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400', icon: CheckCircle2, label: 'Inspected' };
            case 'OOO': return { color: 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400', icon: AlertCircle, label: 'Out of Order' };
            default: return { color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400', icon: CheckCircle2, label: 'Unknown' };
        }
    };

    const timeAgo = (date) => {
        if (!date) return 'Never';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + "h ago";
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + "m ago";
        return "Just now";
    };

    // Close open menus when clicking anywhere else
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleMenu = (e, roomId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === roomId ? null : roomId);
    };

    if (loading) return <AdminLayout>Loading Housekeeping Dashboard...</AdminLayout>;

    // Calculate Summary Stats
    const allRooms = roomTypes.flatMap(rt => rt.rooms);
    const stats = {
        total: allRooms.length,
        dirty: allRooms.filter(r => r.status === 'DIRTY').length,
        cleaning: allRooms.filter(r => r.status === 'CLEANING').length,
        clean: allRooms.filter(r => r.status === 'CLEAN' || r.status === 'INSPECTED').length,
        ooo: allRooms.filter(r => r.status === 'OOO').length,
        occupied: allRooms.filter(r => r.isOccupied).length
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto pb-12">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Housekeeping</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage room status and daily cleaning tasks.</p>
                    </div>
                </div>

                {/* KPI Cards - Sticky for Mobile/Tablet */}
                <div className="sticky top-0 z-20 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md pt-2 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="bg-white dark:bg-slate-800 p-3 lg:p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center lg:items-start">
                            <div className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase mb-0.5">Total</div>
                            <div className="text-xl lg:text-3xl font-bold dark:text-white leading-none">{stats.total}</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 lg:p-4 rounded-2xl border border-red-100 dark:border-red-500/20 shadow-sm flex flex-col justify-center items-center lg:items-start">
                            <div className="text-[10px] lg:text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-0.5 flex items-center gap-1"><Trash2 size={12} className="hidden lg:block" /> Dirty</div>
                            <div className="text-xl lg:text-3xl font-bold text-red-700 dark:text-red-300 leading-none">{stats.dirty}</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 lg:p-4 rounded-2xl border border-amber-100 dark:border-amber-500/20 shadow-sm flex flex-col justify-center items-center lg:items-start">
                            <div className="text-[10px] lg:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-0.5 flex items-center gap-1"><Sparkles size={12} className="hidden lg:block" /> Cleaning</div>
                            <div className="text-xl lg:text-3xl font-bold text-amber-700 dark:text-amber-300 leading-none">{stats.cleaning}</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 lg:p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm flex flex-col justify-center items-center lg:items-start">
                            <div className="text-[10px] lg:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-0.5 flex items-center gap-1"><CheckCircle2 size={12} className="hidden lg:block" /> Clean</div>
                            <div className="text-xl lg:text-3xl font-bold text-emerald-700 dark:text-emerald-300 leading-none">{stats.clean}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 lg:p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 shadow-sm flex flex-col justify-center items-center lg:items-start hidden sm:flex">
                            <div className="text-[10px] lg:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-0.5 flex items-center gap-1"><User size={12} className="hidden lg:block" /> Occupied</div>
                            <div className="text-xl lg:text-3xl font-bold text-blue-700 dark:text-blue-300 leading-none">{stats.occupied}</div>
                        </div>
                    </div>
                </div>

                {/* Rooms List by Type */}
                <div className="space-y-8">
                    {roomTypes.map(rt => {
                        if (rt.rooms.length === 0) return null;
                        return (
                            <div key={rt.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex justify-between items-center border-b dark:border-slate-700 pb-3">
                                    {rt.name}
                                    <span className="text-sm font-normal text-slate-500">{rt.bedConfig} Allotment</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {rt.rooms.map(room => {
                                        const statusObj = getStatusDetails(room.status);
                                        const StatusIcon = statusObj.icon;

                                        return (
                                            <div key={room.id} className={`p-4 lg:p-5 rounded-2xl border-2 transition-all ${statusObj.color} flex flex-col relative`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center font-display font-bold text-xl dark:bg-slate-900/50">
                                                            {room.roomNumber}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-lg flex items-center gap-1.5 leading-tight">
                                                                <StatusIcon size={16} />
                                                                {statusObj.label}
                                                            </div>
                                                            <div className="text-[11px] uppercase tracking-wider font-bold opacity-70 mt-0.5">
                                                                {room.lastStatusUpdate ? timeAgo(room.lastStatusUpdate.updatedAt) : 'No updates'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Context Menu (More Options) */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => toggleMenu(e, room.id)}
                                                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                                        >
                                                            <MoreVertical size={20} className="opacity-70" />
                                                        </button>

                                                        {openMenuId === room.id && (
                                                            <div className="absolute top-10 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-30 py-1">
                                                                {['DIRTY', 'CLEANING', 'CLEAN', 'INSPECTED', 'OOO'].map(st => (
                                                                    <button
                                                                        key={st}
                                                                        onClick={() => {
                                                                            handleStatusUpdate(room.id, st, room.status);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${room.status === st ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' : 'text-slate-700 dark:text-slate-300'}`}
                                                                    >
                                                                        {room.status === st && <CheckCircle2 size={14} className="text-primary-600" />}
                                                                        Set to {st.charAt(0) + st.slice(1).toLowerCase()}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Occupancy Info */}
                                                <div className="flex-1 mb-5 text-sm font-semibold opacity-80 flex items-center gap-1.5">
                                                    {room.isOccupied ? (
                                                        <div className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-md">
                                                            <User size={14} />
                                                            In-House: {room.currentGuest}
                                                        </div>
                                                    ) : (
                                                        <span className="opacity-60 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md">Vacant</span>
                                                    )}
                                                </div>

                                                {/* 1-Tap Workflow UI */}
                                                <div className="pt-2">
                                                    {room.status === 'DIRTY' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(room.id, 'CLEANING', room.status)}
                                                            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                                                        >
                                                            <Sparkles size={18} /> Start Cleaning
                                                        </button>
                                                    )}

                                                    {room.status === 'CLEANING' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(room.id, 'CLEAN', room.status)}
                                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                                                        >
                                                            <CheckCircle2 size={18} /> Mark as Clean
                                                        </button>
                                                    )}

                                                    {room.status === 'CLEAN' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(room.id, 'INSPECTED', room.status)}
                                                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                                                        >
                                                            <CheckCircle2 size={18} /> Inspect Room
                                                        </button>
                                                    )}

                                                    {(room.status === 'INSPECTED' || room.status === 'OOO') && (
                                                        <div className="w-full py-4 bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 text-lg cursor-not-allowed border border-dashed border-black/10 dark:border-white/10">
                                                            {room.status === 'OOO' ? <Ban size={18} /> : <CheckCircle2 size={18} />}
                                                            {room.status === 'OOO' ? 'Out of Order' : 'Ready for Guest'}
                                                        </div>
                                                    )}
                                                </div>

                                                {room.lastStatusUpdate && (
                                                    <div className="absolute bottom-3 right-4 text-[10px] opacity-50 font-medium">
                                                        by {room.lastStatusUpdate.updatedBy}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {roomTypes.length === 0 && (
                        <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <SprayCan className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Rooms Configured</h3>
                            <p className="text-slate-500 mt-2">Add physical rooms in the Room Management settings to see them here.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
