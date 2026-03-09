import Link from 'next/link'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch } from '@/lib/api'

export default function ForgotPasswordPage({ branding }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ type: null, message: '' }) // type: 'success' | 'error'
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: null, message: '' })
    setLoading(true)

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() }),
      });
      // The endpoint returns { success: true } silently
      setStatus({ type: 'success', message: 'If that email exists, a password reset link has been sent.' })
      setEmail('')
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again later.' })
    } finally {
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
                Get back to managing <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300">your properties.</span>
              </h2>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col relative bg-slate-50 lg:bg-white">
          {/* Subtle background pattern for form side */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30 mix-blend-multiply pointer-events-none" />

          {/* Mobile Header / Back Button */}
          <div className="absolute top-0 right-0 p-6 md:p-8 z-20">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-primary-600 transition-colors bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center px-6 md:px-24 xl:px-32 relative z-10 py-20">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-md w-full mx-auto space-y-8 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl md:shadow-2xl border border-slate-100 lg:border-none lg:shadow-none lg:p-0 lg:bg-transparent"
            >
              <motion.div variants={fadeInUp} className="space-y-3">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-primary-600 transition-colors mb-4 lg:hidden bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-sm">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
                <Link href="/auth/login" className="hidden lg:inline-flex items-center gap-2 text-slate-500 font-bold hover:text-primary-600 transition-colors mb-4 text-sm">
                  <ArrowLeft size={16} /> Back to Sign In
                </Link>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">Forgot Password</h1>
                <p className="text-slate-500 text-base">Enter your email address to receive a secure password reset link.</p>
              </motion.div>

              <AnimatePresence>
                {status.type === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-3 border border-red-100 font-medium overflow-hidden"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                    </div>
                    {status.message}
                  </motion.div>
                )}

                {status.type === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-50 text-emerald-700 px-5 py-4 rounded-xl text-sm flex items-start gap-3 border border-emerald-100 overflow-hidden"
                  >
                    <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={20} />
                    <div>
                      <p className="font-bold text-emerald-800 text-base mb-1">Check your inbox</p>
                      <p>{status.message}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-6">
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

                <button
                  type="submit"
                  disabled={loading || status.type === 'success'}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(59,130,246,0.7)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden mt-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />

                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
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
    console.error("Failed to fetch public settings for forgot-password", e);
  }

  return {
    props: {
      branding
    }
  };
}
