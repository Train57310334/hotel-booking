// ✅ pages/auth/register.js
import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '@/components/Layout';


export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);


  const handleRegister = async () => {
    setError(null);
    const backend = process.env.NEXT_PUBLIC_BACKEND_API_BASE;
    const res = await fetch(backend+'/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok && data?.token) {
      localStorage.setItem('token', data.token);
      router.push('/account/bookings');
    } else {
      setError(data.message || 'สมัครสมาชิกไม่สำเร็จ');
    }
  };


  return (
    <Layout>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">สมัครสมาชิก</h1>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          type="text"
          placeholder="ชื่อ-นามสกุล"
          className="input input-bordered w-full mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <button className="btn btn-primary w-full" onClick={handleRegister}>
          สมัครสมาชิก
        </button>
      </div>
    </Layout>
  );
}