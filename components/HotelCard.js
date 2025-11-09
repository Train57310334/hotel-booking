import Link from 'next/link'
export default function HotelCard({ hotel, queryParams }){
  const rating = hotel.avgRating ?? 0;
  const reviews = hotel.numReviews ?? 0;
  const price = hotel.minPrice;
  return (
    <div className="card p-4 flex flex-col md:flex-row gap-4">
      <img src={hotel.imageUrl || `https://images.unsplash.com/photo-1551776235-dde6d4829808?q=80&w=1200&auto=format&fit=crop`} className="w-full md:w-64 h-44 object-cover rounded-xl" alt={hotel.name}/>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="text-lg font-semibold">{hotel.name}</h3><p className="text-ink-500 text-sm">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</p></div>
          {price !== undefined && (<div className="text-right"><p className="text-sm text-ink-500">from</p><p className="text-xl font-semibold text-brand-700">฿{Number(price).toLocaleString()}</p><p className="text-xs text-ink-500">{queryParams?.checkIn && queryParams?.checkOut ? 'total' : '/night'}</p></div>)}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {reviews > 0 ? (<><span className="text-yellow-500">{'★'.repeat(Math.round(rating))}</span><span className="text-ink-500 text-sm">({reviews} reviews)</span></>) : <span className="text-ink-400 text-sm">No reviews yet</span>}
          {Array.isArray(hotel.amenities) && hotel.amenities.slice(0,4).map(a => (<span key={a} className="badge">{a}</span>))}
        </div>
        <div className="mt-3"><Link className="btn btn-primary" href={`/hotel/${hotel.id}?checkIn=${encodeURIComponent(queryParams?.checkIn || '')}&checkOut=${encodeURIComponent(queryParams?.checkOut || '')}&guests=${encodeURIComponent(queryParams?.guests || 1)}`}>View Details</Link></div>
      </div>
    </div>
  )
}