import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/AdminLayout'
import ConfirmationModal from '@/components/ConfirmationModal'
import {
    Crown, Check, Zap, Rocket, Package, Building2, X,
    Calendar, Clock, CreditCard, ArrowRight, RefreshCw,
    Shield, AlertTriangle, TrendingUp, Receipt, ChevronRight,
    Users, BedDouble, TicketPercent, Globe, Megaphone, Star,
    Timer, CircleDollarSign, History, BadgeCheck, XCircle,
    BarChart3, ArrowUpRight, Repeat, Banknote, Loader2
} from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'
import Head from 'next/head'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { apiFetch } from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amountInSatang) => {
    const amount = (amountInSatang || 0) / 100
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDateThai = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const config = {
        active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', icon: BadgeCheck },
        expired: { label: 'Expired', classes: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: XCircle },
        grace_period: { label: 'Grace Period', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', icon: AlertTriangle },
        free: { label: 'Free', classes: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400', icon: Package },
        inactive: { label: 'Inactive', classes: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400', icon: XCircle },
    }
    const cfg = config[status] || config.inactive
    const Icon = cfg.icon
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${cfg.classes}`}>
            <Icon size={14} />
            {cfg.label}
        </span>
    )
}

// ─── Payment Type Badge ────────────────────────────────────────────────────────

function PaymentTypeBadge({ type }) {
    const config = {
        upgrade: { label: 'Upgrade', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', icon: ArrowUpRight },
        renewal: { label: 'Renewal', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', icon: Repeat },
        downgrade: { label: 'Downgrade', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', icon: TrendingUp },
    }
    const cfg = config[type] || config.upgrade
    const Icon = cfg.icon
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.classes}`}>
            <Icon size={12} />
            {cfg.label}
        </span>
    )
}

// ─── Circular Progress ─────────────────────────────────────────────────────────

function CircularProgress({ percent, daysRemaining, totalDays }) {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percent / 100) * circumference
    const color = percent > 60 ? '#10b981' : percent > 30 ? '#f59e0b' : '#ef4444'

    return (
        <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth="8"
                    fill="none" className="text-slate-100 dark:text-slate-700" />
                <circle cx="60" cy="60" r={radius} stroke={color} strokeWidth="8"
                    fill="none" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{daysRemaining}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">days left</span>
            </div>
        </div>
    )
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────────

function SkeletonCard({ className = '' }) {
    return (
        <div className={`animate-pulse bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 ${className}`}>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
        </div>
    )
}

// ─── Section 1: Subscription Status Card ─────────────────────────────────────

function SubscriptionStatusCard({ status, loading, onCancelAutoRenew, cancellingAutoRenew }) {
    if (loading) return <SkeletonCard className="md:col-span-2" />

    if (!status) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Subscription Data</h3>
                <p className="text-slate-500 text-sm">Unable to load subscription information. Please try refreshing.</p>
            </div>
        )
    }

    const isFreeOrLite = status.currentPlan === 'LITE' || status.subscriptionStatus === 'free'
    const isExpired = status.isExpired || status.subscriptionStatus === 'expired'
    const isGracePeriod = status.subscriptionStatus === 'grace_period'

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Top accent bar */}
            <div className={`h-1.5 ${isExpired ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                isFreeOrLite ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
                    'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500'}`} />

            <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                    {/* Left content */}
                    <div className="flex-1 space-y-6">
                        {/* Plan Name + Status */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFreeOrLite ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' :
                                    'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                                    <Crown size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                        {status.currentPlanDetails?.name || status.currentPlan || 'Free'} Plan
                                    </h2>
                                </div>
                            </div>
                            <StatusBadge status={status.subscriptionStatus} />
                            {status.billingCycle && status.billingCycle !== 'one_time' && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    <Repeat size={12} />
                                    Auto-Renew
                                </span>
                            )}
                            {status.billingCycle === 'one_time' && !isFreeOrLite && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                    <CreditCard size={12} />
                                    One-time
                                </span>
                            )}
                        </div>

                        {/* Alert Banners */}
                        {isExpired && (
                            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4">
                                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-red-700 dark:text-red-400">Subscription Expired</p>
                                    <p className="text-xs text-red-600 dark:text-red-400/80">Your subscription has expired. Renew now to continue using premium features.</p>
                                </div>
                                <a href="#pricing" className="ml-auto shrink-0 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-600 transition-colors">
                                    Renew Now
                                </a>
                            </div>
                        )}

                        {isGracePeriod && (
                            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
                                <Timer className="text-amber-500 shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Grace Period</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400/80">Your subscription is in a grace period. Renew soon to avoid service interruption.</p>
                                </div>
                            </div>
                        )}

                        {isFreeOrLite && !isExpired && (
                            <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-4">
                                <Rocket className="text-indigo-500 shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Upgrade Available</p>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400/80">Unlock more rooms, staff accounts, and premium features by upgrading your plan.</p>
                                </div>
                                <a href="#pricing" className="ml-auto shrink-0 bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors">
                                    View Plans
                                </a>
                            </div>
                        )}

                        {/* Subscription Period */}
                        {!isFreeOrLite && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Start Date</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Calendar size={14} className="text-slate-400" />
                                        {formatDateThai(status.subscriptionStart)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">End Date</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Calendar size={14} className="text-slate-400" />
                                        {formatDateThai(status.subscriptionEnd)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Last Payment</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Banknote size={14} className="text-slate-400" />
                                        {status.lastPayment ? formatCurrency(status.lastPayment.amount) : '—'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Quick Limits Summary */}
                        {status.limits && !isFreeOrLite && (
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                                    <BedDouble size={14} className="text-indigo-500" />
                                    <span className="font-bold">{status.limits.maxRooms === 9999 ? '∞' : status.limits.maxRooms}</span>
                                    <span className="text-slate-400">rooms</span>
                                </div>
                                {status.limits.maxRoomTypes && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                                        <Package size={14} className="text-teal-500" />
                                        <span className="font-bold">{status.limits.maxRoomTypes === 9999 ? '∞' : status.limits.maxRoomTypes}</span>
                                        <span className="text-slate-400">room types</span>
                                    </div>
                                )}
                                {status.limits.maxStaff !== undefined && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                                        <Users size={14} className="text-amber-500" />
                                        <span className="font-bold">{status.limits.maxStaff === 9999 ? '∞' : status.limits.maxStaff}</span>
                                        <span className="text-slate-400">staff</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cancel Auto-Renew */}
                        {status.isAutoRenew && (
                            <button
                                onClick={onCancelAutoRenew}
                                disabled={cancellingAutoRenew}
                                className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                                {cancellingAutoRenew ? (
                                    <><Loader2 size={12} className="animate-spin" /> Cancelling...</>
                                ) : (
                                    <><XCircle size={12} /> Cancel Auto-Renewal</>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Right: Progress Circle */}
                    {!isFreeOrLite && !isExpired && (
                        <div className="flex flex-col items-center gap-2">
                            <CircularProgress
                                percent={status.progressPercent || 0}
                                daysRemaining={status.daysRemaining || 0}
                                totalDays={status.totalDays || 30}
                            />
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                of {status.totalDays || 30} days total
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Section 3: Payment History ──────────────────────────────────────────────

function PaymentHistorySection({ history, loading }) {
    if (loading) return <SkeletonCard />

    const payments = history?.payments || []
    const summary = history?.summary || {}

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-8 pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
                            <History size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment History</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">All transactions for this hotel</p>
                        </div>
                    </div>
                    {/* Summary Stats */}
                    {payments.length > 0 && (
                        <div className="flex gap-4">
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-2 text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Spent</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(summary.totalSpent)}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-2 text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Transactions</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">{summary.totalTransactions || 0}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {payments.length === 0 ? (
                <div className="px-8 pb-8">
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-700/30 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt size={28} className="text-slate-400" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Payments Yet</h4>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Your payment history will appear here once you upgrade to a paid plan.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="px-8 pb-8">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Period</th>
                                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="py-3.5 px-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                            {formatDate(p.createdAt)}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <PaymentTypeBadge type={p.type} />
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                {p.previousPlan && (
                                                    <>
                                                        <span className="text-slate-400 dark:text-slate-500 font-medium">{p.previousPlan}</span>
                                                        <ArrowRight size={12} className="text-slate-300 dark:text-slate-600" />
                                                    </>
                                                )}
                                                <span className="font-bold text-slate-900 dark:text-white">{p.planName || p.plan}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                                            {formatDate(p.periodStart)} — {formatDate(p.periodEnd)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(p.amount)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'success'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                : p.status === 'failed'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                                }`}>
                                                {p.status === 'success' ? '✓ Paid' : p.status === 'failed' ? '✗ Failed' : p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {payments.map((p) => (
                            <div key={p.id} className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(p.createdAt)}</span>
                                    <PaymentTypeBadge type={p.type} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-sm">
                                        {p.previousPlan && (
                                            <>
                                                <span className="text-slate-400 font-medium">{p.previousPlan}</span>
                                                <ArrowRight size={12} className="text-slate-300" />
                                            </>
                                        )}
                                        <span className="font-bold text-slate-900 dark:text-white">{p.planName || p.plan}</span>
                                    </div>
                                    <span className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(p.amount)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>{formatDate(p.periodStart)} — {formatDate(p.periodEnd)}</span>
                                    <span className={`font-bold ${p.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {p.status === 'success' ? '✓ Paid' : '✗ Failed'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Section 4: Usage Overview ───────────────────────────────────────────────

function UsageOverviewSection({ currentHotel, status }) {
    const limits = status?.limits || {}

    const usageItems = [
        {
            label: 'Rooms',
            used: currentHotel?.physicalRoomsCount || 0,
            max: limits.maxRooms || currentHotel?.maxRooms || 0,
            icon: BedDouble,
            color: 'indigo'
        },
        {
            label: 'Room Types',
            used: currentHotel?.roomTypeCount || 0,
            max: limits.maxRoomTypes || 0,
            icon: Package,
            color: 'teal'
        },
        {
            label: 'Staff',
            used: currentHotel?.staffCount || 0,
            max: limits.maxStaff || 0,
            icon: Users,
            color: 'amber'
        },
    ]

    const featureToggles = [
        { label: 'Promotions', enabled: limits.canUsePromotions, icon: TicketPercent },
        { label: 'Online Payment', enabled: limits.canUseOnlinePayment, icon: CreditCard },
        { label: 'SEO Features', enabled: limits.canUseSEO, icon: Globe },
        { label: 'Marketing Tools', enabled: limits.canUseMarketing, icon: Megaphone },
        { label: 'Priority Support', enabled: limits.hasPrioritySupport, icon: Star },
        { label: 'Analytics', enabled: limits.canUseAnalytics, icon: BarChart3 },
    ]

    // Only show toggles that have a defined value
    const activeToggles = featureToggles.filter(f => f.enabled !== undefined)

    const colorMap = {
        indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', light: 'bg-indigo-50 dark:bg-indigo-500/10' },
        teal: { bg: 'bg-teal-500', text: 'text-teal-500', light: 'bg-teal-50 dark:bg-teal-500/10' },
        amber: { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50 dark:bg-amber-500/10' },
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center">
                    <BarChart3 size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Current Usage</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Resource utilization for your hotel</p>
                </div>
            </div>

            {/* Usage Bars */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {usageItems.map((item) => {
                    const Icon = item.icon
                    const isUnlimited = item.max === 9999
                    const percent = isUnlimited ? 20 : item.max > 0 ? Math.min((item.used / item.max) * 100, 100) : 0
                    const isHigh = percent > 80 && !isUnlimited
                    const colors = colorMap[item.color]

                    return (
                        <div key={item.label} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg ${colors.light} ${colors.text} flex items-center justify-center`}>
                                        <Icon size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg font-black ${isHigh ? 'text-red-500' : colors.text}`}>{item.used}</span>
                                    <span className="text-slate-400 text-sm"> / {isUnlimited ? '∞' : item.max}</span>
                                </div>
                            </div>
                            <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${isHigh ? 'bg-red-500' : colors.bg}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            {isHigh && (
                                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                    <AlertTriangle size={12} /> Approaching limit — consider upgrading
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Feature Toggles */}
            {activeToggles.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Feature Access</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeToggles.map((feat) => {
                            const Icon = feat.icon
                            return (
                                <div
                                    key={feat.label}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors ${feat.enabled
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                                        : 'bg-slate-50 dark:bg-slate-700/30 border-slate-100 dark:border-slate-700'
                                        }`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${feat.enabled
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                                        }`}>
                                        {feat.enabled ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon size={14} className={feat.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                                        <span className={`text-sm font-medium ${feat.enabled ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}`}>
                                            {feat.label}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
    const { currentHotel, refreshHotelData } = useAdmin()
    const router = useRouter()

    // Plans (existing)
    const [plans, setPlans] = useState([])
    const [loadingPlans, setLoadingPlans] = useState(true)
    const [loadingPlan, setLoadingPlan] = useState(null)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, planId: null })

    // New: subscription status & history
    const [subStatus, setSubStatus] = useState(null)
    const [loadingStatus, setLoadingStatus] = useState(true)
    const [history, setHistory] = useState(null)
    const [loadingHistory, setLoadingHistory] = useState(true)
    const [cancellingAutoRenew, setCancellingAutoRenew] = useState(false)

    const currentPlan = currentHotel?.subscriptionPlan || 'LITE'

    // Fetch plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiFetch('/subscriptions/plans')
                setPlans(data || [])
            } catch (error) {
                console.error('Failed to fetch plans:', error)
                toast.error('Failed to load subscription plans')
            } finally {
                setLoadingPlans(false)
            }
        }
        fetchPlans()
    }, [])

    // Fetch subscription status
    useEffect(() => {
        if (!currentHotel?.id) return
        const fetchStatus = async () => {
            setLoadingStatus(true)
            try {
                const data = await apiFetch(`/subscriptions/status/${currentHotel.id}`)
                setSubStatus(data)
            } catch (error) {
                console.error('Failed to fetch subscription status:', error)
            } finally {
                setLoadingStatus(false)
            }
        }
        fetchStatus()
    }, [currentHotel?.id])

    // Fetch payment history
    useEffect(() => {
        if (!currentHotel?.id) return
        const fetchHistory = async () => {
            setLoadingHistory(true)
            try {
                const data = await apiFetch(`/subscriptions/history/${currentHotel.id}`)
                setHistory(data)
            } catch (error) {
                console.error('Failed to fetch payment history:', error)
            } finally {
                setLoadingHistory(false)
            }
        }
        fetchHistory()
    }, [currentHotel?.id])

    // Handle Stripe return
    useEffect(() => {
        if (!router.isReady) return
        const { success, canceled } = router.query

        if (success) {
            toast.success('Payment successful! Your subscription has been upgraded.')
            refreshHotelData()
            router.replace('/admin/subscription', undefined, { shallow: true })
        }

        if (canceled) {
            toast.error('Payment was canceled or failed. Please try again.')
            router.replace('/admin/subscription', undefined, { shallow: true })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, router.query])

    // Cancel auto-renew
    const handleCancelAutoRenew = async () => {
        setCancellingAutoRenew(true)
        try {
            await apiFetch('/subscriptions/cancel-auto-renew', {
                method: 'POST',
                body: JSON.stringify({ hotelId: currentHotel.id })
            })
            toast.success('Auto-renewal has been cancelled.')
            // Refresh status
            const data = await apiFetch(`/subscriptions/status/${currentHotel.id}`)
            setSubStatus(data)
        } catch (error) {
            toast.error(error.message || 'Failed to cancel auto-renewal')
        } finally {
            setCancellingAutoRenew(false)
        }
    }

    // Pricing card helpers
    const iconMap = { Package, Rocket, Zap, Crown }

    const handleUpgradeClick = (planId) => {
        if (currentPlan === planId) return
        setConfirmModal({ isOpen: true, planId })
    }

    const handleUpgrade = async () => {
        if (!confirmModal.planId) return
        const planId = confirmModal.planId
        setConfirmModal({ isOpen: false, planId: null })

        setLoadingPlan(planId)
        try {
            const data = await apiFetch('/subscriptions/checkout-session', {
                method: 'POST',
                body: JSON.stringify({
                    hotelId: currentHotel.id,
                    planId: planId,
                    returnUrl: window.location.origin + window.location.pathname
                })
            })

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('Missing checkout URL')
            }
        } catch (error) {
            console.error('Upgrade failed:', error)
            toast.error(error.message || 'Failed to initiate checkout')
            setLoadingPlan(null)
        }
    }

    // Tailwind dynamic color maps
    const bgColors = { slate: 'bg-slate-500', teal: 'bg-teal-500', indigo: 'bg-indigo-500', blue: 'bg-blue-500', amber: 'bg-amber-500', emerald: 'bg-emerald-500', rose: 'bg-rose-500', purple: 'bg-purple-500' }
    const textColors = { slate: 'text-slate-500', teal: 'text-teal-500', indigo: 'text-indigo-500', blue: 'text-blue-500', amber: 'text-amber-500', emerald: 'text-emerald-500', rose: 'text-rose-500', purple: 'text-purple-500' }
    const borderColors = { slate: 'border-slate-500', teal: 'border-teal-500', indigo: 'border-indigo-500', blue: 'border-blue-500', amber: 'border-amber-500', emerald: 'border-emerald-500', rose: 'border-rose-500', purple: 'border-purple-500' }
    const shadowColors = { slate: 'shadow-slate-500/20', teal: 'shadow-teal-500/20', indigo: 'shadow-indigo-500/20', blue: 'shadow-blue-500/20', amber: 'shadow-amber-500/20', emerald: 'shadow-emerald-500/20', rose: 'shadow-rose-500/20', purple: 'shadow-purple-500/20' }

    // No hotel selected guard
    if (!currentHotel) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                        <Building2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select a Hotel First</h2>
                    <p className="text-slate-500 max-w-md">
                        You need to select a hotel from the top navigation bar before you can manage its subscription plan.
                    </p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <Head>
                <title>Subscription & Billing | BookingKub</title>
            </Head>

            <div className="max-w-6xl mx-auto space-y-10 pb-16">
                {/* Page Header */}
                <div className="pt-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Crown className="text-amber-500" size={36} />
                            Subscription & Billing
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Manage your plan, view payment history, and track your usage.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 border border-slate-100 dark:border-slate-700">
                        <Building2 size={16} />
                        <span className="font-medium">{currentHotel.name}</span>
                    </div>
                </div>

                {/* ──────── Section 1: Subscription Status ──────── */}
                <SubscriptionStatusCard
                    status={subStatus}
                    loading={loadingStatus}
                    onCancelAutoRenew={handleCancelAutoRenew}
                    cancellingAutoRenew={cancellingAutoRenew}
                />

                {/* ──────── Section 2: Pricing Cards ──────── */}
                <div id="pricing" className="scroll-mt-8">
                    <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                            Choose Your Plan
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Upgrade at any time to unlock more features and increase your limits.
                        </p>
                    </div>

                    {loadingPlans ? (
                        <div className="flex justify-center p-12">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={32} className="animate-spin text-indigo-500" />
                                <p className="text-sm text-slate-500">Loading plans...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
                            {plans.map((plan) => {
                                const Icon = iconMap[plan.icon] || Zap
                                const isActive = currentPlan === plan.id
                                const isLoading = loadingPlan === plan.id

                                let wrapperClasses = 'relative overflow-hidden rounded-3xl border-2 transition-all duration-300 p-8 flex flex-col bg-white dark:bg-slate-800'
                                if (isActive) {
                                    wrapperClasses += ` ${borderColors[plan.color]} ${shadowColors[plan.color]} shadow-2xl scale-[1.03] z-20`
                                } else if (plan.popular) {
                                    wrapperClasses += ` border-slate-200 dark:border-slate-700 shadow-xl opacity-95 hover:opacity-100 scale-100 md:scale-[1.03] z-10`
                                } else {
                                    wrapperClasses += ` border-slate-100 dark:border-slate-700 shadow-sm opacity-90 hover:opacity-100 hover:shadow-lg`
                                }

                                return (
                                    <div key={plan.id} className={wrapperClasses}>
                                        {plan.isPopular && !isActive && (
                                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 to-teal-500"></div>
                                        )}
                                        {isActive && (
                                            <div className={`absolute top-0 inset-x-0 h-1.5 ${bgColors[plan.color]}`}></div>
                                        )}

                                        <div className="mb-6 flex justify-between items-start">
                                            <div>
                                                <div className={`flex items-center gap-2 font-bold ${textColors[plan.color]} mb-2`}>
                                                    <Icon size={20} />
                                                    {plan.name}
                                                </div>
                                                <div className="text-slate-500 dark:text-slate-400 text-sm h-10">{plan.description}</div>
                                            </div>
                                            {plan.isPopular && !isActive && (
                                                <span className={`bg-${plan.color}-100 text-${plan.color}-700 dark:bg-${plan.color}-500/20 dark:text-${plan.color}-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                                                    Popular
                                                </span>
                                            )}
                                            {isActive && (
                                                <span className={`bg-${plan.color}-100 text-${plan.color}-700 dark:bg-${plan.color}-500/20 dark:text-${plan.color}-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1`}>
                                                    <Check size={14} /> Active
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-4 flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.priceLabel}</span>
                                            {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
                                        </div>

                                        <button
                                            onClick={() => handleUpgradeClick(plan.id)}
                                            disabled={isActive || isLoading}
                                            className={`w-full py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isActive
                                                ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 cursor-default'
                                                : `${bgColors[plan.color]} text-white shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`
                                                }`}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : isActive ? (
                                                <span className="flex items-center gap-2"><Check size={18} /> Current Plan</span>
                                            ) : (
                                                <>Upgrade to {plan.name} <Rocket size={18} /></>
                                            )}
                                        </button>

                                        <div className="mt-8 space-y-4 flex-1">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Features included</p>
                                            <ul className="space-y-3">
                                                {plan.features && plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                        <div className={`mt-0.5 rounded-full p-0.5 ${bgColors[plan.color]} text-white shrink-0`}>
                                                            <Check size={12} strokeWidth={3} />
                                                        </div>
                                                        {feature}
                                                    </li>
                                                ))}
                                                {plan.missingFeatures && plan.missingFeatures.map((feature, i) => (
                                                    <li key={`m-${i}`} className="flex items-start gap-3 text-sm text-slate-400 decoration-slate-300">
                                                        <div className="mt-0.5 rounded-full p-0.5 bg-slate-200 dark:bg-slate-700 text-slate-400 shrink-0">
                                                            <X size={12} strokeWidth={3} />
                                                        </div>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* ──────── Section 3: Payment History ──────── */}
                <PaymentHistorySection history={history} loading={loadingHistory} />

                {/* ──────── Section 4: Usage Overview ──────── */}
                <UsageOverviewSection currentHotel={currentHotel} status={subStatus} />
            </div>

            {/* Upgrade Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, planId: null })}
                onConfirm={handleUpgrade}
                title={`Upgrade to ${confirmModal.planId}?`}
                message={`You will be redirected to our secure payment gateway to complete the transaction for the ${confirmModal.planId} package.`}
                type="info"
                confirmText="Proceed to Checkout"
            />
        </AdminLayout>
    )
}
