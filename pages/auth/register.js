import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { User, Mail, Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage({ branding }) {
  const router = useRouter()
  const { registerPartner } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedPackage, setSelectedPackage] = useState('LITE') // Default to LITE
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Read plan from URL
  useEffect(() => {
    if (router.query.plan) {
      const plan = router.query.plan.toUpperCase();
      if (['LITE', 'PRO', 'ENTERPRISE'].includes(plan)) {
        setSelectedPackage(plan)
      }
    }
  }, [router.query.plan])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Call registerPartner instead of register
    const res = await registerPartner({
      name,
      email,
      password,
      hotelName,
      phone,
      package: selectedPackage
    })

    if (res.success) {
      router.push('/admin') // Redirect to Admin Dashboard directly
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
                Manage your hotel <br />
                with ease.
              </h2>
              <p className="text-lg text-slate-200 max-w-md leading-relaxed">
                Join thousands of hotel owners growing their business with our all-in-one platform.
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

          <div className="flex-1 flex flex-col justify-center px-8 md:px-24 xl:px-32 py-10">
            <div className="max-w-md w-full mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Get Started</h1>
                <p className="text-slate-500 text-lg">Create your hotel management account.</p>
              </div>

              {/* Package Badge */}
              <div className={`p-4 rounded-xl border flex justify-between items-center ${selectedPackage === 'PRO' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                }`}>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Selected Plan</p>
                  <p className={`text-xl font-bold ${selectedPackage === 'PRO' ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {selectedPackage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-900 font-bold">
                    {selectedPackage === 'LITE' ? 'Free Forever' : selectedPackage === 'PRO' ? '฿990 /mo' : 'Custom'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">

                {/* Hotel Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Hotel Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" /></svg>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="My Awesome Hotel"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Owner Name</label>
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

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="0812345678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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