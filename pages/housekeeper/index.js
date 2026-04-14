import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import {
  Sparkles, CheckCircle2, Trash2, AlertCircle, Wrench,
  ChevronRight, X, TriangleAlert, User, LogOut, SprayCan
} from 'lucide-react';

const API = API_BASE;

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS = {
  DIRTY:    { label: 'Dirty',        color: 'bg-red-500',    text: 'text-red-600',    badge: 'bg-red-50 border-red-200 text-red-700' },
  CLEANING: { label: 'Cleaning',     color: 'bg-amber-500',  text: 'text-amber-600',  badge: 'bg-amber-50 border-amber-200 text-amber-700' },
  CLEAN:    { label: 'Clean',        color: 'bg-blue-500',   text: 'text-blue-600',   badge: 'bg-blue-50 border-blue-200 text-blue-700' },
  INSPECTED:{ label: 'Ready',        color: 'bg-teal-500',text: 'text-teal-600',badge: 'bg-teal-50 border-teal-200 text-teal-700' },
  OOO:      { label: 'Out of Order', color: 'bg-slate-500',  text: 'text-slate-600',  badge: 'bg-slate-100 border-slate-300 text-slate-700' },
};

const NEXT_STATUS = { DIRTY: 'CLEANING', CLEANING: 'CLEAN', CLEAN: 'INSPECTED' };
const NEXT_LABEL  = { DIRTY: 'Start Cleaning', CLEANING: 'Mark as Clean', CLEAN: 'Mark Ready' };
const NEXT_COLOR  = { DIRTY: 'bg-amber-500 hover:bg-amber-600', CLEANING: 'bg-blue-500 hover:bg-blue-600', CLEAN: 'bg-teal-500 hover:bg-teal-600' };

const CATEGORIES = ['Plumbing', 'Electrical', 'Furniture', 'A/C & Heating', 'Bathroom', 'Other'];

