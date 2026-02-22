import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Plus, Trash2, CreditCard, Receipt, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import PaymentModal from '@/components/PaymentModal'
import ConfirmationModal from '@/components/ConfirmationModal'

export default function FolioTab({ booking, onUpdate }) {
    const [folio, setFolio] = useState(null)
    const [isAddChargeOpen, setIsAddChargeOpen] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [chargeToVoid, setChargeToVoid] = useState(null)

    // Form State
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [type, setType] = useState('ROOM_SERVICE')

    useEffect(() => {
        if (booking?.id) fetchFolio()
    }, [booking])

    const fetchFolio = async () => {
        try {
            const data = await apiFetch(`/folio/${booking.id}`)
            setFolio(data)
        } catch (error) {
            console.error("Failed to load folio", error)
            toast.error("Failed to load billing details")
        }
    }

    const handleAddCharge = async (e) => {
        e.preventDefault()
        try {
            await apiFetch(`/folio/${booking.id}/charges`, {
                method: 'POST',
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                    type
                })
            })
            toast.success('Charge added')
            setIsAddChargeOpen(false)
            setDescription('')
            setAmount('')
            fetchFolio()
            onUpdate && onUpdate()
        } catch (error) {
            toast.error('Failed to add charge')
        }
    }

    const confirmVoid = async () => {
        if (!chargeToVoid) return
        try {
            await apiFetch(`/folio/charges/${chargeToVoid}`, { method: 'DELETE' })
            toast.success('Charge voided')
            fetchFolio()
            onUpdate && onUpdate()
        } catch (error) {
            toast.error('Failed to void charge')
        } finally {
            setChargeToVoid(null)
        }
    }

    const handleDownloadInvoice = async () => {
        try {
            const data = await apiFetch(`/bookings/${booking.id}/invoice`)
            // Simplest way to "download" JSON as a file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Invoice-${booking.id}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('Invoice downloaded')
        } catch (error) {
            console.error('Failed to download invoice', error)
            toast.error('Failed to get invoice')
        }
    }

    if (!folio) return <div className="p-8 text-center text-slate-400">Loading Billing Details...</div>

    return (
        <div className="space-y-6">
            {/* Balance Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Charges</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">฿{(folio.roomTotal + folio.totalCharges).toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">Room: ฿{folio.roomTotal.toLocaleString()} + Extras: ฿{folio.totalCharges.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Paid</p>
                    <p className="text-xl font-bold text-emerald-600">฿{folio.totalPaid.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-xl border-2 ${folio.balance > 0 ? 'border-rose-100 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-900/30' : 'border-emerald-100 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900/30'}`}>
                    <p className={`text-xs font-bold uppercase mb-1 ${folio.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Balance Due</p>
                    <p className={`text-xl font-bold ${folio.balance > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        ฿{folio.balance.toLocaleString()}
                    </p>
                    {folio.balance > 0 && (
                        <button
                            onClick={() => setShowPayment(true)}
                            className="mt-2 w-full py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-sm flex items-center justify-center gap-2"
                        >
                            <CreditCard size={14} /> Pay Balance
                        </button>
                    )}
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-slate-50/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Receipt size={18} /> Transactions
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadInvoice}
                            className="text-xs bg-white text-slate-600 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                        >
                            <FileText size={14} /> Get Invoice
                        </button>
                        <button
                            onClick={() => setIsAddChargeOpen(true)}
                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 border border-indigo-100 transition-colors flex items-center gap-1"
                        >
                            <Plus size={14} /> Add Charge
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-4 py-3">Item / Description</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {/* Room Charge */}
                            <tr className="bg-white dark:bg-slate-800">
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Room Charge ({booking.roomType?.name})</td>
                                <td className="px-4 py-3"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-500 dark:text-slate-300 font-bold">ROOM</span></td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">฿{folio.roomTotal.toLocaleString()}</td>
                                <td className="px-4 py-3 text-center text-slate-300">-</td>
                            </tr>

                            {/* Extra Charges */}
                            {folio.charges.map(charge => (
                                <tr key={charge.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                                        {charge.description}
                                        <div className="text-[10px] text-slate-400">{new Date(charge.date).toLocaleString()}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-xs font-bold uppercase">{charge.type.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">฿{charge.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setChargeToVoid(charge.id)}
                                            className="text-slate-400 hover:text-rose-500 transition-colors" title="Void Charge"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* Payments (Credits) */}
                            {folio.transactions.map(tx => (
                                <tr key={tx.id} className="bg-emerald-50/30 dark:bg-emerald-900/10">
                                    <td className="px-4 py-3 text-emerald-800 dark:text-emerald-400 font-medium">
                                        Payment Received ({tx.provider})
                                        <div className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded text-xs font-bold uppercase">PAYMENT</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">- ฿{tx.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center text-emerald-300 dark:text-emerald-600/50">
                                        <div className="text-[10px] uppercase font-bold">{tx.status}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {folio.charges.length === 0 && folio.transactions.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">No extra charges or payments yet.</div>
                    )}
                </div>
            </div>

            {/* Add Charge Modal */}
            {isAddChargeOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">Add Extra Charge</h3>
                        <form onSubmit={handleAddCharge} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <input
                                    type="text" required
                                    placeholder="e.g. Minibar, Laundry"
                                    className="w-full p-2 border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    value={description} onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (THB)</label>
                                    <input
                                        type="number" required min="0" step="1"
                                        placeholder="0.00"
                                        className="w-full p-2 border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={amount} onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                    <select
                                        className="w-full p-2 border border-slate-200 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        value={type} onChange={e => setType(e.target.value)}
                                    >
                                        <option value="ROOM_SERVICE">Room Service</option>
                                        <option value="LAUNDRY">Laundry</option>
                                        <option value="MINIBAR">Minibar</option>
                                        <option value="DAMAGE">Damage Fee</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsAddChargeOpen(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Add Charge</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPayment && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    booking={{ ...booking, totalAmount: folio.balance }} // Hack: Override amount with balance
                    onSuccess={() => {
                        setShowPayment(false)
                        fetchFolio()
                        onUpdate && onUpdate()
                    }}
                />
            )}

            <ConfirmationModal
                isOpen={!!chargeToVoid}
                onClose={() => setChargeToVoid(null)}
                onConfirm={confirmVoid}
                title="Void Charge"
                message="Are you sure you want to remove this charge? This action cannot be undone."
                confirmText="Yes, Void it"
                type="danger"
            />
        </div>
    )
}
