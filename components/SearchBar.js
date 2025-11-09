export default function SearchBar({ query }){
  return (
    <form method="GET" action="/" className="card p-3 md:p-4 grid grid-cols-2 md:grid-cols-6 gap-2">
      <input name="destination" defaultValue={query.destination||''} placeholder="Destination" className="col-span-2 md:col-span-2 border border-ink-200 rounded-lg px-3 py-2"/>
      <input type="date" name="checkIn" defaultValue={query.checkIn||''} className="col-span-1 border border-ink-200 rounded-lg px-3 py-2"/>
      <input type="date" name="checkOut" defaultValue={query.checkOut||''} className="col-span-1 border border-ink-200 rounded-lg px-3 py-2"/>
      <input type="number" name="guests" min="1" defaultValue={query.guests||1} className="col-span-1 border border-ink-200 rounded-lg px-3 py-2" placeholder="Guests"/>
      <button className="btn btn-primary col-span-1">Search</button>
    </form>
  )
}