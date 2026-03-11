// ✅ pages/search.js (Single Hotel Layout)
import { useRouter } from 'next/router'
import { useState, useEffect, useMemo } from 'react'
import Layout from '@/components/Layout'
import RoomCard from '@/components/RoomCard'
import { Users, Calendar, MapPin, Star, CheckCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import SearchBar from '@/components/SearchBar'
import SearchFilters from '@/components/SearchFilters'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function SearchPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setTheme } = useTheme();
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
            setTheme(data.theme || 'classic');
          } else {
            setHotel(null);
            setRooms([]);
          }
        } else {
          if (data && data.length > 0) {
            const myHotel = data[0];
            setHotel(myHotel);
            setRooms(myHotel.roomTypes || []);
            setTheme(myHotel.theme || 'classic');
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
      basePrice: item.ratePlan.pricePerNight ?? item.ratePlan.baseRate ?? item.roomType.basePrice ?? 0,
      totalPrice: (item.ratePlan.pricePerNight ?? item.ratePlan.baseRate ?? item.roomType.basePrice ?? 0) * diff * item.quantity
    }));

    const orderSummary = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelCity: hotel.city,
      hotelImage: hotel.images?.[0] || hotel.imageUrl || '',
      facebookUrl: hotel.facebookUrl || '',
      instagramUrl: hotel.instagramUrl || '',
      twitterUrl: hotel.twitterUrl || '',
      footerDescription: hotel.footerDescription || '',
      checkIn,
      checkOut,
      adults,
      children,
      nights: diff,
      selections,
      subtotal: selections.reduce((sum, item) => sum + item.totalPrice, 0),
      hotelTheme: hotel.theme
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
  // ✅ BUG FIX: use effectivePrice (rate plan price) with safe fallback to roomType basePrice; avoids NaN if pricePerNight is undefined
  const subtotal = Object.values(cart).reduce((sum, item) => {
    const pricePerNight = item.ratePlan.pricePerNight ?? item.ratePlan.baseRate ?? item.roomType.basePrice ?? 0;
    return sum + (pricePerNight * item.quantity * nights);
  }, 0);

  // --- CLIENT-SIDE FILTERING & SORTING ---
  const filteredAndSortedRooms = useMemo(() => {
    let result = [...rooms];

    // Filter by Price
    if (qMinPrice !== undefined && qMinPrice !== '') {
      const min = parseInt(qMinPrice);
      if (!isNaN(min) && min >= 0) {
        result = result.filter(r => r.basePrice >= min);
      }
    }
    if (qMaxPrice !== undefined && qMaxPrice !== '') {
      const max = parseInt(qMaxPrice);
      if (!isNaN(max) && max > 0) {
        result = result.filter(r => r.basePrice <= max);
      }
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
    <Layout navbarProps={{ brandName: hotel?.name, logo: hotel?.logoUrl, facebookUrl: hotel?.facebookUrl, instagramUrl: hotel?.instagramUrl, twitterUrl: hotel?.twitterUrl, footerDescription: hotel?.footerDescription }}>
      <div className="container mx-auto px-4 min-h-screen pb-20 pt-28 max-w-7xl">
        {!loading && hotel ? (
          <>
            {/* 1. Header with SearchBar */}
            <div className="mb-10 animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-theme-text mb-3">{hotel.name || "Luxury Resort"}</h1>
                  <div className="flex items-center gap-4 text-theme-muted text-sm">
                    <span className="flex items-center gap-1.5 bg-theme-card px-3 py-1.5 rounded-full text-theme-text font-semibold border border-theme-border shadow-sm">
                      <MapPin size={16} className="text-theme-accent" /> {hotel.city || "Bangkok, TH"}
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                      <Star size={16} fill="currentColor" />
                      <span className="text-theme-text">{hotel.reviews?.length > 0 ? (hotel.reviews.reduce((acc, r) => acc + r.rating, 0) / hotel.reviews.length).toFixed(1) : "New"}</span>
                      <span className="text-theme-muted font-normal">({hotel.reviews?.length || 0} reviews)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* SearchBar at the top */}
              <div className="bg-theme-card rounded-[3rem] p-2 border border-theme-border shadow-md">
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
                  <h3 className="text-2xl font-display font-bold text-theme-text mb-6 flex items-center gap-3">
                    {t('search.availableRooms')}
                    <span className="text-sm font-sans font-medium text-theme-accent bg-theme-bg px-3 py-1 rounded-full border border-theme-border">{filteredAndSortedRooms.length} {t('search.found')}</span>
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
                    <div className="bg-theme-card rounded-3xl p-16 text-center border-2 border-dashed border-theme-border">
                      <Calendar className="w-16 h-16 text-theme-muted mx-auto mb-4 opacity-50" />
                      <h4 className="text-xl font-display font-bold text-theme-text mb-2">{t('search.noRoomsTitle')}</h4>
                      <p className="text-theme-muted max-w-md mx-auto">{t('search.noRoomsDesc')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sidebar (4 cols) */}
              <div className="lg:col-span-4 relative mt-14 lg:mt-0">
                <div className="sticky top-28 space-y-6">
                  {/* Your Trip Summary */}
                  <div className="bg-theme-card text-theme-text rounded-3xl p-8 shadow-sm relative overflow-hidden group border border-theme-border">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-theme-accent/10 transition-colors pointer-events-none" />

                    <h3 className="font-display font-bold text-2xl mb-8 flex items-center gap-3 relative z-10 text-theme-text">
                      <div className="p-2.5 bg-theme-bg rounded-xl backdrop-blur-sm border border-theme-border shadow-inner">
                        <Calendar size={24} className="text-theme-accent" />
                      </div>
                      {t('search.yourTrip')}
                    </h3>

                    <div className="space-y-6 relative z-10">
                      <div className="flex items-start gap-4 p-5 bg-theme-bg rounded-2xl border border-theme-border hover:bg-theme-card-hover transition-colors">
                        <div className="flex-1">
                          <div className="text-[11px] uppercase tracking-widest text-theme-muted font-bold mb-1.5">{t('search.checkIn')}</div>
                          <div className="font-medium text-xl text-theme-text">{checkIn}</div>
                        </div>
                        <div className="w-px h-12 bg-theme-border self-center" />
                        <div className="flex-1 pl-2">
                          <div className="text-[11px] uppercase tracking-widest text-theme-muted font-bold mb-1.5">{t('search.checkOut')}</div>
                          <div className="font-medium text-xl text-theme-text">{checkOut}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 p-5 bg-theme-bg rounded-2xl border border-theme-border hover:bg-theme-card-hover transition-colors">
                        <div className="px-4 py-3 bg-theme-card border border-theme-border rounded-xl text-theme-accent flex flex-col items-center justify-center min-w-[4rem] shadow-inner">
                          <span className="font-display font-bold text-2xl leading-none">{nights}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider mt-1 text-theme-muted">{t('search.nights')}</span>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-widest text-theme-muted font-bold mb-1">{t('search.guests')}</div>
                          <div className="font-medium text-lg leading-snug text-theme-text">{adults} {t('search.adults')}<br />{children} {t('search.children')}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Good to know */}
                  <div className="bg-theme-card rounded-3xl shadow-sm border border-theme-border p-8">
                    <h3 className="font-display font-bold text-xl text-theme-text mb-6 flex items-center gap-2">
                      <CheckCircle size={22} className="text-theme-accent" />
                      {t('search.goodToKnow')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-theme-bg rounded-2xl border border-theme-border">
                        <span className="text-theme-muted font-medium">{t('search.checkIn')}</span>
                        <span className="font-bold text-theme-text text-lg">{hotel.checkInTime || '14:00'}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-theme-bg rounded-2xl border border-theme-border">
                        <span className="text-theme-muted font-medium">{t('search.checkOut')}</span>
                        <span className="font-bold text-theme-text text-lg">{hotel.checkOutTime || '12:00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-16 h-16 border-4 border-theme-border border-t-theme-accent rounded-full animate-spin"></div>
            <p className="text-theme-muted font-medium text-lg animate-pulse">{t('search.searching')}</p>
          </div>
        )}
      </div>

      {/* Floating Checkout Bar */}
      {totalRooms > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-theme-bg/85 backdrop-blur-xl border-t border-theme-border shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.15)] p-4 px-6 md:px-10"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
              <div className="bg-theme-accent/10 text-theme-accent px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-theme-accent/20 shadow-sm">
                <CheckCircle size={16} />
                {totalRooms} {totalRooms === 1 ? t('search.roomSelected') : t('search.roomsSelected')}
              </div>
              <div>
                <div className="text-sm font-bold text-theme-muted uppercase tracking-wide">{t('search.totalFor')} {nights} {t('search.nights')}</div>
                <div className="text-2xl font-black font-display text-theme-text leading-none drop-shadow-sm">฿{subtotal.toLocaleString()}</div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full md:w-auto py-3.5 px-8 bg-theme-accent hover:bg-theme-accent-hover active:scale-95 text-white font-bold text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group relative overflow-hidden whitespace-nowrap"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />
              {t('search.continueCheckout')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </Layout>
  )
}
