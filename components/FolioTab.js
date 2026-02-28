import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Receipt, CreditCard, Banknote, Coffee, Wine, AlertTriangle, ScanLine } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function FolioTab({ booking, onUpdate }) {
    const { user } = useAuth();
    const [folio, setFolio] = useState(null);
    const [loading, setLoading] = useState(true);

    // Add charge form state
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newCharge, setNewCharge] = useState({
        description: '',
        amount: '',
        type: 'ROOM_SERVICE'
    });
    const [addLoading, setAddLoading] = useState(false);

    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('owner');

    useEffect(() => {
        if (booking?.id) {
            fetchFolio();
        }
    }, [booking?.id]);

    const fetchFolio = async () => {
        try {
            const data = await apiFetch(`/folio/${booking.id}`);
            setFolio(data);
        } catch (error) {
            console.error('Failed to load folio:', error);
            toast.error('Failed to load folio details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCharge = async (e) => {
        e.preventDefault();
        if (!newCharge.description || !newCharge.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        setAddLoading(true);
        const tid = toast.loading('Adding charge...');
        try {
            await apiFetch(`/folio/${booking.id}/charges`, {
                method: 'POST',
                body: JSON.stringify({
                    amount: Number(newCharge.amount),
                    description: newCharge.description,
                    type: newCharge.type
                })
            });

            toast.success('Charge added successfully', { id: tid });
            setNewCharge({ description: '', amount: '', type: 'ROOM_SERVICE' });
            setIsAddingSection(false);
            fetchFolio(); // Refresh data
            if (onUpdate) onUpdate(); // Refresh parent booking data if needed
        } catch (error) {
            console.error('Failed to add charge:', error);
            toast.error('Failed to add charge', { id: tid });
        } finally {
            setAddLoading(false);
        }
    };

    const handleRemoveCharge = async (id) => {
        if (!confirm('Are you sure you want to void this charge?')) return;

        const tid = toast.loading('Voiding charge...');
        try {
            await apiFetch(`/folio/charges/${id}`, { method: 'DELETE' });
            toast.success('Charge voided', { id: tid });
            fetchFolio();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to remove charge:', error);
            toast.error('Failed to void charge', { id: tid });
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'ROOM_SERVICE': return <Coffee size={16} className="text-amber-500" />;
            case 'MINIBAR': return <Wine size={16} className="text-rose-500" />;
            case 'LAUNDRY': return <ScanLine size={16} className="text-blue-500" />;
            case 'DAMAGE': return <AlertTriangle size={16} className="text-red-500" />;
            default: return <Receipt size={16} className="text-slate-500" />;
        }
    };

    const getTypeBadge = (type) => {
        const labels = {
            'ROOM_SERVICE': 'Room Service',
            'MINIBAR': 'Minibar',
            'LAUNDRY': 'Laundry',
            'DAMAGE': 'Damage / Penalty',
            'OTHER': 'Other'
        };
        return <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{labels[type] || 'Other'}</span>;
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading Folio Information...</div>;
    }

    if (!folio) {
        return <div className="p-8 text-center text-slate-400">Folio data not available.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1">Room Standard</p>
                    <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">฿{folio.roomTotal.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">Extra Charges</p>
                    <p className="text-2xl font-display font-bold text-amber-600">฿{folio.totalCharges.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">Total Paid</p>
                    <p className="text-xl font-bold text-emerald-600">฿{folio.totalPaid.toLocaleString()}</p>
                </div>
                <div className="border-l md:pl-6 border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-400 uppercase mb-1">Outstanding</p>
                    <p className={`text-3xl font-display font-bold ${folio.balance > 0 ? 'text-rose-600' : 'text-emerald-500'}`}>
                        ฿{Math.max(0, folio.balance).toLocaleString()}
                    </p>
                    {folio.balance < 0 && <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">Refund Due</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Extra Charges */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Receipt size={18} className="text-slate-400" /> Incidentals
                        </h4>
                        <button
                            onClick={() => setIsAddingSection(!isAddingSection)}
                            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isAddingSection ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400'}`}
                        >
                            <Plus size={14} /> Add Charge
                        </button>
                    </div>

                    {/* Add Charge Form inline */}
                    {isAddingSection && (
                        <form onSubmit={handleAddCharge} className="mb-4 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1">Amount (THB)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={newCharge.amount}
                                            onChange={(e) => setNewCharge({ ...newCharge, amount: e.target.value })}
                                            className="w-full text-sm p-2 rounded-lg border border-indigo-200 dark:border-indigo-500/30 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 block"
                                            placeholder="500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1">Category</label>
                                        <select
                                            value={newCharge.type}
                                            onChange={(e) => setNewCharge({ ...newCharge, type: e.target.value })}
                                            className="w-full text-sm p-2 rounded-lg border border-indigo-200 dark:border-indigo-500/30 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 block"
                                        >
                                            <option value="ROOM_SERVICE">Room Service</option>
                                            <option value="MINIBAR">Minibar</option>
                                            <option value="LAUNDRY">Laundry</option>
                                            <option value="DAMAGE">Damage</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1">Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCharge.description}
                                        onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
                                        className="w-full text-sm p-2 rounded-lg border border-indigo-200 dark:border-indigo-500/30 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 block"
                                        placeholder="e.g., 2x Coke from Minibar"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingSection(false)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5"
                                    >Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={addLoading}
                                        className="text-xs font-bold bg-indigo-600 text-white px-4 py-1.5 rounded-lg shadow disabled:opacity-50"
                                    >Post Charge</button>
                                </div>
                            </div>
                        </form>
                    )}

                    {folio.charges.length === 0 ? (
                        <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm">
                            No incidental charges posted yet.
                        </div>
                    ) : (
                        <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 text-xs uppercase">Item</th>
                                        <th className="px-4 py-3 text-right font-bold text-slate-500 text-xs uppercase">Amount</th>
                                        <th className="px-4 py-3 text-right font-bold text-slate-500 text-xs uppercase w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {folio.charges.map((charge) => (
                                        <tr key={charge.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1 text-slate-700 dark:text-slate-300">
                                                    <span className="font-bold flex items-center gap-1.5">{getTypeIcon(charge.type)} {charge.description}</span>
                                                    <div className="flex items-center gap-2">
                                                        {getTypeBadge(charge.type)}
                                                        <span className="text-[10px] text-slate-400">{new Date(charge.date || charge.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                                                ฿{charge.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {isAdmin && (
                                                    <button onClick={() => handleRemoveCharge(charge.id)} className="text-slate-300 hover:text-rose-500 transition-colors" title="Void Charge">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right Column: Transactions & Payments */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <CreditCard size={18} className="text-slate-400" /> Payments Ledger
                    </h4>

                    {folio.transactions.length === 0 ? (
                        <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm">
                            No payments recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {folio.transactions.map((txn, index) => (
                                <div key={txn.id || index} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <Banknote size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                                Payment
                                                {txn.isManual && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">Manual Entry</span>}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <span className="uppercase">{txn.method || txn.provider || 'unknown'}</span> • {new Date(txn.createdAt || txn.date).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600">- ฿{txn.amount.toLocaleString()}</p>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">{txn.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
