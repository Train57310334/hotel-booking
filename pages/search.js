// ✅ pages/search.js (Single Hotel Layout)
import { useRouter } from 'next/router'
import { useState, useEffect, useMemo, useCallback } from 'react'
import Layout from '@/components/Layout'
import RoomCard from '@/components/RoomCard'
import { Users, Calendar, MapPin, Star, CheckCircle, ArrowRight, LayoutList, CalendarDays, ChevronLeft, ChevronRight, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [hideFullRooms, setHideFullRooms] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // hideFullRooms is local state only (no URL param needed)
    if (typeof filters.hideFullRooms === 'boolean') setHideFullRooms(filters.hideFullRooms);

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

    // Filter: Hide sold-out rooms for staff
    if (hideFullRooms) {
      result = result.filter(r => r.isAvailable !== false);
    }

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

    // Sort: Put available rooms first, then sold-out
    result.sort((a, b) => {
      const aAvail = a.isAvailable !== false ? 0 : 1;
      const bAvail = b.isAvailable !== false ? 0 : 1;
      if (aAvail !== bAvail) return aAvail - bAvail;
      // Secondary sort
      if (qSort === 'price_asc') return (a.basePrice || 0) - (b.basePrice || 0);
      if (qSort === 'price_desc') return (b.basePrice || 0) - (a.basePrice || 0);
      return 0;
    });

    return result;
  }, [rooms, hideFullRooms, qMinPrice, qMaxPrice, qAmenities, qSort]);
  // ---------------------------------------

  // --- CALENDAR HELPERS ---
  const availableCount = useMemo(() => rooms.filter(r => r.isAvailable !== false).length, [rooms]);
  const soldOutCount = useMemo(() => rooms.filter(r => r.isAvailable === false).length, [rooms]);

  return (
    <Layout 
      navbarProps={{ brandName: hotel?.name, logo: hotel?.logoUrl, facebookUrl: hotel?.facebookUrl, instagramUrl: hotel?.instagramUrl, twitterUrl: hotel?.twitterUrl, footerDescription: hotel?.footerDescription }}
      seoProps={{
        title: hotel?.hasSeo && hotel?.seoTitle ? hotel.seoTitle : hotel?.name ? `Book ${hotel.name} | BookingKub` : 'Find Hotels | BookingKub',
        description: hotel?.hasSeo && hotel?.seoDescription ? hotel.seoDescription : hotel?.description || hotel?.footerDescription,
        keywords: hotel?.hasSeo ? hotel.seoKeywords : '',
        image: hotel?.ogImage || hotel?.images?.[0] || hotel?.imageUrl,
        canonicalUrl: hotel?.canonicalUrl || hotel?.customDomain,
        robotsIndex: hotel?.robotsIndex
      }}
    >
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
                        sort: qSort || 'recommended',
                        hideFullRooms
                      }}
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                </div>

                {/* Rooms Section: view toggle + calendar/list */}
                <div id="rooms-section" className="flex-1">
                  {/* Header: title + badges + view toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="text-2xl font-display font-bold text-theme-text flex flex-wrap items-center gap-2">
                      {t('search.availableRooms')}
                      <span className="text-sm font-sans font-medium text-theme-accent bg-theme-bg px-3 py-1 rounded-full border border-theme-border">
                        {filteredAndSortedRooms.length} {t('search.found')}
                      </span>
                      {hideFullRooms && soldOutCount > 0 && (
                        <span className="text-xs font-sans font-medium text-theme-muted bg-theme-bg px-2.5 py-1 rounded-full border border-theme-border flex items-center gap-1">
                          <EyeOff size={11} /> {soldOutCount} ซ่อน
                        </span>
                      )}
                    </h3>
                    {/* List / Calendar toggle */}
                    <div className="flex items-center gap-1 bg-theme-bg p-1 rounded-xl border border-theme-border flex-shrink-0 self-start sm:self-auto">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          viewMode === 'list'
                            ? 'bg-theme-card shadow text-theme-accent border border-theme-border'
                            : 'text-theme-muted hover:text-theme-text'
                        }`}
                      >
                        <LayoutList size={15} /> List
                      </button>
                      <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          viewMode === 'calendar'
                            ? 'bg-theme-card shadow text-theme-accent border border-theme-border'
                            : 'text-theme-muted hover:text-theme-text'
                        }`}
                      >
                        <CalendarDays size={15} /> Calendar
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {viewMode === 'calendar' ? (
                      <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                        <AvailabilityCalendar
                          checkIn={checkIn}
                          checkOut={checkOut}
                          rooms={rooms}
                          router={router}
                          query={router.query}
                        />
                      </motion.div>
                    ) : filteredAndSortedRooms.length > 0 ? (
                      <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex flex-col gap-8">
                        {filteredAndSortedRooms.map((room, index) => (
                          <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
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
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-theme-card rounded-3xl p-16 text-center border-2 border-dashed border-theme-border">
                        {hideFullRooms && soldOutCount > 0 ? (
                          <>
                            <EyeOff className="w-16 h-16 text-theme-muted mx-auto mb-4 opacity-40" />
                            <h4 className="text-xl font-display font-bold text-theme-text mb-2">ทุกห้องเต็มแล้ว</h4>
                            <p className="text-theme-muted max-w-md mx-auto mb-6">ลอง<strong>ปิด</strong> "Available Rooms Only" เพื่อดูห้องทั้งหมด หรือเปลี่ยนวันที่</p>
                            <button onClick={() => setHideFullRooms(false)} className="px-5 py-2.5 bg-theme-accent text-white rounded-xl font-bold text-sm hover:opacity-90 transition">
                              แสดงห้องทั้งหมด
                            </button>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-16 h-16 text-theme-muted mx-auto mb-4 opacity-50" />
                            <h4 className="text-xl font-display font-bold text-theme-text mb-2">{t('search.noRoomsTitle')}</h4>
                            <p className="text-theme-muted max-w-md mx-auto">{t('search.noRoomsDesc')}</p>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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

// ─── Availability Calendar ────────────────────────────────────────────────────
// A month-grid calendar for staff to quickly navigate and pick check-in dates.
// Clicking a day updates checkIn/checkOut in the URL. No extra API calls needed.

function AvailabilityCalendar({ checkIn, checkOut, rooms, router, query }) {
  const today = new Date();
  const selectedIn = new Date(checkIn);
  const selectedOut = new Date(checkOut);

  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(checkIn);
    d.setDate(1);
    return d;
  });

  // Compute: which days in the current month are "selected" (in the check-in/out range)
  const isInRange = (d) => {
    const day = new Date(d);
    day.setHours(12, 0, 0, 0);
    const inD = new Date(selectedIn); inD.setHours(12, 0, 0, 0);
    const outD = new Date(selectedOut); outD.setHours(12, 0, 0, 0);
    return day >= inD && day < outD;
  };

  const isCheckIn = (d) => new Date(d).toDateString() === selectedIn.toDateString();
  const isCheckOut = (d) => new Date(d).toDateString() === selectedOut.toDateString();
  const isPast = (d) => new Date(d) < new Date(today.toDateString());

  // All rooms sold out = no availability (we simple-check isAvailable flag from current search)
  const allSoldOut = rooms.length > 0 && rooms.every(r => r.isAvailable === false);

  const prevMonth = () => { const d = new Date(calMonth); d.setMonth(d.getMonth() - 1); setCalMonth(d); };
  const nextMonth = () => { const d = new Date(calMonth); d.setMonth(d.getMonth() + 1); setCalMonth(d); };

  const handleDayClick = (d) => {
    if (isPast(d)) return;
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    const dateStr = local.toISOString().split('T')[0];
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextLocal = new Date(nextDay.getTime() - nextDay.getTimezoneOffset() * 60000);
    const nextStr = nextLocal.toISOString().split('T')[0];
    router.push({ pathname: '/search', query: { ...query, checkIn: dateStr, checkOut: nextStr } }, undefined, { shallow: false });
  };

  // Build calendar days array for current month view
  const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
  const lastDay = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0);
  const startPad = firstDay.getDay(); // weekday of 1st (0=Sun)
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null); // empty cells
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(calMonth.getFullYear(), calMonth.getMonth(), d));
  }

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-theme-card rounded-3xl border border-theme-border shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-theme-bg border border-transparent hover:border-theme-border transition-all text-theme-muted hover:text-theme-text"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-display font-bold text-lg text-theme-text">
            {calMonth.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
          </div>
          <div className="text-xs text-theme-muted mt-0.5">คลิกวันที่เพื่อเปลี่ยนวัน Check-in</div>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-theme-bg border border-transparent hover:border-theme-border transition-all text-theme-muted hover:text-theme-text"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 py-3 bg-theme-bg border-b border-theme-border text-xs font-medium text-theme-muted flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-theme-accent" /> Selected range</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-theme-accent/50" /> Check-in</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-theme-border" /> Past / Unavailable</div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-4 pt-4 pb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-theme-muted uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 px-4 pb-4">
        {days.map((d, i) => {
          if (!d) return <div key={`pad-${i}`} />;
          const past = isPast(d);
          const inR = isInRange(d);
          const cIn = isCheckIn(d);
          const cOut = isCheckOut(d);
          const isToday = d.toDateString() === today.toDateString();

          let cellClass = 'relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-medium transition-all duration-150 ';
          if (past) {
            cellClass += 'text-theme-muted/40 cursor-not-allowed bg-theme-bg/50 ';
          } else if (cIn) {
            cellClass += 'bg-theme-accent text-white font-bold cursor-pointer shadow-md scale-105 ';
          } else if (cOut) {
            cellClass += 'bg-theme-accent/60 text-white font-bold cursor-pointer ';
          } else if (inR) {
            cellClass += 'bg-theme-accent/15 text-theme-accent font-semibold cursor-pointer hover:bg-theme-accent/25 ';
          } else {
            cellClass += 'text-theme-text cursor-pointer hover:bg-theme-bg hover:border hover:border-theme-accent/40 ';
          }

          return (
            <div
              key={d.toISOString()}
              onClick={() => handleDayClick(d)}
              className={cellClass}
              title={past ? 'วันที่ผ่านไปแล้ว' : `เลือก Check-in: ${d.toLocaleDateString('th-TH')}`}
            >
              <span>{d.getDate()}</span>
              {isToday && !cIn && !cOut && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-theme-accent" />
              )}
            </div>
          );
        })}
      </div>

      {/* Currently selected range info */}
      <div className="px-6 py-4 border-t border-theme-border bg-theme-bg flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-theme-muted">
          <CalendarDays size={16} className="text-theme-accent" />
          <span>
            <strong className="text-theme-text">{checkIn}</strong>
            {' → '}
            <strong className="text-theme-text">{checkOut}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {allSoldOut ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
              ● ห้องเต็มในวันที่เลือก
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-theme-accent bg-theme-accent/10 px-3 py-1.5 rounded-full border border-theme-accent/20">
              ● มีห้องว่าง {rooms.filter(r => r.isAvailable !== false).length} ประเภท
            </span>
          )}
          <button
            onClick={() => router.push({ pathname: '/search', query })}
            className="text-xs font-bold text-theme-accent hover:underline"
          >
            ดูรายการห้อง →
          </button>
        </div>
      </div>
    </div>
  );
}
