import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { apiFetch } from '@/lib/api'

const AdminContext = createContext()

export function AdminProvider({ children }) {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [currentHotel, setCurrentHotel] = useState(null)
    const [allHotels, setAllHotels] = useState([])

    useEffect(() => {
        if (!user) return;

        const assignedHotelId = user.roleAssignments?.[0]?.hotelId;

        if (assignedHotelId) {
            // 1. Regular Admin/Owner: Fetch assigned hotel
            apiFetch(`/hotels/${assignedHotelId}`)
                .then(data => setCurrentHotel(data))
                .catch(e => console.error("Failed to fetch hotel specific data", e));
        } else if (user.roles?.includes('platform_admin')) {
            // 2. Super Admin (Platform)
            apiFetch('/hotels')
                .then(data => {
                    setAllHotels(data || []);
                    // Default to first hotel if not already set or invalid
                    if (data && data.length > 0) {
                        setCurrentHotel(prev => {
                            if (prev && data.find(h => h.id === prev.id)) return prev;
                            return data[0];
                        });
                    }
                })
                .catch(e => console.error("Failed to fetch hotels for platform admin", e));
        }
    }, [user])

    const switchHotel = (hotelId) => {
        const target = allHotels.find(h => h.id === hotelId);
        if (target) setCurrentHotel(target);
    }

    return (
        <AdminContext.Provider value={{ searchQuery, setSearchQuery, currentHotel, setCurrentHotel, allHotels, switchHotel }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    return useContext(AdminContext)
}
