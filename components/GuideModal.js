import { X, HelpCircle, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GuideModal({ isOpen, onClose, data }) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
                >
                    {/* Header */}
                    <div className="bg-emerald-500 p-6 flex justify-between items-start text-white">
                        <div className="flex gap-4">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                {data.icon ? <data.icon size={32} /> : <HelpCircle size={32} />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{data.title}</h2>
                                <p className="text-emerald-50 opacity-90 font-medium">Quick User Guide</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            {data.steps.map((step, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                            {step.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
