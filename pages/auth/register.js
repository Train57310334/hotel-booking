import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { User, Mail, Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage({ branding }) {
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

  const siteName = branding?.siteName || 'BookingKub';
  const logoUrl = branding?.logoUrl;

  return (
    <Layout hideNavbar hideFooter>
      <div className="min-h-screen flex text-slate-900 bg-white selection:bg-primary-100 selection:text-primary-900">

        {/* Left Side - Image & Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2500"
            alt="Luxury Resort"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-between p-16 z-10">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group">
                {logoUrl ? (
                  <div className="h-12 w-12 relative rounded-xl overflow-hidden shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </div>
                )}
                <span className="text-2xl font-display font-bold text-white tracking-tight">{siteName}</span>
              </Link>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-display font-bold text-white leading-tight">
                Start your journey to <br />
                unforgettable places.
              </h2>
              <p className="text-lg text-slate-200 max-w-md leading-relaxed">
                Join our community of travelers and get access to exclusive member-only rates.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col relative">
          {/* Mobile Header / Back Button */}
          <div className="absolute top-0 right-0 p-8 z-20">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-primary-600 transition-colors">
              Back to Home <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 md:px-24 xl:px-32">
            <div className="max-w-md w-full mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Create Account</h1>
                <p className="text-slate-500 text-lg">Join us to unlock exclusive deals and offers.</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="Create a strong password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Create Account <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 text-center">
                <p className="text-slate-500 font-medium">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary-600 font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile branding fallback */}
          <div className="lg:hidden p-8 text-center bg-slate-50">
            <p className="text-xs text-slate-400">© 2024 {siteName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  try {
    const backend = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:3001/api';
    const res = await fetch(`${backend}/public-settings`);
    const settings = await res.json();

    return {
      props: {
        branding: {
          siteName: settings.siteName || 'BookingKub',
          logoUrl: settings.logoUrl || null
        }
      }
    };
  } catch (e) {
    return {
      props: {
        branding: { siteName: 'BookingKub', logoUrl: null }
      }
    }
  }
}