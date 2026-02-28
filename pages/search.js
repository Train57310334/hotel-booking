// ✅ pages/search.js (Single Hotel Layout)
import { useRouter } from 'next/router'
import { useState, useEffect, useMemo } from 'react'
import Layout from '@/components/Layout'
import RoomCard from '@/components/RoomCard'
import { Users, Calendar, MapPin, Star, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import SearchBar from '@/components/SearchBar'
import SearchFilters from '@/components/SearchFilters'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SearchPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { hotelId: qHotelId, checkIn: qCheckIn, checkOut: qCheckOut, adults: qAdults, children: qChildren, minPrice: qMinPrice, maxPrice: qMaxPrice, amenities: qAmenities, sort: qSort } = router.query;

  // Default to Today/Tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (d) => {
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - (offset * 60 * 1000))
    return local.toISOString().split('T')[0]
  };

  const checkIn = qCheckIn || formatDate(today);
  const checkOut = qCheckOut || formatDate(tomorrow);
  const adults = parseInt(qAdults) || 2;
  const children = parseInt(qChildren) || 0;

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
        params.append('adults', adults);
        params.append('children', children);
        params.append('guests', adults + children);

        // We no longer send minPrice, maxPrice, or amenities to backend. We do it client-side.

        let url = `${backend}/api/hotels?${params.toString()}`;
        if (qHotelId) {
          url = `${backend}/api/hotels/${qHotelId}?${params.toString()}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (qHotelId) {
          if (data && data.id) {
            setHotel(data);
            setRooms(data.roomTypes || []);
          } else {
            setHotel(null);
            setRooms([]);
          }
        } else {
          if (data && data.length > 0) {
            const myHotel = data[0];
            setHotel(myHotel);
            setRooms(myHotel.roomTypes || []);
          } else {
            setHotel(null);
            setRooms([]);
          }
        }
      } catch (e) {
        console.error(e);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    if (router.isReady) load();
  }, [router.isReady, qHotelId, checkIn, checkOut, adults, children]);

  const [cart, setCart] = useState({}); // { [ratePlanId]: { quantity, roomType, ratePlan } }

  const handleSelect = (rt, plan, change) => {
    setCart(prev => {
      const newCart = { ...prev };
      const currentOpt = newCart[plan.id];
      const newQty = (currentOpt?.quantity || 0) + change;

      if (newQty <= 0) {
        delete newCart[plan.id];
      } else {
        newCart[plan.id] = {
          quantity: newQty,
          roomType: rt,
          ratePlan: plan
        };
      }
      return newCart;
    });
  };

  const handleFilterChange = (filters) => {
    // Merge new filters with existing query
    const newQuery = { ...router.query };

    if (filters.minPrice !== null) newQuery.minPrice = filters.minPrice;
    else delete newQuery.minPrice;

    if (filters.maxPrice !== null) newQuery.maxPrice = filters.maxPrice;
    else delete newQuery.maxPrice;

    if (filters.amenities?.length > 0) newQuery.amenities = filters.amenities.join(',');
    else delete newQuery.amenities;

    if (filters.sort && filters.sort !== 'recommended') newQuery.sort = filters.sort;
    else delete newQuery.sort;

    router.push({
      pathname: '/search',
      query: newQuery
    }, undefined, { shallow: true });
  };

  const handleCheckout = () => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.max(Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)), 1);

    const selections = Object.values(cart).map(item => ({
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomTypeId: item.roomType.id,
      roomTypeName: item.roomType.name,
      ratePlanId: item.ratePlan.id,
      ratePlanName: item.ratePlan.name,
      quantity: item.quantity,
      basePrice: item.ratePlan.pricePerNight,
      totalPrice: item.ratePlan.pricePerNight * diff * item.quantity
    }));

    const orderSummary = {
      hotelId: hotel.id,
      checkIn,
      checkOut,
      adults,
      children,
      nights: diff,
      selections,
      subtotal: selections.reduce((sum, item) => sum + item.totalPrice, 0)
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('bookingCart', JSON.stringify(orderSummary));
    }
    router.push('/booking/checkout');
  };

  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nights = Math.max(Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)), 1);

  // Calculate Cart Totals
  const totalRooms = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Object.values(cart).reduce((sum, item) => sum + (item.ratePlan.pricePerNight * item.quantity * nights), 0);

  // --- CLIENT-SIDE FILTERING & SORTING ---
  const filteredAndSortedRooms = useMemo(() => {
    let result = [...rooms];

    // Filter by Price
    if (qMinPrice) {
      const min = parseInt(qMinPrice);
      result = result.filter(r => r.basePrice >= min);
    }
    if (qMaxPrice) {
      const max = parseInt(qMaxPrice);
      result = result.filter(r => r.basePrice <= max);
    }

    // Filter by Amenities
    if (qAmenities) {
      const requiredAmenities = Array.isArray(qAmenities) ? qAmenities : qAmenities.split(',');
      result = result.filter(r => {
        if (!r.amenities || r.amenities.length === 0) return false;
        // Check if room has EVERY required amenity
        return requiredAmenities.every(reqAmn => r.amenities.includes(reqAmn));
      });
    }

    // Sort
    if (qSort === 'price_asc') {
      result.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (qSort === 'price_desc') {
      result.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    }

    return result;
  }, [rooms, qMinPrice, qMaxPrice, qAmenities, qSort]);
  // ---------------------------------------

  return (
    <Layout>
      <div className="container mx-auto px-4 min-h-screen pb-20 pt-8 max-w-7xl">
        {!loading && hotel ? (
          <>
            {/* 1. Header with SearchBar */}
            <div className="mb-10 animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-3">{hotel.name || "Luxury Resort"}</h1>
                  <div className="flex items-center gap-4 text-slate-500 text-sm">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-slate-700 font-semibold border border-slate-200">
                      <MapPin size={16} className="text-emerald-500" /> {hotel.city || "Bangkok, TH"}
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                      <Star size={16} fill="currentColor" />
                      <span className="text-slate-700">{hotel.reviews?.length > 0 ? (hotel.reviews.reduce((acc, r) => acc + r.rating, 0) / hotel.reviews.length).toFixed(1) : "New"}</span>
                      <span className="text-slate-400 font-normal">({hotel.reviews?.length || 0} reviews)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* SearchBar at the top */}
              <div className="bg-slate-50 rounded-[3rem] p-2 border border-slate-200 shadow-md">
                <SearchBar query={router.query} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Rooms List (8 cols) */}
              <div className="lg:col-span-8 flex flex-col md:flex-row gap-8">
                {/* Search Filters Column */}
                <div className="w-full md:w-80 flex-shrink-0">
                  <div className="sticky top-28">
                    <SearchFilters
                      initialFilters={{
                        minPrice: qMinPrice || '',
                        maxPrice: qMaxPrice || '',
                        amenities: qAmenities ? (Array.isArray(qAmenities) ? qAmenities : qAmenities.split(',')) : [],
                        sort: qSort || 'recommended'
                      }}
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                </div>

                {/* Rooms List */}
                <div id="rooms-section" className="flex-1 space-y-8">
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-6 flex items-center gap-3">
                    {t('search.availableRooms')}
                    <span className="text-sm font-sans font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{filteredAndSortedRooms.length} {t('search.found')}</span>
                  </h3>

                  {filteredAndSortedRooms.length > 0 ? (
                    <div className="flex flex-col gap-8">
                      {filteredAndSortedRooms.map((room, index) => (
                        <motion.div
                          key={room.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <RoomCard
                            roomType={room}
                            ratePlans={room.ratePlans}
                            onSelect={handleSelect}
                            selectedCounts={Object.values(cart).reduce((acc, item) => {
                              acc[item.ratePlan.id] = item.quantity;
                              return acc;
                            }, {})}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-3xl p-16 text-center border-2 border-dashed border-slate-300">
                      <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h4 className="text-xl font-display font-bold text-slate-900 mb-2">{t('search.noRoomsTitle')}</h4>
                      <p className="text-slate-500 max-w-md mx-auto">{t('search.noRoomsDesc')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sidebar (4 cols) */}
              <div className="lg:col-span-4 relative mt-14 lg:mt-0">
                <div className="sticky top-28 space-y-6">
                  {/* Your Trip Summary */}
                  <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-colors" />

                    <h3 className="font-display font-bold text-2xl mb-8 flex items-center gap-3 relative z-10">
                      <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5">
                        <Calendar size={24} className="text-emerald-400" />
                      </div>
                      {t('search.yourTrip')}
                    </h3>

                    <div className="space-y-6 relative z-10">
                      <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex-1">
                          <div className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold mb-1.5">{t('search.checkIn')}</div>
                          <div className="font-medium text-xl">{checkIn}</div>
                        </div>
                        <div className="w-px h-12 bg-white/10 self-center" />
                        <div className="flex-1 pl-2">
                          <div className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold mb-1.5">{t('search.checkOut')}</div>
                          <div className="font-medium text-xl">{checkOut}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/10">
                        <div className="px-4 py-3 bg-emerald-500/20 rounded-xl text-emerald-400 flex flex-col items-center justify-center min-w-[4rem]">
                          <span className="font-display font-bold text-2xl leading-none">{nights}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider mt-1">{t('search.nights')}</span>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">{t('search.guests')}</div>
                          <div className="font-medium text-lg leading-snug">{adults} {t('search.adults')}<br />{children} {t('search.children')}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Good to know */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                    <h3 className="font-display font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                      <CheckCircle size={22} className="text-emerald-500" />
                      {t('search.goodToKnow')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-slate-600 font-medium">{t('search.checkIn')}</span>
                        <span className="font-bold text-slate-900 text-lg">14:00</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-slate-600 font-medium">{t('search.checkOut')}</span>
                        <span className="font-bold text-slate-900 text-lg">12:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium text-lg animate-pulse">{t('search.searching')}</p>
          </div>
        )}
      </div>

      {/* Floating Checkout Bar */}
      {totalRooms > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 px-6 md:px-10"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
              <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-emerald-100">
                <CheckCircle size={16} />
                {totalRooms} {totalRooms === 1 ? t('search.roomSelected') : t('search.roomsSelected')}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{t('search.totalFor')} {nights} {t('search.nights')}</div>
                <div className="text-2xl font-black font-display text-slate-900 leading-none">฿{subtotal.toLocaleString()}</div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full sm:w-auto px-10 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/30 whitespace-nowrap"
            >
              {t('search.continueCheckout')}
            </button>
          </div>
        </motion.div>
      )}
    </Layout>
  )
}
