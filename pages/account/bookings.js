import { useEffect, useState } from 'react'
import { apiFetch, endpoints } from '@/lib/api'

export default function MyBookings(){
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  useEffect(()=>{
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token){
      window.location.href = '/auth/login';
      return;
    }
    const load = async () => {
      try{
        let data = await apiFetch(endpoints.myBookings, { method: 'GET' });
        if (!Array.isArray(data)) {
          data = await apiFetch('/bookings', { method: 'GET' });
          if (!Array.isArray(data)) data = [];
        }
        setItems(data);
      }catch(err){
        setError(err.message || 'Failed to load bookings');
      }finally{
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      {items.length === 0 ? (
        <p className="text-gray-600">No bookings found.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(b => (
            <li key={b.id} className="bg-white p-3 rounded shadow text-sm">
              <p><strong>ID:</strong> {b.id}</p>
              <p><strong>Hotel:</strong> {b.hotel?.name || b.hotelName || '-'}</p>
              <p><strong>Dates:</strong> {b.checkIn} – {b.checkOut}</p>
              <p><strong>Total:</strong> ฿{Number(b.totalAmount || 0).toFixed(0)}</p>
              <p><strong>Status:</strong> {b.status || 'confirmed'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
