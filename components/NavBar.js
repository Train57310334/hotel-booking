import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NavBar(){
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const name = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
    setUser(name);
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined'){
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    }
    window.location.href = '/';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-3">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-blue-700">BookingKub</Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm hover:underline">Search</Link>
          <Link href="/account/bookings" className="text-sm hover:underline">My Bookings</Link>
          {user ? (
            <>
              <span className="text-sm text-gray-600">Hi, {user}</span>
              <button onClick={logout} className="text-sm bg-gray-100 px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Login</Link>
              <Link href="/auth/register" className="text-sm px-3 py-1 rounded border">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
