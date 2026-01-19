// ✅ pages/booking/confirmation.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function ConfirmationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/bookings/${id}`)
        .then(res => res.json())
        .then(data => setBooking(data));
    }
  }, [id]);

  if (!id) return <Layout><div className="p-6">ไม่มีรหัสการจอง</div></Layout>;
  if (!booking) return <Layout><div className="p-6">กำลังโหลดข้อมูล...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">ยืนยันการจองเรียบร้อย</h1>
        <p>รหัสการจองของคุณคือ:</p>
        <p className="text-xl font-semibold my-2">{booking.id}</p>

        <div className="mt-4 space-y-2">
          <p><strong>โรงแรม:</strong> {booking.hotelName}</p>
          <p><strong>ห้อง:</strong> {booking.roomTypeName}</p>
          <p><strong>วันที่เข้าพัก:</strong> {booking.checkIn} - {booking.checkOut}</p>
          <p><strong>จำนวนผู้เข้าพัก:</strong> {booking.guests}</p>
          <p><strong>ยอดรวม:</strong> {booking.totalPrice?.toLocaleString()} บาท</p>
        </div>

        <div className="mt-6">
          <button className="btn btn-outline w-full" onClick={() => router.push('/')}>กลับหน้าแรก</button>
        </div>
      </div>
    </Layout>
  );
}