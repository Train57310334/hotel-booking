// ✅ pages/account/bookings.js
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const backend = process.env.NEXT_PUBLIC_BACKEND_API_BASE;
  useEffect(() => {
    
    fetch(backend+'/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data));
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">การจองของฉัน</h1>
        {bookings.length === 0 ? (
          <p>ยังไม่มีการจอง</p>
        ) : (
          <div className="space-y-4">
            {Array.isArray(bookings) && bookings.map((b) => (
              <div key={b.id} className="border rounded p-4 shadow">
                <h2 className="text-lg font-semibold">{b.hotelName}</h2>
                <p>ห้อง: {b.roomTypeName} ({b.ratePlanName})</p>
                <p>วันที่: {b.checkIn} - {b.checkOut}</p>
                <p>รวม: {b.totalPrice?.toLocaleString()} บาท</p>
                <p className="text-sm text-gray-600">สถานะ: {b.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}