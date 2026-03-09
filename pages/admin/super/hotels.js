import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Building2, Search, MoreVertical, ShieldAlert, Power, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function SuperHotels() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [hotels, setHotels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, hotelId: null, currentStatus: null, message: '' });

    useEffect(() => {
        // Wait until user is fully loaded or confirmed null
        if (user === undefined) return;

        if (user === null) {
            router.push('/auth/login');
            return;
        }

        if (!user?.roles?.includes('platform_admin')) {
            router.push('/admin');
            return;
        }

        fetchTenants();
    }, [user]);

    const fetchTenants = async () => {
        try {
            const data = await apiFetch('/hotels/super/all');
            setHotels(data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load tenants list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImpersonate = async (hotelId) => {
        try {
            toast.loading('Initiating Impersonation...', { id: 'spy' });
            const data = await apiFetch('/auth/impersonate', {
                method: 'POST',
                body: JSON.stringify({ targetHotelId: hotelId })
            });

            if (data.token) {
                // Warning: We are overwriting the Super Admin token. 
                // To get back, they must log out and log back in.
                localStorage.setItem('token', data.token);
                toast.success(`Successfully switched to hotel dashboard`, { id: 'spy' });

                // Force a full page reload to flush all React contexts (Auth/Admin)
                window.location.href = '/admin';
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Impersonation failed', { id: 'spy' });
        }
    };

    const handleSuspendClick = (hotelId, currentStatus) => {
        const newStatus = !currentStatus;
        const confirmMsg = newStatus
            ? 'Are you sure you want to suspend this hotel? They will lose access immediately.'
            : 'Are you sure you want to unsuspend this hotel? They will regain access.';

        setConfirmModal({
            isOpen: true,
            hotelId,
            currentStatus,
            message: confirmMsg
        });
    };

    const handleSuspend = async () => {
        if (!confirmModal.hotelId) return;
        const { hotelId, currentStatus } = confirmModal;
        const newStatus = !currentStatus;

        try {
            toast.loading(newStatus ? 'Suspending...' : 'Unsuspending...', { id: 'suspend' });
            await apiFetch(`/hotels/super/${hotelId}/suspend`, {
                method: 'PUT',
                body: JSON.stringify({ isSuspended: newStatus })
            });

            toast.success(`Hotel successfully ${newStatus ? 'suspended' : 'unsuspended'}`, { id: 'suspend' });
            fetchTenants(); // Refresh list to reflect changes
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Action failed', { id: 'suspend' });
        }
    };

    const filteredHotels = hotels.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <AdminLayout>Loading...</AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto pb-20 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Tenants & Hotels</h1>
                        <p className="text-slate-500 dark:text-slate-400">View and manage all hotel subscriptions across the BookingKub platform</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search hotels or cities..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all w-full md:w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Hotels</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{hotels.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Rooms</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                {hotels.reduce((sum, h) => sum + (h.stats?.roomCount || 0), 0)}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="p-4 font-bold text-slate-600 dark:text-slate-300 text-sm">Hotel Name</th>
                                    <th className="p-4 font-bold text-slate-600 dark:text-slate-300 text-sm">Location</th>
                                    <th className="p-4 font-bold text-slate-600 dark:text-slate-300 text-sm">Plan</th>
                                    <th className="p-4 font-bold text-slate-600 dark:text-slate-300 text-sm">Usage Stats</th>
                                    <th className="p-4 font-bold text-slate-600 dark:text-slate-300 text-sm">Created</th>
                                    <th className="p-4 font-bold text-slate-600 dark:text-slate-300 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHotels.map(hotel => (
                                    <tr key={hotel.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${hotel.isSuspended ? 'opacity-60 grayscale' : ''}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {hotel.logoUrl ? (
                                                    <img src={hotel.logoUrl} className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                                        <Building2 size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        {hotel.name}
                                                        {hotel.isSuspended && (
                                                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] rounded uppercase font-bold tracking-wider">Suspended</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono">{hotel.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                                            {hotel.city ? `${hotel.city}, ${hotel.country}` : 'Not specified'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${hotel.package === 'PRO' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' :
                                                hotel.package === 'ENTERPRISE' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                }`}>
                                                {hotel.package}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="text-slate-700 dark:text-slate-300">
                                                <span className="font-bold">{hotel.stats?.roomCount || 0}</span> Rooms
                                            </div>
                                            <div className="text-slate-500 text-xs mt-0.5">
                                                {hotel.stats?.staffCount || 0} Staff Account(s)
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {new Date(hotel.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleImpersonate(hotel.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                    title="View Dashboard"
                                                >
                                                    <ShieldAlert size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleSuspendClick(hotel.id, hotel.isSuspended)}
                                                    className={`p-2 rounded-lg transition-colors ${hotel.isSuspended ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'}`}
                                                    title={hotel.isSuspended ? "Unsuspend Hotel" : "Suspend Hotel"}
                                                >
                                                    <Power size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredHotels.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500">
                                            No hotels found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, hotelId: null, currentStatus: null, message: '' })}
                onConfirm={handleSuspend}
                title={confirmModal.currentStatus ? "Unsuspend Hotel" : "Suspend Hotel"}
                message={confirmModal.message}
                type={confirmModal.currentStatus ? "warning" : "danger"}
                confirmText={confirmModal.currentStatus ? "Unsuspend" : "Suspend"}
            />
        </AdminLayout>
    );
}
