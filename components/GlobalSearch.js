import { useState, useEffect, useRef } from 'react'
import { Search, User, Calendar, BedDouble, Loader2, X, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/router'
import { apiFetch } from '@/lib/api'
import { useAdmin } from '@/contexts/AdminContext'

export default function GlobalSearch() {
    const router = useRouter()
    const { setSearchQuery: setContextSearch, currentHotel } = useAdmin() || {}
    const [query, setQuery] = useState('')
    const [results, setResults] = useState({ users: [], bookings: [], rooms: [], roomTypes: [] })
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const containerRef = useRef(null)

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 2) {
                performSearch()
            } else {
                setResults({ users: [], bookings: [], rooms: [], roomTypes: [] })
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [query])

    // Keyboard Shortcuts (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                // Focus input if not open, or toggle? Usually just open/focus.
                setIsOpen(true)
                // We need a ref to the input to focus it
                // Let's modify the component to hold input ref
                document.getElementById('global-search-input')?.focus()
            }
            // Close on Escape
            if (e.key === 'Escape') {
                setIsOpen(false)
                document.getElementById('global-search-input')?.blur()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const performSearch = async () => {
        setIsLoading(true)
        setIsOpen(true)
        try {
            // const data = await apiFetch(`/search/global?q=${encodeURIComponent(query)}`) 
            // Note: Update path based on actual Controller route prefix, assumed /api/search/global
            const hotelId = currentHotel?.id
            const url = `/search/global?q=${encodeURIComponent(query)}${hotelId ? `&hotelId=${hotelId}` : ''}`
            const data = await apiFetch(url)
            setResults(data)
        } catch (error) {
            console.error("Search failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsOpen(false)
            if (setContextSearch) setContextSearch(query)
            // Optional: If on a non-searchable page, maybe redirect to Dashboard or All Bookings?
        }
    }

    const clearSearch = () => {
        setQuery('')
        setIsOpen(false)
        if (setContextSearch) setContextSearch('')
    }

    // Navigation Handlers
    const handleUserClick = (id) => {
        router.push(`/admin/guests/${id}`)
        setIsOpen(false)
    }

    const handleBookingClick = (id) => {
        // Go to bookings page and filter by this ID
        if (setContextSearch) setContextSearch(id)
        router.push('/admin/bookings')
        setIsOpen(false)
    }

    const handleRoomClick = (roomNumber) => {
        if (setContextSearch) setContextSearch(roomNumber)
        router.push('/admin/rooms')
        setIsOpen(false)
    }

    const hasResults = results.users.length > 0 || results.bookings.length > 0 || results.rooms.length > 0 || results.roomTypes.length > 0

    return (
        <div className="relative w-full max-w-sm" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    id="global-search-input"
                    type="text"
                    placeholder="Search anything (cmd+k)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm focus:shadow-md"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-[80vh] overflow-y-auto scrollbar-hide z-50 animate-in fade-in zoom-in-95 duration-200">
                    {!hasResults && !isLoading ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No results found for "{query}"
                        </div>
                    ) : (
                        <div className="py-2">
                            {/* Guests Section */}
                            {results.users.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <User size={12} /> Guests
                                    </div>
                                    {results.users.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => handleUserClick(user.id)}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                {user.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500">{user.email || user.phone}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Bookings Section */}
                            {results.bookings.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Calendar size={12} /> Bookings
                                    </div>
                                    {results.bookings.map(booking => (
                                        <button
                                            key={booking.id}
                                            onClick={() => handleBookingClick(booking.id)}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                #{booking.id.slice(-4)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{booking.leadName}</p>
                                                <p className="text-xs text-slate-500">
                                                    {booking.roomType?.name || 'Room'} • {new Date(booking.checkIn).toLocaleDateString('en-GB')}
                                                </p>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Rooms Section */}
                            {(results.rooms.length > 0 || results.roomTypes.length > 0) && (
                                <div>
                                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <BedDouble size={12} /> Inventory
                                    </div>
                                    {results.roomTypes.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => handleRoomClick(type.name)}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                                                RT
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{type.name} (Type)</p>
                                                <p className="text-xs text-slate-500">Base Price: ฿{type.basePrice}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {results.rooms.map(room => (
                                        <button
                                            key={room.id}
                                            onClick={() => handleRoomClick(room.roomNumber)}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                                                {room.roomNumber}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">Room {room.roomNumber}</p>
                                                <p className="text-xs text-slate-500">{room.roomType?.name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="px-4 py-2 mt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-center text-slate-400">
                                Press <kbd className="font-sans px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">Enter</kbd> to filter current page
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
