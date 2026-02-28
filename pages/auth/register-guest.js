import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'
import { apiFetch } from '@/lib/api'

export default function GuestRegisterPage({ branding }) {
    const router = useRouter()
    // We'll use a direct api call to register for guests
    const { login } = useAuth()
    const { t } = useLanguage()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true)

        try {
            const res = await apiFetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    phone: formData.phone
                })
            });

            if (res.user) {
                toast.success('Registration successful! Logging you in...');
                // Auto login
                const loginRes = await login(formData.email, formData.password);
                if (loginRes.success) {
                    router.push('/account/dashboard');
                } else {
                    router.push('/auth/login');
                }
            } else {
                throw new Error(res.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
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
                                {t('auth.createAccountTitle')}
                            </h2>
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

                    <div className="flex-1 flex flex-col justify-center px-8 md:px-24 xl:px-32 py-12">
                        <div className="max-w-md w-full mx-auto space-y-8">
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">{t('auth.createAccount')}</h1>
                                <p className="text-slate-500 text-lg">{t('auth.joinUs')}</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">{t('auth.fullName')}</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">{t('auth.emailLabel')}</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            type="email"
                                            required
                                            placeholder="name@example.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">{t('booking.phone')}</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+66 81 234 5678"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">{t('auth.passwordLabel')}</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">{t('auth.confirmPassword')}</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                                            {t('auth.createAccount')} <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="pt-4 text-center">
                                <p className="text-slate-500 font-medium">
                                    {t('auth.alreadyHaveAccount')}{' '}
                                    <Link href="/auth/login" className="text-primary-600 font-bold hover:underline">
                                        {t('auth.signIn')}
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
    return {
        props: {
            branding: {
                siteName: 'BookingKub',
                logoUrl: null
            }
        }
    };
}
