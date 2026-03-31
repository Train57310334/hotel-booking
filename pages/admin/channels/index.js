import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { apiFetch, API_BASE } from '@/lib/api';
import toast from 'react-hot-toast';
import { Share2, Copy, RefreshCw, CheckCircle, Link, Unlink, Wifi, WifiOff, Clock } from 'lucide-react';

export default function ChannelManagerPage() {
    const { currentHotel } = useAdmin() || {};
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [editUrls, setEditUrls] = useState({}); // roomTypeId -> url string

    const fetchStatus = useCallback(async () => {
        if (!currentHotel?.id) return;
        try {
            const res = await apiFetch(`/channels/${currentHotel.id}`);
            setData(res);
            // Initialize edit URLs from fetched data
            const initial = {};
            (res.roomTypes || []).forEach(rt => {
                initial[rt.id] = rt.icalUrl || '';
            });
            setEditUrls(initial);
        } catch (e) {
            toast.error('Failed to load channel status');
        } finally {
            setLoading(false);
        }
    }, [currentHotel?.id]);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    const handleSaveUrl = async (roomTypeId) => {
        const url = editUrls[roomTypeId]?.trim() || null;
        const t = toast.loading('Saving connection...');
        try {
            await apiFetch(`/channels/roomtype/${roomTypeId}/ical`, {
                method: 'PUT',
                body: JSON.stringify({ url }),
            });
            toast.success(url ? 'iCal feed connected!' : 'iCal feed disconnected', { id: t });
            fetchStatus();
        } catch (e) {
            toast.error('Failed to save', { id: t });
        }
    };

    const handleSyncNow = async () => {
        if (!currentHotel?.id) return;
        setSyncing(true);
        const t = toast.loading('Syncing all iCal feeds...');
        try {
            const res = await apiFetch(`/channels/${currentHotel.id}/sync`, { method: 'POST' });
            toast.success(`Sync complete! ${res.message || ''}`, { id: t });
            fetchStatus();
        } catch (e) {
            toast.error('Sync failed', { id: t });
        } finally {
            setSyncing(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const formatDate = (d) => {
        if (!d) return 'Never';
        return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return (
        <AdminLayout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Share2 size={24} className="text-blue-600" /> Channel Manager
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Connect your room types to OTA channels via iCal to prevent double-bookings automatically.
                        </p>
                    </div>
                    <button
                        onClick={handleSyncNow}
                        disabled={syncing}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync All Now'}
                    </button>
                </div>

                {/* Outbound Feed Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Link size={16} />
                        </div>
                        <h2 className="font-bold text-lg">Your Outbound iCal Feed</h2>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                        Paste this URL into Airbnb, Vrbo, or any OTA to export your existing bookings. They'll automatically see your blocked dates.
                    </p>
                    <div className="flex items-center bg-white/10 rounded-xl overflow-hidden border border-white/20">
                        <span className="text-xs font-mono text-slate-300 px-4 py-3 flex-1 truncate">
                            {data?.outboundUrl || `${API_BASE}/ical/${currentHotel?.id}`}
                        </span>
                        <button
                            onClick={() => copyToClipboard(data?.outboundUrl || '')}
                            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-shrink-0 flex items-center gap-2 text-sm font-bold"
                        >
                            <Copy size={14} /> Copy
                        </button>
                    </div>
                </div>

                {/* Room Type Connections */}
                <div>
                    <h2 className="text-lg font-bold text-slate-700 mb-3">
                        Inbound Connections <span className="text-sm font-normal text-slate-400">— paste iCal URL from each OTA</span>
                    </h2>

                    <div className="space-y-3">
                        {(data?.roomTypes || []).map(rt => (
                            <div key={rt.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${rt.isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {rt.isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{rt.name}</p>
                                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Clock size={10} /> Last synced: {formatDate(rt.lastSyncedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${rt.isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                                        {rt.isConnected ? 'Connected' : 'Not Connected'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="Paste iCal URL from Agoda, Booking.com, Airbnb..."
                                        value={editUrls[rt.id] || ''}
                                        onChange={e => setEditUrls(p => ({ ...p, [rt.id]: e.target.value }))}
                                        className="flex-1 text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                    />
                                    <button
                                        onClick={() => handleSaveUrl(rt.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all ${editUrls[rt.id]?.trim()
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                                        }`}
                                    >
                                        {editUrls[rt.id]?.trim() ? <><CheckCircle size={14}/> Save</> : <><Unlink size={14}/> Disconnect</>}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {!data?.roomTypes?.length && (
                            <div className="text-center py-12 text-slate-400">
                                <Share2 size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No room types found for this hotel.</p>
                                <p className="text-sm">Create room types first to set up channel connections.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Help Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
                    <p className="font-bold mb-1">📌 How to find your iCal URL:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li><b>Agoda:</b> Property Portal → Calendar → Export Calendar → Copy iCal link</li>
                        <li><b>Booking.com:</b> Extranet → Calendar → Sync → Export calendar</li>
                        <li><b>Airbnb:</b> Calendar → Availability → Import/Export → Export Calendar</li>
                    </ul>
                    <p className="mt-3 text-blue-600 text-xs">Sync runs automatically every 30 minutes. You can also click "Sync All Now" to sync immediately.</p>
                </div>
            </div>
        </AdminLayout>
    );
}
