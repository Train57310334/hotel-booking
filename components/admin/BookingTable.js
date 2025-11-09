export default function BookingTable({ items = [], onSeeAll }){
  const Row = ({ b }) => (
    <tr className="border-b last:border-0">
      <td className="py-3 px-3 text-sm text-gray-600">#{b.id}</td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <img src={b.avatar} className="w-8 h-8 rounded-full" alt={b.guest}/>
          <div className="text-sm">{b.guest}</div>
        </div>
      </td>
      <td className="py-3 px-3 text-sm">{b.date}</td>
      <td className="py-3 px-3 text-sm">{b.room}</td>
      <td className="py-3 px-3 text-sm">฿{Number(b.amount).toLocaleString()}</td>
      <td className="py-3 px-3 text-sm">{b.type}</td>
      <td className="py-3 px-3">
        <span className={
          'px-2 py-1 rounded-full text-xs ' + 
          (b.status==='Complete' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
        }>{b.status}</span>
      </td>
      <td className="py-3 px-3">
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-lg border hover:bg-gray-50" title="Reschedule">⏲</button>
          <button className="w-8 h-8 rounded-lg border hover:bg-gray-50" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Booking</h3>
        <button onClick={onSeeAll} className="border rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50">See all</button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-2 px-3 font-medium">Booking ID</th>
              <th className="py-2 px-3 font-medium">Guest Name</th>
              <th className="py-2 px-3 font-medium">Date</th>
              <th className="py-2 px-3 font-medium">Room Number</th>
              <th className="py-2 px-3 font-medium">Amount</th>
              <th className="py-2 px-3 font-medium">Type</th>
              <th className="py-2 px-3 font-medium">Status</th>
              <th className="py-2 px-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(b => <Row key={b.id + '-' + b.room} b={b} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
