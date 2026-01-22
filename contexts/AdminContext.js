import { createContext, useContext, useState } from 'react'

const AdminContext = createContext()

export function AdminProvider({ children }) {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <AdminContext.Provider value={{ searchQuery, setSearchQuery }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    return useContext(AdminContext)
}
