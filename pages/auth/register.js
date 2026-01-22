import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await register({ name, email, password })

    if (res.success) {
      router.push('/')
    } else {
      setError(res.error || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row min-h-[650px]">

          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center md:text-left mb-10">
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Create Account</h1>
                <p className="text-slate-500">Join us to unlock exclusive deals and offers</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="Create a strong password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 group mt-4 relative overflow-hidden"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-bold text-primary-600 hover:text-primary-700 hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Side */}
          <div className="hidden md:flex md:w-1/2 relative bg-slate-900 text-white p-12 flex-col justify-between overflow-hidden order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1571896349842-6e5a51335022?q=80&w=1200&auto=format&fit=crop"
              alt="Luxury Resort"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 to-primary-800/40 mix-blend-multiply" />

            <div className="relative z-10">
              <h2 className="text-4xl font-display font-bold mb-6">Start Your Journey</h2>
              <p className="text-lg text-primary-100 font-light">
                Create an account to access member-only rates and experience the world's most breathtaking destinations.
              </p>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-sm text-primary-200">
                <span className="w-8 h-[1px] bg-primary-200" />
                Join our community of travelers
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}