import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { apiFetch } from '@/lib/api'
import { useRouter } from 'next/router'

const AdminContext = createContext()

export function AdminProvider({ children }) {
    const { user } = useAuth()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [currentHotel, setCurrentHotel] = useState(null)
    const [allHotels, setAllHotels] = useState([])

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

    // Intercept upgrade clicks to route to the new SaaS pricing page
    const openUpgradeModal = () => router.push('/admin/subscription')
    const closeUpgradeModal = () => setIsUpgradeModalOpen(false)

    useEffect(() => {
        if (!user) return;

        const isPlatformAdmin = user.roles?.includes('platform_admin');
        const isImpersonating = user.isImpersonating;

        if (isPlatformAdmin && !isImpersonating) {
            // 1. Super Admin (normal login): load all hotels for the switcher
            // but do NOT auto-select any hotel — they have their own Super Admin dashboard
            apiFetch('/hotels')
                .then(data => {
                    setAllHotels(data || []);
                    setCurrentHotel(null); // Explicitly clear any lingering hotel state
                })
                .catch(e => console.error("Failed to fetch hotels for platform admin", e));
        } else {
            // 2. Regular Hotel Admin / Impersonating Super Admin: load their assigned hotel
            const assignedHotelId = user.roleAssignments?.[0]?.hotelId;
            if (assignedHotelId) {
                apiFetch(`/hotels/${assignedHotelId}`)
                    .then(data => setCurrentHotel(data))
                    .catch(e => console.error("Failed to fetch hotel specific data", e));
            }
        }
    }, [user])

    const switchHotel = (hotelId) => {
        const target = allHotels.find(h => h.id === hotelId);
        if (target) setCurrentHotel(target);
    }

    // Sync currentHotel.id → localStorage so apiFetch sends it as x-hotel-id header
    useEffect(() => {
        if (currentHotel?.id) {
            localStorage.setItem('hotelId', currentHotel.id);
        } else {
            localStorage.removeItem('hotelId');
        }
    }, [currentHotel?.id]);

    const refreshHotelData = async () => {
        if (!user) return;
        const isPlatformAdmin = user.roles?.includes('platform_admin');
        const isImpersonating = user.isImpersonating;
        if (isPlatformAdmin && !isImpersonating) return; // Super Admin has no single hotel to refresh
        const assignedHotelId = user.roleAssignments?.[0]?.hotelId;
        if (assignedHotelId) {
            try {
                const data = await apiFetch(`/hotels/${assignedHotelId}`);
                setCurrentHotel(data);
            } catch (e) {
                console.error("Failed to refresh hotel data", e);
            }
        }
    };

    return (
        <AdminContext.Provider value={{
            searchQuery, setSearchQuery,
            currentHotel, setCurrentHotel,
            allHotels, switchHotel,
            refreshHotelData,
            isUpgradeModalOpen, openUpgradeModal, closeUpgradeModal
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    return useContext(AdminContext)
}
