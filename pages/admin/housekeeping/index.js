import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Sparkles, Trash2, CheckCircle2, AlertCircle, User, SprayCan, MoreVertical, Ban, Wrench, TriangleAlert, CheckCheck, Clock, ChevronRight } from 'lucide-react';

export default function HousekeepingDashboard() {
    const { currentHotel } = useAdmin() || {};
    const [activeTab, setActiveTab] = useState('rooms');
    const [loading, setLoading] = useState(true);
    const [roomTypes, setRoomTypes] = useState([]);
    const [reports, setReports] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        if (!currentHotel?.id) return;
        fetchData();
        fetchReports();
        const interval = setInterval(() => { fetchData(); fetchReports(); }, 30000);
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

    const fetchReports = async () => {
        try {
            const data = await apiFetch(`/housekeeping/${currentHotel.id}/reports`);
            setReports(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
    };

    const handleResolve = async (reportId) => {
        const t = toast.loading('Resolving...');
        try {
            await apiFetch(`/housekeeping/reports/${reportId}/resolve`, { method: 'PUT' });
            toast.success('Issue resolved!', { id: t });
            fetchReports();
        } catch { toast.error('Failed', { id: t }); }
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
            case 'CLEAN': return { topBar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20', icon: Sparkles, label: 'Clean' };
            case 'DIRTY': return { topBar: 'bg-red-500', text: 'text-red-700 dark:text-red-400', badge: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20', icon: Trash2, label: 'Dirty' };
            case 'CLEANING': return { topBar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', icon: Sparkles, label: 'Cleaning' };
            case 'INSPECTED': return { topBar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20', icon: CheckCircle2, label: 'Inspected' };
            case 'OOO': return { topBar: 'bg-slate-500', text: 'text-slate-700 dark:text-slate-400', badge: 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20', icon: AlertCircle, label: 'Out of Order' };
            default: return { topBar: 'bg-slate-500', text: 'text-slate-700 dark:text-slate-400', badge: 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20', icon: CheckCircle2, label: 'Unknown' };
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

    const openReports = reports.filter(r => r.status !== 'RESOLVED');
    const priorityColor = { HIGH: 'text-red-600 bg-red-50 border-red-200', NORMAL: 'text-amber-600 bg-amber-50 border-amber-200', LOW: 'text-slate-600 bg-slate-50 border-slate-200' };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto pb-12">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Housekeeping</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage room status and daily cleaning tasks.</p>
                    </div>
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                        <button onClick={() => setActiveTab('rooms')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rooms' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            Rooms
                        </button>
                        <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${activeTab === 'reports' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Wrench size={14} /> Maintenance
                            {openReports.length > 0 && <span className="w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">{openReports.length}</span>}
                        </button>
                    </div>
                </div>

                {activeTab === 'rooms' && (
                  <>
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
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 lg:p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 shadow-sm flex flex-col justify-center items-center lg:items-start">
                            <div className="text-[10px] lg:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-0.5 flex items-center gap-1"><CheckCircle2 size={12} className="hidden lg:block" /> Clean</div>
                            <div className="text-xl lg:text-3xl font-bold text-blue-700 dark:text-blue-300 leading-none">{stats.clean}</div>
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
                                            <div key={room.id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group">
                                                {/* Top Status Border */}
                                                <div className={`absolute top-0 left-0 w-full h-1.5 ${statusObj.topBar}`} />

                                                <div className="flex justify-between items-start mb-4 mt-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-xl border ${statusObj.badge}`}>
                                                            {room.roomNumber}
                                                        </div>
                                                        <div>
                                                            <div className={`font-bold text-lg flex items-center gap-1.5 leading-tight ${statusObj.text}`}>
                                                                <StatusIcon size={16} />
                                                                {statusObj.label}
                                                            </div>
                                                            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                                                {room.lastStatusUpdate ? timeAgo(room.lastStatusUpdate.updatedAt) : 'No updates'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Context Menu (More Options) */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => toggleMenu(e, room.id)}
                                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                                                        >
                                                            <MoreVertical size={20} />
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
                                                <div className="flex-1 mb-5 flex items-center gap-2">
                                                    {room.isOccupied ? (
                                                        <span className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 text-xs font-bold px-2.5 py-1 rounded-md">
                                                            <User size={14} />
                                                            In-House: {room.currentGuest}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md">
                                                            Vacant
                                                        </span>
                                                    )}
                                                </div>

                                                {/* 1-Tap Workflow UI */}
                                                <div className="pt-2">
                                                    {room.status === 'DIRTY' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(room.id, 'CLEANING', room.status)}
                                                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                                                        >
                                                            <Sparkles size={16} /> Start Cleaning
                                                        </button>
                                                    )}

                                                    {room.status === 'CLEANING' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(room.id, 'CLEAN', room.status)}
                                                            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                                                        >
                                                            <CheckCircle2 size={16} /> Mark as Clean
                                                        </button>
                                                    )}

                                                    {room.status === 'CLEAN' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(room.id, 'INSPECTED', room.status)}
                                                            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                                                        >
                                                            <CheckCircle2 size={16} /> Inspect Room
                                                        </button>
                                                    )}

                                                    {(room.status === 'INSPECTED' || room.status === 'OOO') && (
                                                        <div className="w-full py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-dashed border-slate-200 dark:border-slate-600">
                                                            {room.status === 'OOO' ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                                                            {room.status === 'OOO' ? 'Out of Order' : 'Ready for Guest'}
                                                        </div>
                                                    )}
                                                </div>

                                                {room.lastStatusUpdate && (
                                                    <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-medium whitespace-nowrap">
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
                  </>
                )}

                {/* --- Maintenance Reports Tab --- */}
                {activeTab === 'reports' && (
                    <div className="space-y-3">
                        {openReports.length === 0 && (
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <CheckCheck size={40} className="mx-auto mb-3 text-emerald-400" />
                                <p className="font-bold text-slate-700 dark:text-white">No Open Issues</p>
                                <p className="text-sm text-slate-400 mt-1">All maintenance reports have been resolved.</p>
                            </div>
                        )}
                        {openReports.map(report => (
                            <div key={report.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex gap-4 items-start">
                                <div className="mt-0.5">
                                    <TriangleAlert size={20} className={report.priority === 'HIGH' ? 'text-red-500' : report.priority === 'NORMAL' ? 'text-amber-500' : 'text-slate-400'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-bold text-slate-800 dark:text-white text-sm">Room {report.room?.roomNumber}</span>
                                        <span className="text-[10px] text-slate-500">{report.room?.roomType?.name}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor[report.priority] || priorityColor.NORMAL}`}>
                                            {report.priority}
                                        </span>
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                                            {report.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{report.description}</p>
                                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                        <Clock size={10} /> {new Date(report.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        {report.reportedBy && <> · by {report.reportedBy}</>}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleResolve(report.id)}
                                    className="shrink-0 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                >
                                    <CheckCheck size={12} /> Resolve
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

