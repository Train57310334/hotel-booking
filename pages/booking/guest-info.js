import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function GuestInfo(){
  const router = useRouter();
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if (typeof window !== 'undefined'){
      const s = localStorage.getItem('bookingSelection');
      if (s) setSel(JSON.parse(s));
      else router.replace('/');
    }
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    if (!sel) return;
    setLoading(true);
    const form = e.target;
    const lead = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value
    };
    const specialRequests = form.requests.value;
    const payload = {
      hotelId: sel.hotelId,
      roomTypeId: sel.roomTypeId,
      ratePlanId: sel.ratePlanName,
      checkIn: sel.checkIn,
      checkOut: sel.checkOut,
      guests: { adult: Number(sel.guests)||1, child: 0 },
      leadGuest: lead,
      specialRequests,
      totalAmount: sel.totalPrice
    };
    try{
      const token = localStorage.getItem('token');
      const res = await fetch('https://api.bookingkub.com/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      });
      if (res.ok){
        const data = await res.json();
        sel.bookingId = data.id;
      } else {
        sel.bookingId = 'SIM-' + Math.floor(Math.random()*1e6);
      }
    }catch(e){
      sel.bookingId = 'SIM-' + Math.floor(Math.random()*1e6);
    }
    sel.leadName = lead.name;
    sel.leadEmail = lead.email;
    sel.leadPhone = lead.phone;
    sel.specialRequests = specialRequests;
    localStorage.setItem('bookingSelection', JSON.stringify(sel));
    setLoading(false);
    router.push('/booking/payment');
  };

  if (!sel) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Step 1: Guest Information</h2>
      <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
        <p><strong>Hotel:</strong> {sel.hotelName}</p>
        <p><strong>Room:</strong> {sel.roomTypeName}</p>
        <p><strong>Dates:</strong> {sel.checkIn || 'N/A'} – {sel.checkOut || 'N/A'} ({sel.guests} guests)</p>
        <p><strong>Total:</strong> ฿{Number(sel.totalPrice).toFixed(0)}</p>
      </div>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="block font-medium">Full Name</label>
          <input name="name" required className="w-full border p-2 rounded"/>
        </div>
        <div className="mb-3">
          <label className="block font-medium">Email</label>
          <input type="email" name="email" required className="w-full border p-2 rounded"/>
        </div>
        <div className="mb-3">
          <label className="block font-medium">Phone</label>
          <input name="phone" required className="w-full border p-2 rounded"/>
        </div>
        <div className="mb-4">
          <label className="block font-medium">Special Requests</label>
          <textarea name="requests" rows="3" className="w-full border p-2 rounded" placeholder="Optional"></textarea>
        </div>
        <button disabled={loading} className={`w-full py-2 px-4 rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 text-white'}`}>
          {loading ? 'Submitting...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  )
}
