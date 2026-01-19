// ✅ pages/hotel/[id].js (ปรับปรุงจากโค้ดเดิม)
import Layout from '@/components/Layout';
import RoomCard from '@/components/RoomCard';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function HotelDetail() {
  const router = useRouter();
  const { id, checkIn, checkOut, guests = 1 } = router.query;
  const [hotel, setHotel] = useState(null);
  const [nights, setNights] = useState(1);

  useEffect(() => {
    if (id) {
      fetch(`/api/hotels/${id}`)
        .then(res => res.json())
        .then(data => setHotel(data));

      if (checkIn && checkOut) {
        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        const diff = Math.max((d2 - d1) / (1000 * 60 * 60 * 24), 1);
        setNights(diff);
      }
    }
  }, [id, checkIn, checkOut]);

  if (!hotel) return <Layout><div className="container mx-auto p-4">Hotel not found.</div></Layout>;

  let avgRating = 0, numReviews = 0;
  if (Array.isArray(hotel.reviews) && hotel.reviews.length) {
    numReviews = hotel.reviews.length;
    avgRating = (hotel.reviews.reduce((s, r) => s + (r.rating || 0), 0) / numReviews).toFixed(1);
  }

  const roomTypes = hotel.roomTypes || [];
  const availability = roomTypes.reduce((m, rt, i) => (m[rt.id] = Math.max(1, 5 - i), m), {});

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
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookingSelection', JSON.stringify(selection));
    }
    router.push('/booking/guest-info');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="relative h-60 md:h-72 rounded-3xl overflow-hidden mt-4">
          <img alt={hotel.name} src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold">{hotel.name}</h2>
            <p className="text-ink-500">{hotel.address ? hotel.address + ', ' : ''}{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</p>
            {numReviews > 0 ? (
              <p className="text-yellow-500 mt-1">{'★'.repeat(Math.round(avgRating))} <span className="text-ink-600">{avgRating}/5 ({numReviews} reviews)</span></p>
            ) : <p className="text-ink-400 mt-1">No reviews yet</p>}
            {hotel.description && <p className="mt-3">{hotel.description}</p>}
            {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium">Amenities</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {hotel.amenities.map(a => <span key={a} className="badge">{a}</span>)}
                </div>
              </div>
            )}
            <h3 className="text-xl font-semibold mt-6 mb-2">Available Rooms</h3>
            {roomTypes.map((rt, idx) => {
              const base = 1500 + idx * 600;
              const plans = [
                { name: 'Standard Rate', includesBreakfast: false, cancellation: 'Non-refundable', pricePerNight: base },
                { name: 'Flexible Rate', includesBreakfast: true, cancellation: 'Free cancellation', pricePerNight: base + 300 }
              ];
              return (
                <RoomCard
                  key={rt.id}
                  roomType={rt}
                  availability={availability[rt.id]}
                  ratePlans={plans}
                  onBook={handleBook}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
