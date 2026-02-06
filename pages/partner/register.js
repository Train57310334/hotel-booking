import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '@/components/Layout'
import { User, Mail, Lock, ArrowRight, Loader2, Building, Phone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPartnerPage() {
    const router = useRouter()
    const { registerPartner } = useAuth()

    const [formData, setFormData] = useState({
        hotelName: '',
        name: '',
        email: '',
        password: '',
        phone: ''
    })

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const res = await registerPartner(formData)

        if (res.success) {
            router.push('/admin/dashboard')
        } else {
            setError(res.error || 'Registration failed')
            setLoading(false)
        }
    }

    return (
        <Layout hideNavbar hideFooter>
            <div className="min-h-screen flex text-slate-900 bg-slate-50">
                {/* Left Side - Info */}
                <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16">
                    <img
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2500"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">BookingKub <span className="text-primary-400">Partner</span></h1>
                        <p className="text-slate-400">Grow your hotel business with us.</p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <h2 className="text-5xl font-display font-bold text-white leading-tight">
                            Manage your hotel <br /> like a pro.
                        </h2>
                        <ul className="space-y-4 text-lg text-slate-300">
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">✓</div>
                                <span>Real-time Booking Management</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">✓</div>
                                <span>Integrated Payment Gateway</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">✓</div>
                                <span>Powerful Reporting & Insights</span>
                            </li>
                        </ul>
                    </div>

                    <div className="text-slate-500 text-sm relative z-10">
                        © 2024 BookingKub Partner. All rights reserved.
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-slate-900">Get Started</h2>
                            <p className="text-slate-500">Create your partner account to start managing your property.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 ml-1 mb-1 block">Hotel Name</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            name="hotelName"
                                            type="text"
                                            required
                                            placeholder="Grand Hotel Bangkok"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={formData.hotelName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 ml-1 mb-1 block">Owner Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                name="name"
                                                type="text"
                                                required
                                                placeholder="John Owner"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 outline-none"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 ml-1 mb-1 block">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                name="phone"
                                                type="text"
                                                placeholder="081-234-5678"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 outline-none"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 ml-1 mb-1 block">Email (Username)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="owner@hotel.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 ml-1 mb-1 block">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Create Hotel Account <ArrowRight size={20} /></>}
                            </button>

                            <p className="text-center text-slate-500 text-sm">
                                Already have a partner account? <Link href="/auth/login" className="text-primary-600 font-bold hover:underline">Log in</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
