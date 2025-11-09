import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Confirmation(){
  const router = useRouter();
  const [sel, setSel] = useState(null);

  useEffect(()=>{
    if (typeof window !== 'undefined'){
      const s = localStorage.getItem('bookingSelection');
      if (s) setSel(JSON.parse(s));
      else router.replace('/');
    }
  }, [router]);

  if (!sel) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-md text-center">
      <h2 className="text-2xl font-bold mb-2 text-green-600">Booking Confirmed!</h2>
      <p className="mb-4">Thank you. Your reservation is confirmed.</p>
      <div className="bg-gray-100 p-3 rounded mb-4 text-left text-sm">
        <p><strong>Booking ID:</strong> {sel.bookingId}</p>
        <p><strong>Hotel:</strong> {sel.hotelName}</p>
        <p><strong>Room:</strong> {sel.roomTypeName}</p>
        <p><strong>Dates:</strong> {sel.checkIn || 'N/A'} – {sel.checkOut || 'N/A'} ({sel.guests} guests)</p>
        {sel.leadName && <p><strong>Lead Guest:</strong> {sel.leadName} ({sel.leadEmail})</p>}
        {sel.specialRequests && <p><strong>Special Requests:</strong> {sel.specialRequests}</p>}
        <p><strong>Total Paid:</strong> ฿{Number(sel.totalPrice).toFixed(0)}</p>
      </div>
      {sel.bookingId && (
        <img
          alt="QR"
          className="mx-auto mb-4"
          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(sel.bookingId)}`}
        />
      )}
      <a href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">Back to Home</a>
    </div>
  )
}
