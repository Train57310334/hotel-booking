import { useState } from 'react'
import { apiFetch, endpoints } from '@/lib/api'

export default function ForgotPasswordPage(){
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try{
      await apiFetch(endpoints.forgot, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setMessage('If the email exists, a reset link has been sent.');
    }catch(err){
      setMessage('If the email exists, a reset link has been sent.');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block font-medium">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full border p-2 rounded"/>
        </div>
        <button disabled={loading} className={`w-full py-2 px-4 rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 text-white'}`}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  )
}
