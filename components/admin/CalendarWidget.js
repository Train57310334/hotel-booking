export default function CalendarWidget({ monthLabel='November, 2024' }){
  const days = ['S','M','T','W','T','F','S'];
  const grid = [27,28,29,30,31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Booking Schedule</h3>
        <div className="flex items-center gap-2">
          <button className="bg-green-600 text-white w-8 h-8 rounded-lg">←</button>
          <div className="text-sm">{monthLabel}</div>
          <button className="bg-green-600 text-white w-8 h-8 rounded-lg">→</button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
        {days.map(d => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {grid.map((n,i)=> (
          <div key={i} className={`py-2 rounded-lg ${n===10||n===18||n===24? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-700'}`}>{n}</div>
        ))}
      </div>
    </div>
  )
}
