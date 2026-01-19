// ✅ pages/booking/payment.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('bookingPayload');
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      router.push('/');
    }
  }, [router]);

  const handlePayment = async () => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    const result = await res.json();
    if (result?.id) {
      router.push(`/booking/confirmation?id=${result.id}`);
    }
  };

  if (!bookingData) return null;

  const { hotelName, roomTypeName, ratePlanName, totalPrice, guest } = bookingData;

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">ชำระเงิน</h1>
        <p>โรงแรม: <strong>{hotelName}</strong></p>
        <p>ห้อง: {roomTypeName} ({ratePlanName})</p>
        <p className="mt-2">ผู้เข้าพัก: {guest?.name} ({guest?.email})</p>
        <p className="text-xl mt-4">ยอดชำระ: <strong>{totalPrice.toLocaleString()} บาท</strong></p>

        <div className="mt-6 space-y-2">
          <button className="btn btn-success w-full" onClick={handlePayment}>
            ชำระตอนนี้ (Mock API)
          </button>
        </div>
      </div>
    </Layout>
  );
}