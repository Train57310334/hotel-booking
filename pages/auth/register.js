import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { User, Mail, Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const authBgUrl = branding?.authBgUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2500';

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  return (
    <Layout hideNavbar hideFooter>
      <div className="min-h-screen flex text-slate-900 bg-white selection:bg-primary-100 selection:text-primary-900">

        {/* Left Side - Image & Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={authBgUrl}
            alt="Luxury Hotel"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10" />

          {/* Glowing orb effect */}
          <div className="absolute inset-0 bg-primary-500/10 blur-[100px] mix-blend-screen pointer-events-none" />

          <div className="absolute inset-0 flex flex-col justify-between p-16 z-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Link href="/" className="inline-flex items-center gap-3 group">
                {logoUrl ? (
                  <div className="h-12 w-12 relative rounded-xl overflow-hidden shadow-2xl border border-white/20 group-hover:scale-105 transition-transform duration-500">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-12 w-12 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all duration-300 flex justify-center items-center shadow-xl">
                    <img src="/logo.png" alt="BookingKub" className="w-full h-full object-contain brightness-0 invert" />
                  </div>
                )}
                <span className="text-2xl font-display font-bold text-white tracking-tight">{siteName}</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-5xl font-display font-bold text-white leading-[1.15]">
                Manage your hotel <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300">with ease.</span>
              </h2>
              <p className="text-lg text-slate-200 max-w-md leading-relaxed">
                Join thousands of hotel owners growing their business with our all-in-one platform.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col relative bg-slate-50 lg:bg-white overflow-y-auto">
          {/* Subtle background pattern for form side */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 mix-blend-multiply pointer-events-none" />

          {/* Mobile Header / Back Button */}
          <div className="absolute top-0 right-0 p-6 md:p-8 z-20">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-primary-600 transition-colors bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center px-6 md:px-24 xl:px-32 py-20 relative z-10 min-h-[min-content]">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-md w-full mx-auto space-y-8 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl md:shadow-2xl border border-slate-100 lg:border-none lg:shadow-none lg:p-0 lg:bg-transparent"
            >
              <motion.div variants={fadeInUp} className="space-y-3">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-primary-600 transition-colors mb-2 lg:hidden bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-sm">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">Get Started</h1>
                <p className="text-slate-500 text-base">Create your hotel management account.</p>
              </motion.div>

              {/* Package Badge */}
              <motion.div variants={fadeInUp} className={`p-5 rounded-2xl border flex justify-between items-center transition-colors shadow-sm ${selectedPackage === 'PRO' ? 'bg-indigo-50 border-indigo-200 shadow-indigo-100/50' : 'bg-slate-50 border-slate-200'
                }`}>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Selected Plan</p>
                  <p className={`text-xl font-bold mt-0.5 ${selectedPackage === 'PRO' ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {selectedPackage}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-900 font-bold text-lg">
                    {selectedPackage === 'LITE' ? 'Free Forever' : selectedPackage === 'PRO' ? '฿990 /mo' : 'Custom'}
                  </p>
                </div>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-3 border border-red-100 font-medium overflow-hidden"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                    </div>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form variants={fadeInUp} onSubmit={handleRegister} className="space-y-5">

                {/* Hotel Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Hotel Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" /></svg>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="My Awesome Hotel"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400 shadow-sm"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Owner Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors z-10" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400 shadow-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors z-10" size={20} />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400 shadow-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="0812345678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400 shadow-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors z-10" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="Create a strong password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400 shadow-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <motion.div variants={fadeInUp} className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(59,130,246,0.7)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden mt-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />

                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.form>

              <motion.div variants={fadeInUp} className="pt-6 mt-6 border-t border-slate-100 text-center relative z-10">
                <p className="text-slate-500 font-medium pb-2 text-sm md:text-base">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-colors">
                    Sign In
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile branding fallback */}
          <div className="lg:hidden p-8 text-center bg-slate-50 absolute bottom-0 w-full z-0">
            <p className="text-xs font-medium text-slate-400">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const { API_BASE } = require('@/lib/api');
  let branding = {
    siteName: 'BookingKub',
    logoUrl: null
  };

  try {
    const res = await fetch(`${API_BASE}/public-settings`);
    if (res.ok) {
      const data = await res.json();
      branding.siteName = data.siteName || branding.siteName;
      branding.logoUrl = data.logoUrl || branding.logoUrl;
      branding.authBgUrl = data.authBgUrl || null;
    }
  } catch (e) {
    console.error("Failed to fetch public settings for register", e);
  }

  return {
    props: {
      branding
    }
  };
}