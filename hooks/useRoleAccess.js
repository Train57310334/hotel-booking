import { useAuth } from '@/contexts/AuthContext'
import { useAdmin } from '@/contexts/AdminContext'

// Centralized Role Hierarchy & Permissions
export const ROLE_PERMISSIONS = {
    hotel_admin: ['dashboard', 'bookings', 'calendar', 'guests', 'rooms', 'rates', 'promotions', 'reviews', 'reports', 'payments', 'staff', 'messages', 'housekeeping', 'settings', 'subscription', 'widget'],
    admin: ['dashboard', 'bookings', 'calendar', 'guests', 'rooms', 'rates', 'promotions', 'reviews', 'reports', 'payments', 'staff', 'messages', 'housekeeping', 'settings', 'subscription', 'widget'],
    manager: ['dashboard', 'bookings', 'calendar', 'guests', 'rooms', 'rates', 'promotions', 'reviews', 'reports', 'payments', 'staff', 'messages', 'housekeeping'],
    reception: ['dashboard', 'bookings', 'calendar', 'guests', 'rooms', 'reviews', 'messages', 'housekeeping'], // Housekeeping is view-only or status-update
    housekeeper: ['housekeeping'],
};

// Owner is a dynamic override: has all access
export const isOwnerOrAdmin = (role) => ['owner', 'admin', 'hotel_admin'].includes(role)

export function useRoleAccess() {
    const { user } = useAuth()
    const { currentHotel } = useAdmin() || {}

    const isPlatformAdmin = user?.roles?.includes('platform_admin')

    const getRole = () => {
        if (isPlatformAdmin) return 'platform_admin'
        if (!currentHotel) return null

        const assignment = user?.roleAssignments?.find(r => r.hotelId === currentHotel.id)
        return assignment?.role || null
    }

    const role = getRole()

    const hasAccess = (feature) => {
        if (isPlatformAdmin) return true // Platform admin can view all
        if (!role) return false
        if (isOwnerOrAdmin(role)) return true // Owner & Admin have full hotel access

        // Check specific role permissions
        const permissions = ROLE_PERMISSIONS[role] || []
        return permissions.includes(feature)
    }

    return {
        role,
        hasAccess,
        isOwner: role === 'owner',
        isAdmin: isOwnerOrAdmin(role),
        isManager: role === 'manager',
        isReception: role === 'reception',
        isHousekeeper: role === 'housekeeper',
        isPlatformAdmin
    }
}
