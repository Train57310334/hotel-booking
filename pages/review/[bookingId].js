import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api'
import Layout from '@/components/Layout'
import { Star, Loader2, Calendar, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReviewBooking() {
    const router = useRouter()
    const { bookingId } = router.query
    const { user, loading: authLoading } = useAuth()

    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [hoveredStar, setHoveredStar] = useState(0)

    useEffect(() => {
        if (!router.isReady) return;
        if (!authLoading && !user) {
            // Redirect to login, preserving where they were going
            router.push(`/auth/login?returnUrl=/review/${bookingId}`)
        } else if (user && bookingId) {
            fetchBookingDetails()
        }
    }, [router.isReady, authLoading, user, bookingId])

    const fetchBookingDetails = async () => {
        try {
            // Re-using the get-one booking endpoint if available, or fetch all and find (less efficient but works if no ID endpoint)
            // Assuming GET /bookings/:id exists or we filter from list. 
            // Better to try GET /bookings/:id first.
            const res = await apiFetch(`/bookings/${bookingId}`)
            setBooking(res)
        } catch (error) {
            console.error(error)
            toast.error('Could not load booking details')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await apiFetch('/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hotelId: booking.hotelId,
                    rating,
                    comment
                })
            })
            toast.success('Review submitted successfully!')
            setTimeout(() => router.push('/account/bookings'), 2000)
        } catch (error) {
            console.error(error)
            toast.error('Failed to submit review')
            setSubmitting(false)
        }
    }

    if (authLoading || loading) return (
        <Layout>
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
            </div>
        </Layout>
    )

    if (!booking) return (
        <Layout>
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-slate-900">Booking not found</h1>
            </div>
        </Layout>
    )

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-emerald-600 p-8 text-white text-center">
                        <h1 className="text-3xl font-display font-bold mb-2">How was your stay?</h1>
                        <p className="text-emerald-100">Your feedback helps us improve.</p>
                    </div>

                    {/* Booking Context */}
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex gap-4 items-start">
                            <img
                                src={booking.hotel?.imageUrl || '/images/hero-bg.png'}
                                alt={booking.hotel?.name}
                                className="w-24 h-24 object-cover rounded-xl shadow-sm"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{booking.hotel?.name}</h2>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                    <MapPin size={14} /> {booking.hotel?.city}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                    <Calendar size={14} />
                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Review Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Star Rating */}
                            <div className="text-center">
                                <label className="block text-sm font-medium text-slate-700 mb-4">Rate your experience</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                size={40}
                                                className={`transition-colors ${star <= (hoveredStar || rating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-slate-200'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-amber-500 font-medium mt-2">
                                    {hoveredStar || rating} out of 5 stars
                                </p>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Share your thoughts (optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none"
                                    placeholder="What did you like? What could be improved?"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
