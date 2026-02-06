import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { apiFetch } from '@/lib/api'

const AdminContext = createContext()

export function AdminProvider({ children }) {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [currentHotel, setCurrentHotel] = useState(null)

    useEffect(() => {
        if (user?.roleAssignments?.[0]?.hotelId) {
            const fetchHotelStr = async () => {
                try {
                    const data = await apiFetch(`/hotels/${user.roleAssignments[0].hotelId}`)
                    setCurrentHotel(data)
                } catch (e) {
                    console.error("Failed to fetch hotel specific data", e)
                }
            }
            fetchHotelStr()
        }
    }, [user])

    return (
        <AdminContext.Provider value={{ searchQuery, setSearchQuery, currentHotel, setCurrentHotel }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    return useContext(AdminContext)
}
