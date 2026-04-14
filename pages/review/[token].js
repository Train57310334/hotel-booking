import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Star, CheckCircle, AlertTriangle, Hotel } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch(path, opts = {}) {
    const res = await fetch(`${API}${path}`, {
        headers: { 'Content-Type': 'application/json', ...opts.headers },
        ...opts,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Request failed');
    }
    return res.json();
}

export default function ReviewPage() {
    const router = useRouter();
    const { token } = router.query;

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!token) return;
        apiFetch(`/reviews/request/${token}`)
            .then(setBooking)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;
        setSubmitting(true);
        try {
            await apiFetch(`/reviews/request/${token}`, {
                method: 'POST',
                body: JSON.stringify({ rating, comment }),
            });
            setSubmitted(true);
        } catch (e) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const ratingColors = ['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-blue-500', 'text-teal-500'];

    return (
        <>
            <Head>
                <title>Leave a Review{booking ? ` — ${booking.hotelName}` : ''}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    background: '#fff',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        padding: '32px 28px 24px',
                        color: '#fff',
                    }}>
                        {booking?.hotelLogo ? (
                            <img src={booking.hotelLogo} alt={booking.hotelName}
                                style={{ height: '40px', objectFit: 'contain', marginBottom: '12px', filter: 'brightness(0) invert(1)' }} />
                        ) : (
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏨</div>
                        )}
                        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>
                            {loading ? 'Loading...' : error ? 'Review Link' : `How was your stay?`}
                        </h1>
                        {booking && (
                            <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '14px' }}>
                                {booking.hotelName} · {booking.roomType}
                            </p>
                        )}
                    </div>

                    <div style={{ padding: '28px' }}>
                        {/* Loading */}
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'pulse 1s infinite' }}>⭐</div>
                                <p>Loading your review form...</p>
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <div style={{ textAlign: 'center', padding: '24px' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
                                <h3 style={{ color: '#1e293b', margin: '0 0 8px' }}>Link Invalid or Expired</h3>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>{error}</p>
                            </div>
                        )}

                        {/* Success */}
                        {submitted && (
                            <div style={{ textAlign: 'center', padding: '24px' }}>
                                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
                                <h2 style={{ color: '#1e293b', margin: '0 0 8px' }}>Thank you, {booking?.guestName}!</h2>
                                <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6 }}>
                                    Your review has been submitted and will appear after moderation.<br />
                                    We hope to see you again soon!
                                </p>
                                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                                    {[1,2,3,4,5].map(s => (
                                        <span key={s} style={{ fontSize: '28px', color: s <= rating ? '#f59e0b' : '#e2e8f0' }}>★</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Review Form */}
                        {!loading && !error && !submitted && booking && (
                            <form onSubmit={handleSubmit}>
                                <p style={{ color: '#475569', fontSize: '15px', marginTop: 0 }}>
                                    Hi <strong>{booking.guestName}</strong>! We'd love to hear about your experience.
                                </p>

                                {/* Star Rating */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontWeight: 700, color: '#1e293b', marginBottom: '12px', fontSize: '14px' }}>
                                        Your Rating *
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                                        {[1,2,3,4,5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHover(star)}
                                                onMouseLeave={() => setHover(0)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    fontSize: '44px',
                                                    color: star <= (hover || rating) ? '#f59e0b' : '#e2e8f0',
                                                    transition: 'transform 0.1s, color 0.1s',
                                                    transform: star <= (hover || rating) ? 'scale(1.15)' : 'scale(1)',
                                                    lineHeight: 1,
                                                }}
                                            >★</button>
                                        ))}
                                    </div>
                                    {(hover || rating) > 0 && (
                                        <p style={{
                                            textAlign: 'center',
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            margin: 0,
                                            color: hover
                                                ? ['','#ef4444','#f97316','#f59e0b','#3b82f6','#14b8a6'][hover]
                                                : ['','#ef4444','#f97316','#f59e0b','#3b82f6','#14b8a6'][rating]
                                        }}>
                                            {ratingLabels[hover || rating]}
                                        </p>
                                    )}
                                </div>

                                {/* Comment */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontWeight: 700, color: '#1e293b', marginBottom: '8px', fontSize: '14px' }}>
                                        Your Comments (optional)
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="Tell us about your experience — what did you love? Anything we can improve?"
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            border: '1.5px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            lineHeight: 1.6,
                                            color: '#1e293b',
                                            resize: 'vertical',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={rating === 0 || submitting}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: rating === 0 ? '#94a3b8' : '#2563eb',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        cursor: rating === 0 || submitting ? 'not-allowed' : 'pointer',
                                        transition: 'background 0.2s',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    {submitting ? '⏳ Submitting...' : rating === 0 ? 'Select a Star Rating First' : `Submit ${ratingLabels[rating]} Review ⭐`}
                                </button>

                                <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '16px', marginBottom: 0 }}>
                                    This link can only be used once.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