export default function HousekeeperApp() {
  const [token, setToken]           = useState(null);
  const [hotelId, setHotelId]       = useState('');
  const [myName, setMyName]         = useState('');
  const [loginInput, setLoginInput] = useState({ hotelId: '', name: '' });
  const [roomTypes, setRoomTypes]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [reportRoom, setReportRoom] = useState(null); // room object for report sheet
  const [report, setReport]         = useState({ category: 'Plumbing', priority: 'NORMAL', description: '' });

  // Load token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('hk_session');
    if (stored) {
      try {
        const { token: t, hotelId: h, name: n } = JSON.parse(stored);
        setToken(t); setHotelId(h); setMyName(n);
      } catch {}
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    if (!token || !hotelId) return;
    try {
      const res = await fetch(`${API}/housekeeping/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) { setToken(null); localStorage.removeItem('hk_session'); return; }
      setRoomTypes(await res.json());
    } catch (e) { console.error(e); }
  }, [token, hotelId]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchRooms().finally(() => setLoading(false));
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, [token, fetchRooms]);

  // ─── Login ───────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // We use the receptionist/admin token flow — ask user to use their credentials
      // OR we use a special housekeeper PIN endpoint
      // For now do a standard JWT login and store it
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginInput.email, password: loginInput.password }),
      });
      if (!res.ok) { toast.error('Invalid credentials'); return; }
      const { access_token } = await res.json();
      // Validate hotelId by fetching housekeeping data
      const test = await fetch(`${API}/housekeeping/${loginInput.hotelId}`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      if (!test.ok) { toast.error('Hotel ID not found or no access'); return; }
      
      const session = { token: access_token, hotelId: loginInput.hotelId, name: loginInput.name };
      localStorage.setItem('hk_session', JSON.stringify(session));
      setToken(access_token); setHotelId(loginInput.hotelId); setMyName(loginInput.name);
    } catch { toast.error('Login failed'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('hk_session');
    setToken(null); setHotelId(''); setMyName('');
  };

  // ─── Status Update ───────────────────────────────────────────────────────
  const updateStatus = async (roomId, newStatus) => {
    // Optimistic update
    setRoomTypes(prev => prev.map(rt => ({
      ...rt,
      rooms: rt.rooms.map(r => r.id === roomId ? { ...r, status: newStatus } : r)
    })));

    const t = toast.loading('Updating...');
    try {
      const res = await fetch(`${API}/housekeeping/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, note: `Updated by ${myName}` }),
      });
      if (!res.ok) throw new Error();
      toast.success('Status updated!', { id: t });
    } catch {
      toast.error('Failed to update', { id: t });
      fetchRooms();
    }
  };

  // ─── Report Issue ────────────────────────────────────────────────────────
  const submitReport = async () => {
    if (!report.description.trim()) { toast.error('Please describe the issue'); return; }
    const t = toast.loading('Submitting report...');
    try {
      const res = await fetch(`${API}/housekeeping/rooms/${reportRoom.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...report, reportedBy: myName }),
      });
      if (!res.ok) throw new Error();
      toast.success('Issue reported!', { id: t });
      setReportRoom(null);
      setReport({ category: 'Plumbing', priority: 'NORMAL', description: '' });
    } catch { toast.error('Failed to submit', { id: t }); }
  };

  // ─── Sort rooms: Dirty first, then Cleaning, rest alphabetically ─────────
  const priorityOrder = { DIRTY: 0, CLEANING: 1, CLEAN: 2, INSPECTED: 3, OOO: 4, OCCUPIED: 5 };
  const allRooms = roomTypes.flatMap(rt =>
    rt.rooms.map(r => ({ ...r, roomTypeName: rt.name }))
  ).sort((a, b) => (priorityOrder[a.status] ?? 9) - (priorityOrder[b.status] ?? 9));

  // ─── Login Screen ─────────────────────────────────────────────────────────
  if (!token) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <SprayCan size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Housekeeper</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to start your shift</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="text"
            placeholder="Your name (e.g. Maria)"
            value={loginInput.name}
            onChange={e => setLoginInput(p => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Hotel ID"
            value={loginInput.hotelId}
            onChange={e => setLoginInput(p => ({ ...p, hotelId: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={loginInput.email}
            onChange={e => setLoginInput(p => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginInput.password}
            onChange={e => setLoginInput(p => ({ ...p, password: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In & Start Shift'}
          </button>
        </form>
      </div>
    </div>
  );

  // ─── Main Task List ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-[#0f172a] text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-slate-300">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}</p>
          <h1 className="text-lg font-bold">{myName || 'Housekeeper'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full">
            {allRooms.filter(r => r.status === 'DIRTY' || r.status === 'CLEANING').length} tasks left
          </span>
          <button onClick={handleLogout} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 grid grid-cols-4 gap-2">
        {[
          { label: 'Dirty',    count: allRooms.filter(r => r.status === 'DIRTY').length,    color: 'text-red-600' },
          { label: 'Cleaning', count: allRooms.filter(r => r.status === 'CLEANING').length, color: 'text-amber-600' },
          { label: 'Clean',    count: allRooms.filter(r => r.status === 'CLEAN' || r.status === 'INSPECTED').length, color: 'text-blue-600' },
          { label: 'OOO',      count: allRooms.filter(r => r.status === 'OOO').length,      color: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-2 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Room Cards */}
      <div className="px-4 space-y-3 mt-1">
        {loading && allRooms.length === 0 && (
          <div className="text-center py-10 text-slate-400">Loading rooms...</div>
        )}
        {allRooms.map(room => {
          const cfg = STATUS[room.status] || STATUS.INSPECTED;
          const next = NEXT_STATUS[room.status];
          return (
            <div key={room.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* top color bar */}
              <div className={`h-1.5 ${cfg.color}`} />
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-lg ${cfg.badge}`}>
                      {room.roomNumber}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{room.roomTypeName}</p>
                      <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                      {room.isOccupied && (
                        <span className="ml-2 text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md border border-indigo-100">
                          <User size={8} className="inline mr-0.5" />In-House
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Report Issue button */}
                  <button
                    onClick={() => setReportRoom(room)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                    title="Report Issue"
                  >
                    <TriangleAlert size={18} />
                  </button>
                </div>

                {/* Action Button */}
                {next ? (
                  <button
                    onClick={() => updateStatus(room.id, next)}
                    className={`w-full py-3 ${NEXT_COLOR[room.status]} text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
                  >
                    {room.status === 'DIRTY' && <Sparkles size={16} />}
                    {room.status === 'CLEANING' && <CheckCircle2 size={16} />}
                    {room.status === 'CLEAN' && <CheckCircle2 size={16} />}
                    {NEXT_LABEL[room.status]}
                  </button>
                ) : (
                  <div className="w-full py-3 bg-slate-50 text-slate-400 font-bold text-sm rounded-xl flex items-center justify-center gap-2 border border-dashed border-slate-200">
                    {room.status === 'OOO' ? <><AlertCircle size={16} /> Out of Order</> : <><CheckCircle2 size={16} /> Ready for Guest</>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Issue Bottom Sheet */}
      {reportRoom && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReportRoom(null)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800 text-lg">
                <TriangleAlert size={18} className="inline text-red-500 mr-1" />
                Report Issue — Room {reportRoom.roomNumber}
              </h2>
              <button onClick={() => setReportRoom(null)} className="p-2 rounded-full bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setReport(p => ({ ...p, category: cat }))}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        report.category === cat
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['LOW','Low','bg-slate-50 border-slate-200 text-slate-600'],['NORMAL','Normal','bg-amber-50 border-amber-200 text-amber-700'],['HIGH','Urgent','bg-red-50 border-red-200 text-red-700']].map(([val, label, cls]) => (
                    <button
                      key={val}
                      onClick={() => setReport(p => ({ ...p, priority: val }))}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        report.priority === val ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      } ${cls}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Description</label>
                <textarea
                  value={report.description}
                  onChange={e => setReport(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the issue in detail..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                onClick={submitReport}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <TriangleAlert size={16} /> Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
