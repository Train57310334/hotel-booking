export default function StatsCard({ icon, title, value, hint }){
  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs text-gray-400 mt-1">{hint}</div>
        </div>
      </div>
    </div>
  )
}
