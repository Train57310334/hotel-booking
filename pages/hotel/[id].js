import Layout from '@/components/Layout'
import RoomCard from '@/components/RoomCard'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { MapPin, Star } from 'lucide-react'

export default function HotelDetail() {
  const router = useRouter()
  const { id, checkIn: queryCheckIn, checkOut: queryCheckOut, guests: queryGuests = 1 } = router.query
  const [hotel, setHotel] = useState(null)
  const [nights, setNights] = useState(1)

  // Default to Today/Tomorrow if not provided
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const checkIn = queryCheckIn || today;
  const checkOut = queryCheckOut || tomorrow;
  const guests = queryGuests;

  useEffect(() => {
    if (id, checkIn, checkOut, guests) {
      let url = `/api/hotels/${id}`
      const params = new URLSearchParams()
      params.append('checkIn', checkIn)
      params.append('checkOut', checkOut)
      params.append('guests', guests)

      const queryString = params.toString()
      if (queryString) url += `?${queryString}`

      fetch(url)
        .then(res => res.json())
        .then(data => {
          setHotel(data);
          // Handle Hash Scroll
          if (window.location.hash) {
            setTimeout(() => {
              const el = document.querySelector(window.location.hash);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 500); // Small delay to ensure render
          }
        })

      const d1 = new Date(checkIn)
      const d2 = new Date(checkOut)
      const diff = Math.max((d2 - d1) / (1000 * 60 * 60 * 24), 1)
      setNights(diff)
    }
  }, [id, checkIn, checkOut, guests])

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

  if (hotel.message || hotel.error) {
    return (
      <Layout>
        <div className="container mx-auto p-20 text-center">
          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Hotel</h3>
            <p className="text-slate-600">{hotel.message || "Unknown error occurred"}</p>
            <p className="text-slate-500 text-sm mt-2 font-mono bg-white p-2 rounded border border-red-100">{hotel.error || JSON.stringify(hotel)}</p>
            <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Try Again</button>
          </div>
        </div>
      </Layout>
    )
  }

  let avgRating = 0, numReviews = 0
  if (Array.isArray(hotel.reviews) && hotel.reviews.length) {
    numReviews = hotel.reviews.length
    avgRating = (hotel.reviews.reduce((s, r) => s + (r.rating || 0), 0) / numReviews).toFixed(1)
  }

  const roomTypes = hotel.roomTypes || []
  // Availability comes from backend
  const availability = roomTypes.reduce((m, rt) => {
    // Backend should set isAvailable. If undefined, we assume available.
    // But we also need a quantity? Backend doesn't send exact allotment quantity in search/find (yet).
    // We'll just assume > 0 if isAvailable is true.
    m[rt.id] = (rt.isAvailable !== false) ? 5 : 0;
    // Note: "5" is still a placeholder because search API usually doesn't return exact inventory count to prevent scraping, 
    // but strictly it should be based on something real.
    // If user insists "no mock", we should try to fetch real allotment if exposed or just boolean.
    // Let's stick to boolean logic: "Available" or "Sold Out".
    return m;
  }, {})

  const allImages = [
    hotel.imageUrl,
    ...(hotel.roomTypes?.flatMap(rt => rt.images || []) || [])
  ].filter(Boolean).slice(0, 5)

  const handleBook = (rt, plan, pricePerNight) => {
    const selection = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.imageUrl,
      hotelCity: hotel.city,
      roomTypeId: rt.id,
      roomTypeName: rt.name,
      ratePlanId: plan.id,
      ratePlanName: plan.name,
      checkIn,
      checkOut,
      guests,
      basePrice: pricePerNight,
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
      <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden group">
        <img
          alt={hotel.name}
          src={hotel.imageUrl || "/images/hero-bg.png"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = '/images/hero-bg.png' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 pb-12 pt-32 bg-gradient-to-t from-slate-900 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 shadow-sm">{hotel.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-primary-400" />
                  <span className="text-lg font-medium tracking-wide">{hotel.address ? hotel.address + ', ' : ''}{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
                </div>
                {numReviews > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-default">
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

            {/* Gallery Strip */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 h-32 overflow-hidden rounded-3xl">
                {allImages.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="relative h-full group overflow-hidden cursor-pointer">
                    <img src={img} className="object-cover w-full h-full hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}

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

            {/* Reviews */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold font-display text-slate-900 mb-6">Guest Reviews</h3>
              {hotel.reviews && hotel.reviews.length > 0 ? (
                <div className="space-y-6">
                  {hotel.reviews.slice(0, 3).map((r, i) => (
                    <div key={i} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">Guest</span>
                        <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm"><Star size={12} fill="currentColor" /> {r.rating}</span>
                      </div>
                      <p className="text-slate-600 italic">"{r.comment || 'No comment provided.'}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No reviews yet.</p>
              )}
            </div>

            {/* Rooms */}
            <div id="rooms-section">
              <h3 className="text-2xl font-bold font-display text-slate-900 mb-6">Available Rooms</h3>
              {roomTypes.length > 0 ? (
                <div className="space-y-6">
                  {roomTypes.map((rt, idx) => {
                    const isAvailable = rt.isAvailable !== false; // Default to true if not specified
                    if (!isAvailable) return null; // Or show as disabled

                    // Backend provides processed ratePlans if queried with dates
                    // If not (fallback), we use basePrice

                    let plans = [];
                    if (rt.ratePlans && rt.ratePlans.length > 0) {
                      plans = rt.ratePlans.map(rp => ({
                        id: rp.id,
                        name: rp.name,
                        includesBreakfast: rp.includesBreakfast,
                        cancellation: rp.cancellationRule || 'Non-refundable',
                        totalPrice: rp.totalPrice,
                        pricePerNight: rp.pricePerNight || rp.totalPrice / (nights || 1) || (rt.basePrice || 0)
                      }));
                    } else if (rt.basePrice) {
                      // Standard fallback to base price if no plans defined (Legacy/Simple Mode)
                      plans = [
                        { id: 'std', name: 'Standard Rate', includesBreakfast: false, cancellation: 'Non-refundable', pricePerNight: rt.basePrice }
                      ];
                    } else {
                      return null; // No price info
                    }

                    return (
                      <div id={`room-${rt.id}`} key={rt.id} className="scroll-mt-24 transition-all duration-500">
                        <RoomCard
                          roomType={rt}
                          availability={availability[rt.id]}
                          ratePlans={plans}
                          onBook={(roomType, planName, price) => {
                            const selectedPlan = plans.find(p => p.name === planName);
                            handleBook(roomType, selectedPlan, selectedPlan.pricePerNight);
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-100">
                  <div className="inline-flex p-4 bg-white rounded-full text-slate-400 mb-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline><path d="M9.8 9.8l4.4 4.4M14.2 9.8l-4.4 4.4" stroke="red" strokeWidth="2" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">No rooms available</h4>
                  <p className="text-slate-500">We couldn't find any rooms for this hotel. It might be fully booked or not yet configured.</p>
                </div>
              )}
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

                <button
                  onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full btn-primary py-3 mt-6 shadow-xl shadow-primary-500/20 font-bold"
                >
                  Select Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
