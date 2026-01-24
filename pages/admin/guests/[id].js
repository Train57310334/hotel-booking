import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { apiFetch } from '@/lib/api'
import { User, Mail, Phone, Calendar, Star, Tag, StickyNote, Save, Clock, ArrowLeft } from 'lucide-react'

export default function GuestProfile() {
    const router = useRouter()
    const { id } = router.query
    const [guest, setGuest] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // CRM State
    const [tags, setTags] = useState([])
    const [notes, setNotes] = useState('')
    const [preferences, setPreferences] = useState('')

    const availableTags = ['VIP', 'Regular', 'Corporate', 'Blacklist', 'Long Stay', 'Family']

    useEffect(() => {
        if (id) fetchGuest()
    }, [id])

    const fetchGuest = async () => {
        try {
            const data = await apiFetch(`/users/${id}`) // Assuming users/:id endpoint exists/works
            setGuest(data)
            setTags(data.tags || [])
            setNotes(data.notes || '')
            setPreferences(data.preferences || '')
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveCRM = async () => {
        setSaving(true)
        try {
            await apiFetch(`/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags, notes, preferences })
            })
            alert('Guest profile updated!')
        } catch (error) {
            alert('Failed to update')
        } finally {
            setSaving(false)
        }
    }

    const toggleTag = (tag) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag))
        } else {
            setTags([...tags, tag])
        }
    }

    if (loading) return <AdminLayout><div className="flex justify-center p-12">Loading Profile...</div></AdminLayout>
    if (!guest) return <AdminLayout><div className="p-12 text-center">Guest not found</div></AdminLayout>

    return (
        <AdminLayout>
            <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-700 mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Guest List
            </button>

            {/* Profile Header */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl font-bold dark:bg-emerald-500/20">
                        {guest.name?.[0] || 'G'}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{guest.name || 'Unknown Guest'}</h1>
                            {tags.map(tag => (
                                <span key={tag} className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${tag === 'VIP' ? 'bg-amber-100 text-amber-700' :
                                        tag === 'Blacklist' ? 'bg-slate-900 text-white' :
                                            'bg-slate-100 text-slate-600'
                                    }`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-4 text-slate-500 dark:text-slate-400 text-sm">
                            <span className="flex items-center gap-2"><Mail size={16} /> {guest.email}</span>
                            {guest.phone && <span className="flex items-center gap-2"><Phone size={16} /> {guest.phone}</span>}
                            <span className="flex items-center gap-2"><Clock size={16} /> Joined {new Date(guest.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm text-slate-400">Total Spend</p>
                        <p className="text-2xl font-bold text-emerald-600">฿{guest.bookings?.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString() || 0}</p>
                        <p className="text-xs text-slate-400">{guest._count?.bookings || 0} Bookings</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CRM Controls */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bookings History */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-blue-500" /> Booking History
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500">
                                    <tr>
                                        <th className="p-3 rounded-l-lg">Ref</th>
                                        <th className="p-3">Dates</th>
                                        <th className="p-3">Room</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3 rounded-r-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {guest.bookings?.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="p-3 font-mono text-slate-500">#{b.id.slice(-6).toUpperCase()}</td>
                                            <td className="p-3">
                                                {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">{b.roomType?.name || 'Standard'}</td>
                                            <td className="p-3 font-bold">฿{b.totalAmount.toLocaleString()}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {!guest.bookings?.length && (
                                        <tr><td colSpan="5" className="p-6 text-center text-slate-400">No booking history available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar CRM */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Tag size={20} className="text-amber-500" /> Tags
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${tags.includes(tag)
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <StickyNote size={20} className="text-emerald-500" /> Private Notes
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Internal notes about this guest (e.g. Do not disturb preference, allergies...)"
                            className="w-full h-32 p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Star size={20} className="text-indigo-500" /> Preferences
                        </h3>
                        <textarea
                            value={preferences}
                            onChange={(e) => setPreferences(e.target.value)}
                            placeholder="Room preferences (High floor, Extra pillows...)"
                            className="w-full h-24 p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>

                    <button
                        onClick={handleSaveCRM}
                        disabled={saving}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </AdminLayout>
    )
}
