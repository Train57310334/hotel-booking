import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Payment(){
  const router = useRouter();
  const [sel, setSel] = useState(null);
  const [promo, setPromo] = useState('');
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(()=>{
    if (typeof window !== 'undefined'){
      const s = localStorage.getItem('bookingSelection');
      if (s){
        const obj = JSON.parse(s);
        setSel(obj);
        setTotal(obj.totalPrice || 0);
      } else router.replace('/');
    }
  }, [router]);

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (code === 'SAVE10'){
      setTotal(t => t * 0.9);
    } else {
      alert('Invalid promo code');
    }
  };

  const pay = async () => {
    if (!sel) return;
    const card = document.getElementById('cardNumber').value;
    const exp = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
    if (!card || !exp || !cvv){ alert('Enter payment details'); return; }
    setProcessing(true);
    try{
      const token = localStorage.getItem('token');
      await fetch(`https://api.bookingkub.com/bookings/${sel.bookingId}/confirm-payment`, {
        method: 'PUT',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
    }catch(e){ /* swallow for demo */ }
    sel.totalPrice = total;
    localStorage.setItem('bookingSelection', JSON.stringify(sel));
    setProcessing(false);
    router.push('/booking/confirmation');
  };

  if (!sel) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Step 2: Payment</h2>
      <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
        <p><strong>Booking ID:</strong> {sel.bookingId}</p>
        <p><strong>Hotel:</strong> {sel.hotelName}</p>
        <p><strong>Room:</strong> {sel.roomTypeName}</p>
        <p><strong>Dates:</strong> {sel.checkIn || 'N/A'} – {sel.checkOut || 'N/A'} ({sel.guests} guests)</p>
        <p><strong>Total:</strong> ฿{Number(total).toFixed(0)}</p>
      </div>

      <div className="mb-3">
        <label className="block font-medium">Promo Code</label>
        <div className="flex">
          <input value={promo} onChange={e=>setPromo(e.target.value)} placeholder="SAVE10" className="flex-1 border p-2 rounded-l"/>
          <button type="button" onClick={applyPromo} className="bg-blue-600 text-white px-4 rounded-r">Apply</button>
        </div>
      </div>

      <div className="mb-3">
        <label className="block font-medium">Card Number</label>
        <input id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" className="w-full border p-2 rounded"/>
      </div>
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="block font-medium">Expiry</label>
          <input id="expiry" placeholder="MM/YY" className="w-full border p-2 rounded"/>
        </div>
        <div className="flex-1">
          <label className="block font-medium">CVV</label>
          <input id="cvv" placeholder="XXX" className="w-full border p-2 rounded" maxLength={4}/>
        </div>
      </div>
      <button onClick={pay} disabled={processing} className={`w-full py-2 px-4 rounded ${processing ? 'bg-gray-400' : 'bg-green-600 text-white'}`}>
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  )
}
