import { X, Check, Star, Zap, Shield, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function UpgradeModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleUpgrade = async () => {
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
            setLoading(false)
            setSuccess(true)
            // In real app, redirect to Stripe or handle payment here
        }, 1500)
    }

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Check size={32} strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Upgrade Requested!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Thank you for your interest in the PRO plan. Our team has been notified and will contact you shortly to complete the upgrade process.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header with Gradient */}
                <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10">
                        <X size={24} />
                    </button>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-300 mb-3 border border-white/10 uppercase tracking-wider">
                            <Sparkles size={12} /> Recommended
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-2">Upgrade to PRO</h2>
                        <p className="text-slate-300">Unlock the full potential of your hotel management system.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex items-end gap-2 mb-6">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">฿990</span>
                        <span className="text-slate-500 dark:text-slate-400 mb-1">/ month</span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <FeatureItem icon={<Zap className="text-amber-500" />} title="Unlimited Rooms" desc="Remove the 5-room limit and manage your entire property." />
                        <FeatureItem icon={<Shield className="text-emerald-500" />} title="Automated Payments" desc="Accept credit cards via Stripe/Omise directly." />
                        <FeatureItem icon={<Star className="text-blue-500" />} title="Advanced Analytics" desc="Deep dive into occupancy rates, RevPAR, and trends." />
                        <FeatureItem icon={<Check className="text-slate-400" />} title="Priority Support" desc="24/7 dedicated support channel." />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Upgrade Now <Zap size={18} className="group-hover:text-yellow-300 transition-colors" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3">
                        Secure payment via Stripe. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    )
}

function FeatureItem({ icon, title, desc }) {
    return (
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
