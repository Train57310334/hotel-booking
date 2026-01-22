import Layout from '@/components/Layout'
import RoomCard from '@/components/RoomCard'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { MapPin, Star } from 'lucide-react'

export default function HotelDetail() {
  const router = useRouter()
  const { id, checkIn, checkOut, guests = 1 } = router.query
  const [hotel, setHotel] = useState(null)
  const [nights, setNights] = useState(1)

  useEffect(() => {
    if (id) {
      fetch(`/api/hotels/${id}`)
        .then(res => res.json())
        .then(data => setHotel(data))

      if (checkIn && checkOut) {
        const d1 = new Date(checkIn)
        const d2 = new Date(checkOut)
        const diff = Math.max((d2 - d1) / (1000 * 60 * 60 * 24), 1)
        setNights(diff)
      }
    }
  }, [id, checkIn, checkOut])

  if (!hotel) return (
    <Layout>
      <div className="container mx-auto p-20 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-slate-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    </Layout>
  )

  let avgRating = 0, numReviews = 0
  if (Array.isArray(hotel.reviews) && hotel.reviews.length) {
    numReviews = hotel.reviews.length
    avgRating = (hotel.reviews.reduce((s, r) => s + (r.rating || 0), 0) / numReviews).toFixed(1)
  }

  const roomTypes = hotel.roomTypes || []
  // Mock availability
  const availability = roomTypes.reduce((m, rt, i) => (m[rt.id] = Math.max(1, 5 - i), m), {})

  const handleBook = (rt, planName, pricePerNight) => {
    const selection = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomTypeId: rt.id,
      roomTypeName: rt.name,
      ratePlanName: planName,
      checkIn,
      checkOut,
      guests,
      totalPrice: pricePerNight * nights
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookingSelection', JSON.stringify(selection))
    }
    router.push('/booking/guest-info')
  }

  return (
    <Layout>
      {/* Immersive Header */}
      <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
        <img
          alt={hotel.name}
          src={hotel.imageUrl || "/images/hero-bg.png"}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/hero-bg.png' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 pb-12 pt-32 bg-gradient-to-t from-slate-900 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">{hotel.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-primary-400" />
                  <span className="text-lg">{hotel.address ? hotel.address + ', ' : ''}{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
                </div>
                {numReviews > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{avgRating}</span>
                    <span className="text-white/60 text-sm">({numReviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About & Amenities */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold font-display text-slate-900 mb-4">About this stay</h3>
              <p className="text-slate-600 leading-relaxed mb-6">{hotel.description || "Experience luxury and comfort in the heart of the city. This hotel offers world-class amenities and breathtaking views."}</p>

              <h4 className="font-bold text-slate-900 mb-3">Popular Amenities</h4>
              <div className="flex flex-wrap gap-3">
                {hotel.amenities?.map(a => (
                  <span key={a} className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h3 className="text-2xl font-bold font-display text-slate-900 mb-6">Available Rooms</h3>
              <div className="space-y-6">
                {roomTypes.map((rt, idx) => {
                  // Fallback pricing logic if backend overrides aren't fully synced or exposed
                  const base = 1500 + idx * 600
                  const plans = Array.isArray(rt.ratePlans) && rt.ratePlans.length > 0
                    ? rt.ratePlans.map(rp => ({
                      name: rp.name,
                      includesBreakfast: rp.includesBreakfast,
                      cancellation: rp.cancellationRule || 'Non-refundable',
                      pricePerNight: base + (rp.includesBreakfast ? 300 : 0) // Mock price adjustment
                    }))
                    : [
                      { name: 'Standard Rate', includesBreakfast: false, cancellation: 'Non-refundable', pricePerNight: base },
                      { name: 'Flexible Rate', includesBreakfast: true, cancellation: 'Free cancellation', pricePerNight: base + 300 }
                    ]

                  return (
                    <RoomCard
                      key={rt.id}
                      roomType={rt}
                      availability={availability[rt.id]}
                      ratePlans={plans}
                      onBook={handleBook}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar (Booking Summary / Map) */}
          <div className="hidden lg:block space-y-6">
            <div className="sticky top-24">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Good to know</h3>
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="flex justify-between pb-3 border-b border-slate-100">
                    <span>Check-in</span>
                    <span className="font-medium text-slate-900">14:00</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-slate-100">
                    <span>Check-out</span>
                    <span className="font-medium text-slate-900">12:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancellation</span>
                    <span className="font-medium text-green-600">Varies by plan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
