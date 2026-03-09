import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Lock, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'

export default function ResetPasswordPage({ branding }) {
    const router = useRouter()
    const { token } = router.query

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState({ type: null, message: '' }) // type: 'success' | 'error'
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus({ type: null, message: '' })

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match.' })
            return
        }

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' })
            return
        }

        if (!token) {
            setStatus({ type: 'error', message: 'Invalid or missing password reset token.' })
            return
        }

        setLoading(true)

        try {
            await apiFetch('/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword: password }),
            });

            setStatus({ type: 'success', message: 'Your password has been successfully reset. Redirecting to login...' })
            setTimeout(() => {
                router.push('/auth/login')
            }, 3000)
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'The reset link is invalid or has expired.' })
        } finally {
            setLoading(false)
        }
    }

    const siteName = branding?.siteName || 'BookingKub';
    const logoUrl = branding?.logoUrl;
    const authBgUrl = branding?.authBgUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2500';

    return (
        <Layout hideNavbar hideFooter>
            <div className="min-h-screen flex text-slate-900 bg-white selection:bg-primary-100 selection:text-primary-900">

                {/* Left Side - Image & Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
                    <img
                        src={authBgUrl}
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
                                Get back to managing <br />
                                your properties.
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex flex-col relative">
                    <div className="flex-1 flex flex-col justify-center px-8 md:px-24 xl:px-32 relative">

                        {/* Mobile Header / Back Button */}
                        <div className="absolute top-0 right-0 p-8 z-20">
                            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-primary-600 transition-colors">
                                Back to Home <ArrowLeft size={16} className="rotate-180" />
                            </Link>
                        </div>

                        <div className="max-w-md w-full mx-auto space-y-8 mt-12 md:mt-0">
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Create New Password</h1>
                                <p className="text-slate-500 text-lg">Your new password must be securely chosen.</p>
                            </div>

                            {status.type === 'error' && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                                    {status.message}
                                </div>
                            )}

                            {status.type === 'success' && (
                                <div className="bg-emerald-50 text-emerald-700 px-4 py-4 rounded-xl text-sm flex items-start gap-3 border border-emerald-100">
                                    <CheckCircle2 className="shrink-0 text-emerald-500 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-bold text-emerald-800 text-base mb-1">Password updated</p>
                                        <p>{status.message}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
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

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder:text-slate-400"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || status.type === 'success'}
                                    className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>
                                            Save Password <CheckCircle2 size={20} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Mobile branding fallback */}
                    <div className="lg:hidden p-8 text-center bg-slate-50">
                        <p className="text-xs text-slate-400">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
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
        console.error("Failed to fetch public settings for reset-password", e);
    }

    return {
        props: {
            branding
        }
    };
}
