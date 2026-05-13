import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { CreditCard, Save, AlertCircle, Key, Webhook, Eye, EyeOff, Shield } from 'lucide-react'
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
        stripeWebhookSecret: '',
        omisePublicKey: '',
        omiseSecretKey: ''
    })
    const [showStripeSecret, setShowStripeSecret] = useState(false)
    const [showStripeWebhook, setShowStripeWebhook] = useState(false)
    const [showOmiseSecret, setShowOmiseSecret] = useState(false)

    useEffect(() => {
        loadSettings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                stripeWebhookSecret: data.stripeWebhookSecret || '',
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

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center shadow-inner">
                                <svg className="w-6 h-6 text-[#635BFF]" fill="currentColor" viewBox="0 0 40 40">
                                    <path d="M19.1 14.1c0-2.3 1.9-3.3 4.8-3.3 3.6 0 7.4 1.4 10.3 3.4l2.8-9.4C33.7 2.3 28.5.8 23.5.8c-9.5 0-16.1 4.9-16.1 13.6 0 14.4 20.3 12.1 20.3 18.7 0 2.7-2.3 3.8-5.7 3.8-4.4 0-9.2-1.9-12.7-4.5L6.1 42c4.1 2.3 10.3 4 16.5 4 10 0 16.5-4.8 16.5-13.8-.1-15.1-20-12.7-20-18.1z"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    Stripe Configuration
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Primary global payment gateway for processing tenant subscriptions.</p>
                            </div>
                        </div>
                        <span className="px-4 py-1.5 bg-[#635BFF]/10 text-[#635BFF] text-xs font-black rounded-xl uppercase tracking-wider whitespace-nowrap self-start md:self-auto shadow-sm">Global Gateway</span>
                    </div>
                    
                    <div className="p-6 md:p-8 space-y-8">
                        {/* Publishable Key */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start">
                            <div className="md:w-1/3">
                                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1.5">
                                    <Key size={16} className="text-slate-400" />
                                    Publishable Key
                                </label>
                                <p className="text-xs text-slate-500 leading-relaxed pr-4">Public-facing key used to securely transmit credit card details from the frontend to Stripe.</p>
                            </div>
                            <div className="md:w-2/3">
                                <input
                                    type="text"
                                    name="stripeKey"
                                    value={settings.stripeKey}
                                    onChange={handleChange}
                                    placeholder="pk_test_..."
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#635BFF]/50 focus:border-[#635BFF] dark:text-white font-mono text-sm transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

                        {/* Secret Key */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start">
                            <div className="md:w-1/3">
                                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1.5">
                                    <Shield size={16} className="text-rose-500" />
                                    Secret Key
                                </label>
                                <p className="text-xs text-slate-500 leading-relaxed pr-4">Highly sensitive key used by the backend to create charges and manage subscriptions. Keep this safe.</p>
                            </div>
                            <div className="md:w-2/3 relative">
                                <input
                                    type={showStripeSecret ? "text" : "password"}
                                    name="stripeSecret"
                                    value={settings.stripeSecret}
                                    onChange={handleChange}
                                    placeholder="sk_test_..."
                                    className="w-full px-4 py-3.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#635BFF]/50 focus:border-[#635BFF] dark:text-white font-mono text-sm transition-all shadow-sm"
                                />
                                <button type="button" onClick={() => setShowStripeSecret(!showStripeSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    {showStripeSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

                        {/* Webhook Secret */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start">
                            <div className="md:w-1/3">
                                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1.5">
                                    <Webhook size={16} className="text-emerald-500" />
                                    Webhook Secret
                                </label>
                                <p className="text-xs text-slate-500 leading-relaxed pr-4">Used to verify that webhook events (like payment success) actually came from Stripe.</p>
                            </div>
                            <div className="md:w-2/3 relative">
                                <input
                                    type={showStripeWebhook ? "text" : "password"}
                                    name="stripeWebhookSecret"
                                    value={settings.stripeWebhookSecret}
                                    onChange={handleChange}
                                    placeholder="whsec_..."
                                    className="w-full px-4 py-3.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#635BFF]/50 focus:border-[#635BFF] dark:text-white font-mono text-sm transition-all shadow-sm"
                                />
                                <button type="button" onClick={() => setShowStripeWebhook(!showStripeWebhook)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    {showStripeWebhook ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Omise (Optional Future Gateway) */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shadow-inner">
                                <CreditCard size={24} className="text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Omise Configuration <span className="font-medium text-slate-400 text-sm">(Optional)</span></h2>
                                <p className="text-sm text-slate-500 mt-1">Alternative payment gateway primarily for Asian markets (PromptPay support).</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 md:p-8 space-y-8">
                        {/* Omise Public Key */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start">
                            <div className="md:w-1/3">
                                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1.5">
                                    <Key size={16} className="text-slate-400" />
                                    Public Key
                                </label>
                                <p className="text-xs text-slate-500 leading-relaxed pr-4">Used on the frontend checkout for tokenizing cards securely.</p>
                            </div>
                            <div className="md:w-2/3">
                                <input
                                    type="text"
                                    name="omisePublicKey"
                                    value={settings.omisePublicKey}
                                    onChange={handleChange}
                                    placeholder="pkey_test_..."
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white font-mono text-sm transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

                        {/* Omise Secret Key */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start">
                            <div className="md:w-1/3">
                                <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1.5">
                                    <Shield size={16} className="text-rose-500" />
                                    Secret Key
                                </label>
                                <p className="text-xs text-slate-500 leading-relaxed pr-4">Used by the backend to create charges. Never expose this to the public.</p>
                            </div>
                            <div className="md:w-2/3 relative">
                                <input
                                    type={showOmiseSecret ? "text" : "password"}
                                    name="omiseSecretKey"
                                    value={settings.omiseSecretKey}
                                    onChange={handleChange}
                                    placeholder="skey_test_..."
                                    className="w-full px-4 py-3.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white font-mono text-sm transition-all shadow-sm"
                                />
                                <button type="button" onClick={() => setShowOmiseSecret(!showOmiseSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    {showOmiseSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
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
                                <p className="text-2xl font-black text-blue-600">฿{(summary.totalRevenue / 100).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-2.5">Transaction ID</th>
                                    <th className="px-4 py-2.5">Property</th>
                                    <th className="px-4 py-2.5">Package</th>
                                    <th className="px-4 py-2.5">Amount</th>
                                    <th className="px-4 py-2.5">Status</th>
                                    <th className="px-4 py-2.5">Date</th>
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
                                        <td className="px-4 py-2.5">
                                            <div className="font-bold text-slate-900 dark:text-white">{tx.hotel?.name || 'Unknown Hotel'}</div>
                                            <div className="text-[10px] text-slate-500">{tx.hotel?.contactEmail}</div>
                                        </td>
                                        <td className="px-4 py-2.5">
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
                                        <td className="px-4 py-2.5">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${tx.status === 'success' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
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

