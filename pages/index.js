import { useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import Hero from '@/components/Hero'
import SearchBar from '@/components/SearchBar'
import FiltersSidebar from '@/components/FiltersSidebar'
import HotelCard from '@/components/HotelCard'

export default function SearchPage({ initialHotels, queryParams, amenitiesOptions }) {
  const [showMap, setShowMap] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [sortKey, setSortKey] = useState('priceAsc');

  const filtered = useMemo(() => {
    let list = [...initialHotels];
    const floor = minPrice !== '' ? Number(minPrice) : 0;
    const ceil = maxPrice !== '' ? Number(maxPrice) : Infinity;
    list = list.filter(h => (h.minPrice ?? 0) >= floor && (h.minPrice ?? 0) <= ceil);
    if (minRating > 0) list = list.filter(h => (h.avgRating ?? 0) >= minRating);
    if (amenities.length) {
      list = list.filter(h => Array.isArray(h.amenities) && amenities.every(a => h.amenities.includes(a)));
    }
    switch (sortKey) {
      case 'priceAsc': list.sort((a, b) => (a.minPrice ?? 0) - (b.minPrice ?? 0)); break;
      case 'priceDesc': list.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0)); break;
      case 'ratingDesc': list.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0)); break;
      case 'popular': list.sort((a, b) => (b.numReviews ?? 0) - (a.numReviews ?? 0)); break;
    }
    return list;
  }, [initialHotels, minPrice, maxPrice, minRating, amenities, sortKey]);

  const toggleAmenity = (am) => setAmenities(prev => prev.includes(am) ? prev.filter(x => x !== am) : [...prev, am]);

  return (
    <Layout>
      <Hero>
        <div className="glass rounded-3xl p-1 max-w-5xl mx-auto">
          <SearchBar query={queryParams} />
        </div>
      </Hero>

      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4 shrink-0">
            <FiltersSidebar
              minPrice={minPrice} setMinPrice={setMinPrice}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              minRating={minRating} setMinRating={setMinRating}
              amenities={amenities} toggleAmenity={toggleAmenity}
              amenitiesOptions={amenitiesOptions}
              sortKey={sortKey} setSortKey={setSortKey}
              showMap={showMap} setShowMap={setShowMap}
            />
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-display font-bold text-slate-900">
                {filtered.length} {filtered.length === 1 ? 'Property' : 'Properties'} found
              </h2>
              <div className="text-sm text-slate-500">
                Showing results for your search
              </div>
            </div>

            {showMap ? (
              <div className="bg-slate-100 rounded-3xl h-[600px] flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 font-medium">
                Map View (Coming Soon)
              </div>
            ) : (
              <div className="space-y-6">
                {filtered.length ? (
                  filtered.map(h => <HotelCard key={h.id} hotel={h} queryParams={queryParams} />)
                ) : (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <p className="text-lg font-medium text-slate-900">No hotels found matching your criteria</p>
                    <p className="text-slate-500 mt-2">Try adjusting your filters or search terms</p>
                    <button onClick={() => {
                      setMinPrice('')
                      setMaxPrice('')
                      setMinRating(0)
                      setAmenities([])
                    }} className="mt-4 text-primary-600 font-medium hover:underline">
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ query }) {
  const { destination, checkIn, checkOut, guests } = query;
  let hotels = [];
  try {
    const backend = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';
    const res = await fetch(backend + '/hotels');
    hotels = await res.json();
    if (!Array.isArray(hotels)) {
      console.error('API returned non-array:', hotels);
      hotels = [];
    }
  } catch (err) {
    console.error('Failed to fetch hotels:', err);
    hotels = [];
  }
  if (destination) {
    const d = String(destination).toLowerCase();
    hotels = hotels.filter(h => (h.city && h.city.toLowerCase().includes(d)) || (h.name && h.name.toLowerCase().includes(d)));
  }
  let nights = 1;
  if (checkIn && checkOut) {
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    if (diff >= 1) nights = diff;
  }
  hotels = hotels.map((h, idx) => {
    let avg = 0, num = 0;
    if (Array.isArray(h.reviews) && h.reviews.length) { num = h.reviews.length; avg = h.reviews.reduce((s, r) => s + (r.rating || 0), 0) / num; }
    let minPrice = 0;
    if (Array.isArray(h.roomTypes) && h.roomTypes.length) { const base = h.roomTypes.map((rt, i) => 1200 + i * 600); minPrice = Math.min(...base) * nights; }
    else { minPrice = (1200 + (idx % 5) * 400) * nights; }
    return { ...h, avgRating: avg, numReviews: num, minPrice };
  });
  const amenitySet = new Set();
  hotels.forEach(h => Array.isArray(h.amenities) && h.amenities.forEach(a => amenitySet.add(a)));
  return { props: { initialHotels: hotels, amenitiesOptions: Array.from(amenitySet), queryParams: { destination: destination || '', checkIn: checkIn || '', checkOut: checkOut || '', guests: guests || 1 } } }
}
