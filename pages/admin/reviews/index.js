import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Star, CheckCircle, XCircle, MessageSquare, AlertCircle, Trash2 } from 'lucide-react'

export default function ReviewManagement() {
    const [reviews, setReviews] = useState([])
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, averageRating: 0 })
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')

    useEffect(() => {
        fetchReviews()
        fetchStats()
    }, [filter])

    const fetchReviews = async () => {
        setLoading(true)
        try {
            const data = await apiFetch(`/reviews/admin/all?status=${filter}`)
            setReviews(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const data = await apiFetch('/reviews/admin/stats')
            setStats(data)
        } catch (error) { console.error(error) }
    }

    const handleStatusUpdate = async (id, status) => {
        try {
            await apiFetch(`/reviews/admin/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            fetchReviews()
            fetchStats()
        } catch (error) {
            alert('Action failed')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            await apiFetch(`/reviews/admin/${id}`, { method: 'DELETE' })
            fetchReviews()
            fetchStats()
        } catch (error) {
            alert('Delete failed')
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Approved</span>
            case 'rejected': return <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Rejected</span>
            default: return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Pending</span>
        }
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
        ))
    }

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Review Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Moderate guest feedback and approvals</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><MessageSquare size={24} /></div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
                    </div>
                    <p className="text-sm text-slate-500">Total Reviews</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={24} /></div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</span>
                    </div>
                    <p className="text-sm text-slate-500">Pending Approval</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24} /></div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.approved}</span>
                    </div>
                    <p className="text-sm text-slate-500">Approved Publicly</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Star size={24} /></div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{Number(stats.averageRating).toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-slate-500">Average Rating</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-1">
                {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 font-medium text-sm transition-colors relative ${filter === status ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}
                    >
                        {status}
                        {filter === status && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></span>}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Guest</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Comment</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="5" className="p-12 text-center text-slate-400">Loading reviews...</td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan="5" className="p-12 text-center text-slate-400">No reviews found in this category.</td></tr>
                            ) : (
                                reviews.map(review => (
                                    <tr key={review.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{review.user?.name || 'Anonymous'}</p>
                                            <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-0.5">
                                                {renderStars(review.rating)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{review.comment}"</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(review.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                    className={`p-2 rounded-lg transition-colors ${review.status === 'approved' ? 'bg-emerald-100 text-emerald-600 cursor-default' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                                                    title="Approve"
                                                    disabled={review.status === 'approved'}
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                    className={`p-2 rounded-lg transition-colors ${review.status === 'rejected' ? 'bg-rose-100 text-rose-600 cursor-default' : 'text-rose-600 bg-rose-50 hover:bg-rose-100'}`}
                                                    title="Reject"
                                                    disabled={review.status === 'rejected'}
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </AdminLayout>
    )
}
