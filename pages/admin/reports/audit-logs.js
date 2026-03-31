import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch } from '@/lib/api';
import { CalendarDays, Filter, RefreshCcw, Activity, User, MonitorSmartphone, MapPin, ChevronLeft, ChevronRight, Clock, Trash2, Edit, CreditCard, UserPlus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRoleAccess } from '@/hooks/useRoleAccess';

// Helper to determine icon based on action
function getActionIcon(action) {
    if (action.includes('BOOKING_CREATED')) return <CalendarDays size={18} className="text-emerald-500" />;
    if (action.includes('BOOKING_CANCELLED')) return <Trash2 size={18} className="text-red-500" />;
    if (action.includes('BOOKING_STATUS_UPDATED')) return <Edit size={18} className="text-blue-500" />;
    if (action.includes('PAYMENT')) return <CreditCard size={18} className="text-indigo-500" />;
    if (action.includes('STAFF')) return <UserPlus size={18} className="text-purple-500" />;
    return <Activity size={18} className="text-slate-500" />;
}

// Helper to color code the action tag
function getActionColor(action) {
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300';
    if (action.includes('CANCEL') || action.includes('REMOVE') || action.includes('DELETE')) return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300';
}

export default function AuditLogsPage() {
    const { currentHotel } = useAdmin() || {};
    const { isAdmin, isOwner, isPlatformAdmin } = useRoleAccess();
    
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        action: '',
        startDate: '',
        endDate: '',
    });
    const take = 20;

    useEffect(() => {
        if (currentHotel || isPlatformAdmin) {
            fetchLogs();
        }
    }, [currentHotel, page, filters, isPlatformAdmin]);

    const fetchLogs = async () => {
        if (!currentHotel && !isPlatformAdmin) return;
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                skip: ((page - 1) * take).toString(),
                take: take.toString(),
            });
            
            if (currentHotel) queryParams.append('hotelId', currentHotel.id);
            if (filters.action) queryParams.append('action', filters.action);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);

            const data = await apiFetch(`/activity-logs?${queryParams.toString()}`);
            setLogs(data.items || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to fetch logs');
            toast.error('Could not load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to first page
    };

    const resetFilters = () => {
        setFilters({ action: '', startDate: '', endDate: '' });
        setPage(1);
    };

    // If staff somehow accesses this despite layout hiding it
    if (!isAdmin && !isOwner) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-red-100 text-red-500 p-4 rounded-full mb-4">
                        <Activity size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
                    <p className="text-slate-500 mt-2">You do not have permission to view system audit logs.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Activity Audit Logs</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track and monitor staff actions and system events securely.</p>
                </div>
                <button 
                    onClick={fetchLogs} 
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filter by Action</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            name="action" 
                            value={filters.action} 
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:text-white appearance-none"
                        >
                            <option value="">All Actions</option>
                            <option value="BOOKING_CREATED">Booking Created</option>
                            <option value="BOOKING_STATUS_UPDATED">Booking Updated</option>
                            <option value="BOOKING_CANCELLED">Booking Cancelled</option>
                            <option value="PAYMENT_CAPTURED">Payment Captured</option>
                            <option value="STAFF_ADDED">Staff Added</option>
                            <option value="STAFF_ROLE_UPDATED">Staff Updated</option>
                            <option value="STAFF_REMOVED">Staff Removed</option>
                        </select>
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date Range</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:text-white"
                        />
                        <span className="text-slate-400">to</span>
                        <input 
                            type="date" 
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Timeline View */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-6 relative min-h-[400px]">
                {loading && logs.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 z-10 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No activity logs found</p>
                        <p className="text-sm">Try adjusting your filters or date range.</p>
                        {(filters.action || filters.startDate || filters.endDate) && (
                            <button onClick={resetFilters} className="mt-4 text-blue-500 hover:text-blue-600 font-medium">
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                        {logs.map((log, index) => (
                            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Timeline Dot */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                    {getActionIcon(log.action)}
                                </div>
                                
                                {/* Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group-hover:border-blue-500/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${getActionColor(log.action)}`}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300 font-mono shadow-inner overflow-x-auto whitespace-pre-wrap max-h-32 mb-3 border border-slate-100 dark:border-slate-700/50">
                                        {log.details ? JSON.stringify(log.details, null, 2) : 'No additional details'}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {log.userName ? log.userName[0].toUpperCase() : 'S'}
                                            </div>
                                            {log.userName}
                                            {log.userEmail && <span className="font-normal opacity-60">({log.userEmail})</span>}
                                        </div>
                                        {log.ipAddress && (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {log.ipAddress}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mt-6">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Page <span className="text-slate-900 dark:text-white font-bold">{page}</span> of <span className="text-slate-900 dark:text-white font-bold">{totalPages}</span>
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
