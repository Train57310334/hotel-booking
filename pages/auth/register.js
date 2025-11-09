import { useState } from 'react'
import { apiFetch, endpoints } from '@/lib/api'

export default function RegisterPage(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try{
      await apiFetch(endpoints.register, {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      window.location.href = '/auth/login';
    }catch(err){
      setError(err.message || 'Register failed');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block font-medium">Full Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} required className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block font-medium">Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="w-full border p-2 rounded"/>
        </div>
        <button disabled={loading} className={`w-full py-2 px-4 rounded ${loading ? 'bg-gray-400' : 'bg-green-600 text-white'}`}>
          {loading ? 'Creating...' : 'Register'}
        </button>
        <p className="text-xs text-gray-500 text-center">By creating an account, you agree to our Terms & Privacy.</p>
      </form>
    </div>
  )
}
