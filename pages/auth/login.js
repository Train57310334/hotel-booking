// ✅ pages/auth/login.js
import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '@/components/Layout';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);


  const handleLogin = async () => {
    setError(null);
    const backend = process.env.NEXT_PUBLIC_BACKEND_API_BASE;
    const res = await fetch(backend+'/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data?.token) {
      localStorage.setItem('token', data.token);
      router.push('/account/bookings');
    } else {
      setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };


  return (
    <Layout>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h1>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          type="email"
          placeholder="อีเมล"
          className="input input-bordered w-full mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          className="input input-bordered w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-full" onClick={handleLogin}>
          เข้าสู่ระบบ
        </button>
      </div>
    </Layout>
  );
}