import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'

export default function HotelCard({ hotel, queryParams }) {
  const rating = hotel.avgRating ?? 0
  const reviews = hotel.numReviews ?? 0
  const price = hotel.minPrice

  return (
    <div className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col md:flex-row gap-4">
      {/* Image Container */}
      <div className="relative w-full md:w-72 h-48 md:h-auto rounded-2xl overflow-hidden shrink-0">
        <img
          src={hotel.imageUrl || "/images/hero-bg.png"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={hotel.name}
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/hero-bg.png' }}
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
          Recommended
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-2 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                {hotel.name}
              </h3>
              <div className="flex items-center text-slate-500 text-sm mt-1 gap-1">
                <MapPin size={14} className="text-primary-500" />
                {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
              </div>
            </div>

            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
              <span className="text-xs text-slate-500">({reviews})</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Array.isArray(hotel.amenities) && hotel.amenities.slice(0, 4).map(a => (
              <span key={a} className="px-2.5 py-1 rounded-md bg-slate-50 text-xs font-medium text-slate-600 border border-slate-100">
                {a}
              </span>
            ))}
            {(hotel.amenities?.length || 0) > 4 && (
              <span className="px-2.5 py-1 rounded-md bg-slate-50 text-xs font-medium text-slate-400 border border-slate-100">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            {price !== undefined ? (
              <>
                <p className="text-xs text-slate-400 font-medium mb-0.5">Start from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary-600 font-display">฿{Number(price).toLocaleString()}</span>
                  <span className="text-sm text-slate-400">/{queryParams?.checkIn && queryParams?.checkOut ? 'total' : 'night'}</span>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-sm">Check availability</p>
            )}
          </div>

          <Link
            href={`/hotel/${hotel.id}?checkIn=${encodeURIComponent(queryParams?.checkIn || '')}&checkOut=${encodeURIComponent(queryParams?.checkOut || '')}&guests=${encodeURIComponent(queryParams?.guests || 1)}`}
            className="btn-primary"
          >
            View Deal
          </Link>
        </div>
      </div>
    </div>
  )
}