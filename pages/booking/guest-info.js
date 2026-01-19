// ✅ pages/booking/guest-info.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function GuestInfoPage() {
  const router = useRouter();
  const [bookingInfo, setBookingInfo] = useState(null);
  const [guest, setGuest] = useState({ name: '', email: '', phone: '', requests: '' });

  useEffect(() => {
    const stored = localStorage.getItem('bookingSelection');
    if (stored) {
      setBookingInfo(JSON.parse(stored));
    } else {
      router.push('/');
    }
  }, [router]);

  const handleContinue = () => {
    const payload = {
      ...bookingInfo,
      guest,
    };
    localStorage.setItem('bookingPayload', JSON.stringify(payload));
    router.push('/booking/payment');
  };

  if (!bookingInfo) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">ข้อมูลผู้เข้าพัก</h1>
        <p className="mb-2">โรงแรม: <strong>{bookingInfo.hotelName}</strong></p>
        <p className="mb-4">ห้อง: {bookingInfo.roomTypeName} ({bookingInfo.ratePlanName})</p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อ - นามสกุล"
            className="input input-bordered w-full"
            value={guest.name}
            onChange={(e) => setGuest({ ...guest, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="อีเมล"
            className="input input-bordered w-full"
            value={guest.email}
            onChange={(e) => setGuest({ ...guest, email: e.target.value })}
          />
          <input
            type="tel"
            placeholder="เบอร์โทรศัพท์"
            className="input input-bordered w-full"
            value={guest.phone}
            onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
          />
          <textarea
            placeholder="คำขอพิเศษ (ถ้ามี)"
            className="textarea textarea-bordered w-full"
            value={guest.requests}
            onChange={(e) => setGuest({ ...guest, requests: e.target.value })}
          />
          <button className="btn btn-primary w-full" onClick={handleContinue}>
            ดำเนินการต่อ → ชำระเงิน
          </button>
        </div>
      </div>
    </Layout>
  );
}
