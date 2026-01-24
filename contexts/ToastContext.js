import { createContext, useContext, useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext()

export function useToast() {
    return useContext(ToastContext)
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])

        if (duration) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    const value = {
        show: addToast,
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration)
    }

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onClose }) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Small delay to trigger animation
        const timer = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timer)
    }, [])

    const getStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-white border-l-4 border-emerald-500 text-slate-800 dark:bg-slate-800 dark:text-white'
            case 'error': return 'bg-white border-l-4 border-rose-500 text-slate-800 dark:bg-slate-800 dark:text-white'
            case 'warning': return 'bg-white border-l-4 border-amber-500 text-slate-800 dark:bg-slate-800 dark:text-white'
            default: return 'bg-white border-l-4 border-blue-500 text-slate-800 dark:bg-slate-800 dark:text-white'
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-emerald-500" />
            case 'error': return <AlertCircle size={20} className="text-rose-500" />
            case 'warning': return <AlertCircle size={20} className="text-amber-500" />
            default: return <Info size={20} className="text-blue-500" />
        }
    }

    return (
        <div
            className={`pointer-events-auto transform transition-all duration-300 ease-out flex items-start gap-3 p-4 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 ${getStyles(toast.type)} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <div className="flex-shrink-0 pt-0.5">{getIcon(toast.type)}</div>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={16} />
            </button>
        </div>
    )
}
