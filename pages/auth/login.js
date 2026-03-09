import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, Check, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { apiFetch } from '@/lib/api'

export default function LoginPage({ branding }) {
  const router = useRouter()
  const { login } = useAuth()
  const { t } = useLanguage()
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
      try {
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
                Experience the art of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-300">luxury hospitality.</span>
              </h2>
              <div className="flex items-center gap-4 text-slate-300 bg-slate-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-max">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i, idx) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + (idx * 0.1) }}
                      className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-200 lg:bg-cover shadow-lg relative z-${40 - (idx * 10)}`}
                      style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})` }}
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    {/* Stars */}
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="font-semibold text-sm text-slate-200">Trusted by 50,000+ guests</p>
                </div>
              </div>
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
                <div className="inline-block p-3 bg-primary-50 rounded-2xl mb-2 text-primary-600 lg:hidden">
                  <Lock size={24} />
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">{t('auth.loginTitle')}</h1>
                <p className="text-slate-500 text-base">{t('auth.enterDetails')}</p>
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

              <motion.form variants={fadeInUp} onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">{t('auth.emailLabel')}</label>
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

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-bold text-slate-700">{t('auth.passwordLabel')}</label>
                    <Link href="/auth/forgot-password" className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline">
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors z-10" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-[3px] focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400 shadow-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-primary-600 border-primary-600 shadow-md shadow-primary-500/20' : 'bg-white border-slate-300 hover:border-slate-400'}`}
                  >
                    <motion.div
                      initial={false}
                      animate={rememberMe ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      className="text-white"
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.div>
                  </button>
                  <label onClick={() => setRememberMe(!rememberMe)} className="text-sm font-bold text-slate-600 cursor-pointer select-none">{t('auth.rememberMe')}</label>
                </div>

                <motion.div variants={fadeInUp} className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(59,130,246,0.7)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                  >
                    {/* Button hover shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-shine" />

                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        {t('auth.loginBtn')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.form>

              <motion.div variants={fadeInUp} className="pt-6 mt-6 pb-2 text-center relative before:absolute before:top-0 before:left-10 before:right-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-slate-200 before:to-transparent">
                <p className="text-slate-500 font-medium pb-2 text-sm md:text-base">
                  {t('auth.registerPrompt')}{' '}
                  <Link href="/auth/register-guest" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-colors">
                    {t('auth.createGuest')}
                  </Link>
                </p>
                <div className="mt-6 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-xs md:text-sm font-medium text-slate-500">
                  <span>{t('auth.areYouOwner')}</span>
                  <Link href="/auth/register" className="text-slate-900 font-bold hover:text-primary-600 transition-colors flex items-center gap-1">
                    {t('auth.registerHotel')} <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
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
    console.error("Failed to fetch public settings for login", e);
  }

  return {
    props: {
      branding
    }
  };
}