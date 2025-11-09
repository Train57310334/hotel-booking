import { useState } from 'react'
import { apiFetch, endpoints } from '@/lib/api'

export default function LoginPage(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try{
      const data = await apiFetch(endpoints.login, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const token = data.access_token || data.token || data.accessToken;
      if (typeof window !== 'undefined'){
        if (token) localStorage.setItem('token', token);
        const name = (data.user && (data.user.name || data.user.fullName)) || email.split('@')[0];
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
      }
      window.location.href = '/';
    }catch(err){
      setError(err.message || 'Login failed');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block font-medium">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block font-medium">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="w-full border p-2 rounded"/>
        </div>
        <button disabled={loading} className={`w-full py-2 px-4 rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 text-white'}`}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <a href="/auth/forgot-password" className="text-sm text-blue-600 underline block text-center">Forgot password?</a>
      </form>
    </div>
  )
}
