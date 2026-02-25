import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api'

export default function LoginPage({ branding }) {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await login(email.trim(), password)

    if (res.success) {
      // Check roles from response or fetch profile to decide redirection
      // Note: login() in AuthContext already fetches profile into `user` state, 
      // but state update might be async. Better to rely on the API response if possible 
      // or wait for the updated user context.
      // However, for simplicity, we can fetch /auth/me here or trust the AuthContext logic.

      // Let's optimize: The AuthContext.login returns { success: true } but doesn't return the user object directly.
      // We can modify AuthContext to return the user, OR we can just fetch it here quickly to decide.
      try {
        const token = localStorage.getItem('token');
        // We need to decode token or fetch me. Let's fetch me to be safe.
        // Actually, AuthContext.login calls checkUser() which updates state.
        // We can use a small timeout or just redirect to a "decider" page.
        // BUT, better is to let AuthContext return the user.

        // TEMPORARY FIX: Redirect to /admin if they have access, else /
        // Since we can't easily see roles here without modifying Context return, 
        // let's fetch /auth/me one more time or just redirect to /account/bookings for guests.

        // Better approach:
        console.log('Fetching user profile to determine role...');
        const userRes = await apiFetch('/auth/me');

        if (userRes.roles?.includes('hotel_admin') || userRes.roles?.includes('platform_admin') || userRes.roleAssignments?.length > 0) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } catch (err) {
        router.push('/');
      }
    } else {
      setError(res.error || 'Invalid email or password')
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
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2500"
            alt="Luxury Hotel"
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
                  <div className="h-12 w-12 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all duration-300 flex justify-center items-center">
                    <img src="/logo.png" alt="BookingKub" className="w-full h-full object-contain brightness-0 invert" />
                  </div>
                )}
                <span className="text-2xl font-display font-bold text-white tracking-tight">{siteName}</span>
              </Link>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-display font-bold text-white leading-tight">
                Experience the art of <br />
                luxury hospitality.
              </h2>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-200 lg:bg-cover`} style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})` }} />
                  ))}
                </div>
                <p className="font-medium">Trusted by 50,000+ guests</p>
              </div>
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
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Welcome Back</h1>
                <p className="text-slate-500 text-lg">Enter your details to access your account.</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
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

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    <a href="#" className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-300'}`}
                  >
                    {rememberMe && <Check size={14} className="text-white" />}
                  </button>
                  <label onClick={() => setRememberMe(!rememberMe)} className="text-sm font-medium text-slate-600 cursor-pointer select-none">Remember for 30 days</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Sign In <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 text-center">
                <p className="text-slate-500 font-medium">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-primary-600 font-bold hover:underline">
                    Register your hotel
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

// For SaaS mode, we want to hardcode the branding to BookingKub
export async function getServerSideProps() {
  return {
    props: {
      branding: {
        siteName: 'BookingKub',
        logoUrl: null // Use default SVG
      }
    }
  };
}