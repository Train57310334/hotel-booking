import { Info } from 'lucide-react'

export default function Tooltip({ children, content, width = 'w-64' }) {
    return (
        <div className="group relative inline-flex items-center">
            {children}
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${width} p-3 bg-slate-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center shadow-xl border border-slate-700`}>
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
            </div>
        </div>
    )
}

export function InfoTooltip({ content }) {
    return (
        <Tooltip content={content}>
            <Info size={16} className="text-slate-400 hover:text-emerald-500 cursor-help transition-colors" />
        </Tooltip>
    )
}
