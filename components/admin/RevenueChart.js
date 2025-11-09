export default function RevenueChart({ data = [] }){
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Revenue Statistics</h3>
        <select className="border rounded-lg px-2 py-1 text-sm"><option>This Month</option><option>Last Month</option></select>
      </div>
      <div className="h-56 flex items-end gap-3">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-green-600 rounded-t" style={{height: `${(d.value/max)*100}%`}}></div>
            <div className="text-xs text-gray-500 mt-2">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
