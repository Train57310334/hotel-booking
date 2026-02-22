import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { CreditCard, Save, AlertCircle, Key, Webhook } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import toast from 'react-hot-toast'
import Head from 'next/head'

export default function PlatformBillingSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [transactions, setTransactions] = useState([])
    const [summary, setSummary] = useState(null)
    const [settings, setSettings] = useState({
        stripeKey: '',
        stripeSecret: '',
        omisePublicKey: '',
        omiseSecretKey: ''
    })

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const [data, txData] = await Promise.all([
                apiFetch('/settings'),
                apiFetch('/subscriptions/payments')
            ])
            setSettings({
                stripeKey: data.stripeKey || '',
                stripeSecret: data.stripeSecret || '',
                omisePublicKey: data.omisePublicKey || '',
                omiseSecretKey: data.omiseSecretKey || ''
            })
            setTransactions(txData.payments || [])
            setSummary(txData.summary || null)
        } catch (error) {
            console.error('Failed to load settings:', error)
            toast.error('Failed to load platform settings')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setSettings(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await apiFetch('/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            })
            toast.success('Billing settings updated globally')
        } catch (error) {
            console.error('Failed to save:', error)
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <Head>
                <title>Platform Billing & API Keys | Super Admin</title>
            </Head>

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                        <CreditCard size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Platform Billing</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage global payment gateways used for Tenant Subscriptions</p>
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 flex gap-4">
                    <AlertCircle className="text-amber-500 shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Critical Area:</strong> These API keys belong to the Platform Owner (BookingKub HQ) and are solely for charging Subscription fees from our Tenants (Hotel Owners). They are NOT used by guests booking rooms.
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="text-indigo-500">Stripe</span> Configuration
                            </h2>
                        </div>
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg uppercase">Global Gateway</span>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    <Key size={14} className="text-slate-400" />
                                    Publishable Key
                                </label>
                                <input
                                    type="text"
                                    name="stripeKey"
                                    value={settings.stripeKey}
                                    onChange={handleChange}
                                    placeholder="pk_test_..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500 mt-2">Public key used on the frontend checkout.</p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    <Key size={14} className="text-slate-400" />
                                    Secret Key
                                </label>
                                <input
                                    type="password"
                                    name="stripeSecret"
                                    value={settings.stripeSecret}
                                    onChange={handleChange}
                                    placeholder="sk_test_..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500 mt-2">Secret key used strictly on the server.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Omise (Optional Future Gateway) */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden opacity-70">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Omise Configuration (Optional)</h2>
                        <p className="text-xs text-slate-500 mt-1">Alternative payment gateway for Asian markets.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Omise Public Key</label>
                                <input
                                    type="text"
                                    name="omisePublicKey"
                                    value={settings.omisePublicKey}
                                    onChange={handleChange}
                                    placeholder="pkey_test_..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Omise Secret Key</label>
                                <input
                                    type="password"
                                    name="omiseSecretKey"
                                    value={settings.omiseSecretKey}
                                    onChange={handleChange}
                                    placeholder="skey_test_..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscriptions Transaction Log */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mt-8">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Tenant Subscriptions Log</h2>
                            <p className="text-xs text-slate-500 mt-1">History of package upgrades from active properties.</p>
                        </div>
                        {summary && (
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Platform Revenue</p>
                                <p className="text-2xl font-black text-emerald-600">฿{(summary.totalRevenue / 100).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Package</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No subscription transactions found.</td>
                                    </tr>
                                ) : transactions.map(tx => (
                                    <tr key={tx.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                                            {tx.chargeId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{tx.hotel?.name || 'Unknown Hotel'}</div>
                                            <div className="text-[10px] text-slate-500">{tx.hotel?.contactEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${tx.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                                    tx.plan === 'PRO' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                        'bg-slate-100 text-slate-700 border border-slate-200'
                                                }`}>
                                                {tx.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            ฿{(tx.amount / 100).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end pt-4 mb-10">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Global Settings'}
                    </button>
                </div>
            </div>
        </AdminLayout>
    )
}
