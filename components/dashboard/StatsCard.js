export default function StatsCard({ icon: Icon, title, value, subtext, color = "green" }) {
    const colorStyles = {
        green: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600",
        purple: "bg-purple-50 text-purple-600",
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{value}</h3>
                {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
            </div>
        </div>
    )
}
