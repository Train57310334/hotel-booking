// ✅ pages/search.js (Single Hotel Layout)
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import RoomCard from '@/components/RoomCard'
import { Users, Calendar, MapPin, Star, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import SearchBar from '@/components/SearchBar'

export default function SearchPage() {
  const router = useRouter();
  const { checkIn: qCheckIn, checkOut: qCheckOut, guests: qGuests } = router.query;

  // Default to Today/Tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const checkIn = qCheckIn || formatDate(today);
  const checkOut = qCheckOut || formatDate(tomorrow);
  const guests = qGuests || '1';

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const backend = process.env.NEXT_PUBLIC_BACKEND_API_BASE || 'http://localhost:3001';

        // Build query params
        const params = new URLSearchParams();
        params.append('checkIn', checkIn);
        params.append('checkOut', checkOut);
        params.append('guests', guests);

        // Fetch hotels with availability logic
        const res = await fetch(`${backend}/api/hotels?${params.toString()}`);
        const hotels = await res.json();

        if (hotels && hotels.length > 0) {
          const myHotel = hotels[0]; // Single hotel use case
          setHotel(myHotel);
          setRooms(myHotel.roomTypes || []);
        } else {
          setHotel(null);
          setRooms([]);
        }
      } catch (e) {
        console.error(e);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    if (router.isReady) load();
  }, [router.isReady, checkIn, checkOut, guests]);

  // Mock Images if none (for design dev)
  const galleryImages = hotel?.images?.length ? hotel.images : [
    '/uploads/1768932767157-205900455.png', // Fallback or use Room images
    '/uploads/1768932767157-205900455.png',
    '/uploads/1768932767157-205900455.png'
  ];
  // If hotel has no top level images, try to aggregate from rooms
  if (hotel && (!hotel.images || hotel.images.length === 0) && rooms.length > 0) {
    const roomImages = rooms.flatMap(r => r.images || []).slice(0, 3);
    if (roomImages.length > 0) galleryImages.splice(0, roomImages.length, ...roomImages);
  }

  const handleBook = (rt, planName, price) => {
    // Find rate plan logic
    const plan = rt.ratePlans.find(p => p.name === planName);

    // Calculate nights
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.max(Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)), 1);

    const selection = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.images?.[0] || rt.images?.[0],
      hotelCity: hotel.city,
      roomTypeId: rt.id,
      roomTypeName: rt.name,
      ratePlanId: plan?.id,
      ratePlanName: planName,
      checkIn,
      checkOut,
      guests,
      basePrice: price,
      totalPrice: price * diff
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('bookingSelection', JSON.stringify(selection));
    }
    router.push('/booking/guest-info');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 min-h-screen pb-20 pt-8">
        {!loading && hotel ? (
          <>
            {/* 1. Header with Gallery */}
            <div className="mb-8">
              <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">{hotel.name || "Luxury Resort"}</h1>
              <div className="flex items-center gap-4 text-slate-500 text-sm mb-6">
                <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                  <MapPin size={14} /> {hotel.city || "Bangkok, TH"}
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star size={14} fill="currentColor" /> {hotel.reviews?.length > 0 ? (hotel.reviews.reduce((acc, r) => acc + r.rating, 0) / hotel.reviews.length).toFixed(1) : "New"} ({hotel.reviews?.length || 0} reviews)
                </span>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] rounded-3xl overflow-hidden">
                <div className="md:col-span-2 relative h-full">
                  <img src={galleryImages[0]} alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="md:col-span-2 grid grid-rows-2 gap-4 h-full">
                  <div className="relative h-full overflow-hidden">
                    <img src={galleryImages[1] || galleryImages[0]} alt="Side 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="relative h-full overflow-hidden">
                    <img src={galleryImages[2] || galleryImages[0]} alt="Side 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-10">

                {/* About */}
                <section>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">About this stay</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {hotel.description || "Experience the ultimate relaxation with our exclusive rooms and premium amenities. Located in the heart of the city, offering breathtaking views and world-class service."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {['Free Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Spa', 'Bar/Lounge'].map(am => (
                      <span key={am} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-sm font-medium flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500" /> {am}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Reviews Preview */}
                <section className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Guest Reviews</h3>
                  <div className="space-y-6">
                    {hotel.reviews?.length > 0 ? (
                      hotel.reviews.map(review => (
                        <div key={review.id} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-slate-900">{review.user?.name || "Guest"}</div>
                            <div className="text-amber-500 text-xs flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={i < review.rating ? "fill-amber-500 text-amber-500" : "text-slate-300"} />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 italic">"{review.comment}"</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No reviews yet. Be the first to stay!</p>
                    )}
                  </div>
                </section>

                {/* Available Rooms Title */}
                <div id="rooms-section" className="pt-4">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Available Rooms</h3>
                  {rooms.length > 0 ? (
                    <div className="flex flex-col gap-8">
                      {rooms.map((room, index) => (
                        <motion.div
                          key={room.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <RoomCard
                            roomType={room}
                            ratePlans={room.ratePlans}
                            onBook={(rt, planName, price) => handleBook(rt, planName, price)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-500">
                      No rooms available for these dates.
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Good to know */}
                  <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Good to know</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Check-in</span>
                        <span className="font-medium text-slate-900">14:00 onwards</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500">Check-out</span>
                        <span className="font-medium text-slate-900">12:00</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-500">Cancellation</span>
                        <span className="font-medium text-emerald-600">Free up to 24h</span>
                      </div>
                    </div>
                    <button
                      onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                    >
                      Select Room
                    </button>
                  </div>

                  {/* Mini Search Summary */}
                  <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Calendar size={18} /> Your Trip</h3>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div>
                        <div className="text-xs uppercase tracking-wider opacity-60">Dates</div>
                        <div className="text-white font-medium text-lg">{checkIn} - {checkOut}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider opacity-60">Guests</div>
                        <div className="text-white font-medium">{guests} Adults</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-40">
            <div className="animate-spin w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Loading hotel details...</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
