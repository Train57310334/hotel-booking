import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatsCard from '@/components/dashboard/StatsCard'
import { DollarSign, Home, BedDouble, CalendarCheck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
    // Mock Data
    const stats = [
        { title: 'Total Revenue', value: '฿818,003,345', icon: DollarSign, subtext: 'Update November 1, 2024', color: 'green' },
        { title: 'Total Room', value: '3,345', icon: Home, subtext: 'Update November 1, 2024', color: 'green' },
        { title: 'Available Room', value: '3,345', icon: BedDouble, subtext: 'Update November 1, 2024', color: 'green' },
        { title: 'New Booking', value: '3,345', icon: CalendarCheck, subtext: 'Update November 1, 2024', color: 'green' },
    ]

    const revenueData = [
        { name: 'Jan', income: 4000, expense: 2400 },
        { name: 'Feb', income: 3000, expense: 1398 },
        { name: 'Mar', income: 2000, expense: 9800 },
        { name: 'Apr', income: 2780, expense: 3908 },
        { name: 'May', income: 1890, expense: 4800 },
        { name: 'Jun', income: 2390, expense: 3800 },
        { name: 'Jul', income: 3490, expense: 4300 },
    ]

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-slate-900">Welcome, Watt</h1>
                <p className="text-slate-500">Welcome to Banana, Manage your hotel booking data with us</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 font-display">Revenue Statistics</h2>
                        <select className="text-sm border-slate-200 rounded-lg text-slate-500 focus:ring-primary-500 focus:border-primary-500">
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="income" fill="url(#colorIncome)" radius={[4, 4, 0, 0]} barSize={20} />
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#059669" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Booking Schedule (Realistic Calendar) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 font-display">Booking Schedule</h2>
                        <button className="text-primary-600 p-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                            <CalendarCheck size={18} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
                            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {[...Array(31)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`py-2 text-sm rounded-lg transition-colors cursor-pointer
                    ${i + 1 === 19 ? 'bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/30' : 'text-slate-600 hover:bg-slate-50'}
                  `}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Tasks</h4>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-700">Room 205 Cleaning</p>
                                    <p className="text-[10px] text-slate-400">10:00 AM - 11:30 AM</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-700">Check-in: John Cooper</p>
                                    <p className="text-[10px] text-slate-400">02:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout >
    )
}
